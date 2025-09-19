import os
import io
import asyncio
import time
from datetime import datetime, timedelta
from typing import Optional, List, Union, Dict, Any
import tempfile 

from fastapi import FastAPI, UploadFile, File, HTTPException, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel

import google.generativeai as genai
from google.api_core.exceptions import GoogleAPIError

from dotenv import load_dotenv
load_dotenv()

from fastapi.middleware.cors import CORSMiddleware


from config import GOOGLE_API_KEY, FILE_API_CLEANUP_TIMEOUT_SECONDS

# Configure Gemini API
genai.configure(api_key=GOOGLE_API_KEY)

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # or "*" to allow all origins (use only for testing)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- In-memory session management ---
class ChatSession:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-1.5-pro-latest')
        self.chat = None # Will hold the genai.ChatSession object
        self.uploaded_file_name: Optional[str] = None # File API ID 
        self.uploaded_file_display_name: Optional[str] = None # Original filename
        self.last_accessed: datetime = datetime.now()
        self.file_reference_part: Optional[Dict[str, Any]] = None

session_manager = {}
SESSION_ID = "default_user_session"

class UploadPdfResponse(BaseModel):
    message: str
    file_id: str
    display_name: str

class ChatMessage(BaseModel):
    role: str
    content: str

class SendMessageRequest(BaseModel):
    message: str

class ChatHistoryResponse(BaseModel):
    history: List[ChatMessage]
    file_id: Optional[str] = None
    display_name: Optional[str] = None

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(cleanup_file_api_task())

async def cleanup_file_api_task():
    while True:
        await asyncio.sleep(60)
        session = session_manager.get(SESSION_ID)
        if session and session.uploaded_file_name:
            if datetime.now() - session.last_accessed > timedelta(seconds=FILE_API_CLEANUP_TIMEOUT_SECONDS):
                try:
                    genai.delete_file(session.uploaded_file_name)
                    session.uploaded_file_name = None
                    session.uploaded_file_display_name = None
                    session.file_reference_part = None
                    session.chat = None
                except Exception as e:
                    print(f"Cleanup error: {e}")

@app.post("/upload_pdf", response_model=UploadPdfResponse)
async def upload_pdf(file: UploadFile = File(...)):
    if not file.content_type == 'application/pdf':
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only PDF files are allowed.")

    file_content = await file.read()
    if not file_content:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty.")

    if SESSION_ID in session_manager and session_manager[SESSION_ID].uploaded_file_name:
        try:
            genai.delete_file(session_manager[SESSION_ID].uploaded_file_name)
        except:
            pass
        session_manager.pop(SESSION_ID, None)

    temp_file_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
            temp_file.write(file_content)
            temp_file_path = temp_file.name

        uploaded_file = genai.upload_file(
            temp_file_path,
            display_name=file.filename,
            mime_type='application/pdf'
        )

        while uploaded_file.state.name == 'PROCESSING':
            await asyncio.sleep(2)
            uploaded_file = genai.get_file(uploaded_file.name)

        if uploaded_file.state.name != 'ACTIVE':
            raise HTTPException(status_code=500, detail=f"File failed to process: {uploaded_file.state.name}")

        new_session = ChatSession()
        new_session.uploaded_file_name = uploaded_file.name
        new_session.uploaded_file_display_name = uploaded_file.display_name
        new_session.file_reference_part = {
            "file_data": {
                "mime_type": uploaded_file.mime_type,
                "file_uri": uploaded_file.uri
            }
        }
        new_session.chat = new_session.model.start_chat(history=[])
        session_manager[SESSION_ID] = new_session

        return UploadPdfResponse(
            message="PDF uploaded and session started.",
            file_id=uploaded_file.name,
            display_name=uploaded_file.display_name
        )
    finally:
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)

@app.post("/send_message")
async def send_message(request: SendMessageRequest) -> ChatHistoryResponse:
    session = session_manager.get(SESSION_ID)
    if not session:
        raise HTTPException(status_code=400, detail="No active session. Please upload a PDF first.")

    session.last_accessed = datetime.now()
    user_message_content: List[Union[str, Dict[str, Any]]] = [request.message]

    if not session.chat.history and session.file_reference_part:
        user_message_content.insert(0, session.file_reference_part)

    await session.chat.send_message_async(user_message_content)

    current_history = []
    for turn in session.chat.history:
        content_str = ""
        if hasattr(turn, 'parts'):
            for part in turn.parts:
                if hasattr(part, 'text') and part.text is not None:
                    content_str += part.text
                elif hasattr(part, 'file_data'):
                    content_str += f"[[Uploaded File: {session.uploaded_file_display_name}]]"
                elif isinstance(part, dict) and "file_data" in part:
                    content_str += f"[[Uploaded File: {session.uploaded_file_display_name}]]"
        elif hasattr(turn, 'text'):
            content_str += turn.text
        current_history.append(ChatMessage(role=turn.role, content=content_str))

    return ChatHistoryResponse(
        history=current_history,
        file_id=session.uploaded_file_name,
        display_name=session.uploaded_file_display_name
    )


@app.post("/new_chat")
async def new_chat():
    session = session_manager.pop(SESSION_ID, None)
    if session and session.uploaded_file_name:
        try:
            genai.delete_file(session.uploaded_file_name)
        except:
            pass
    return {"message": "New chat session started. Previous PDF and history cleared."}
    