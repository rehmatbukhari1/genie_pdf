# 🤖 Genie ChatBot

Genie ChatBot is a full-stack AI-powered PDF assistant that allows users to upload PDF documents and ask questions based on the content. It leverages a FastAPI backend integrated with Google's Gemini 1.5 Pro model and a modern Next.js + Tailwind CSS frontend.

---

## 📁 Project Structure

```
.
├── backend
│   ├── main.py                # FastAPI app with endpoints
│   ├── config.py              # Backend configuration
│   ├── requirments.txt        # Python dependencies
│   └── __pycache__/           # Python cache files
├── app
│   ├── api
│   │   └── chat
│   │       └── route.ts       # API route for chat functionality
│   ├── chat
│   │   └── page.tsx           # Main chat interface
│   ├── globals.css            # Global CSS styles
│   ├── layout.tsx             # Root layout component
│   └── page.tsx               # Home page
├── components
│   ├── theme-provider.tsx     # Theme context provider
│   └── ui/                    # Reusable UI components (shadcn/ui)
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       └── ... (many more UI components)
├── hooks
│   ├── use-mobile.tsx         # Mobile detection hook
│   └── use-toast.ts           # Toast notification hook
├── lib
│   └── utils.ts               # Utility functions
├── public
│   ├── genie-icon.png         # Genie icon
│   ├── rp_logo.png            # Logo used in the browser tab and UI
│   └── ... (other assets)
├── styles
│   └── globals.css            # Additional global styles
├── .env                       # Environment variables
├── next.config.mjs            # Next.js config
├── tailwind.config.ts         # Tailwind customization
├── tsconfig.json              # TypeScript config
├── package.json               # Node.js dependencies
└── pnpm-lock.yaml             # Package lock file
```

---

## 🧪 Requirements

### Node.js

* Version: **v18+** (recommended)
* Install using:

  ```bash
  nvm install 18
  nvm use 18
  ```

### Python

* Version: **Python 3.10+** (recommended)
* Create a virtual environment and activate it:

  ```bash
  python -m venv venv
  source venv/bin/activate    # Mac/Linux
  venv\Scripts\activate.bat   # Windows
  ```

---

## 🔧 Installation

### 1. Backend Setup (FastAPI + Gemini)

```bash
cd backend
pip install -r requirments.txt
```

> Make sure to add your Google Gemini API key in the `.env` file.

### 2. Frontend Setup (Next.js + Tailwind)

```bash
# Using npm
npm install --legacy-peer-deps

# Or using pnpm (recommended)
pnpm install
```

---

## 🚀 Running the App

### Start Backend Server

```bash
uvicorn main:app --reload --port 8000
```

* Endpoint to upload PDF: `POST /upload_pdf`
* Endpoint to send chat: `POST /send_message`

### Start Frontend

```bash
# Using npm
npm run dev

# Or using pnpm
pnpm dev
```

> App will be accessible at: `http://localhost:3000`

---

## 🧠 Features

* Upload a PDF and chat with it using Gemini 1.5 Pro.
* PDF filename is stored in session storage.
* Styled beautifully with Tailwind CSS and shadcn/ui components.
* Modern, responsive UI with dark/light theme support.
* Includes thinking animation and PDF-specific formatting for chatbot responses.
* Responses support headings, bold, lists, and markdown-like formatting.
* Comprehensive UI component library for consistent design.

---

## 🖼️ Customization

### Change Logo:

* Replace `public/rp_logo.png` with your own logo file.
* Make sure it matches the name or update the `img` tag in `page.tsx` accordingly.

### Change Tab Title and Favicon:

* Update in `app/layout.tsx` or `app/head.tsx`:

```tsx
export const metadata = {
  title: "GenieChatbot",
  icons: [{ rel: "icon", url: "/rp_logo.png" }]
}
```

---

## 🧼 To Move Project to Another PC

Copy the following folders and files:

* `backend`
* `app`
* `public`
* `components`
* `hooks`
* `lib`
* `styles`
* `.env`
* `package.json`, `package-lock.json` or `pnpm-lock.yaml`
* `requirments.txt`
* `next.config.mjs`
* `tailwind.config.ts`
* `tsconfig.json`

Then re-run the installation steps.

---

## 🙌 Credits

Built with ❤️ using FastAPI, Gemini Pro, React, Tailwind, and Next.js.