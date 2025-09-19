import { anthropic } from "@ai-sdk/anthropic"
import { streamText } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    const result = streamText({
      model: anthropic("claude-3-5-sonnet-latest"),
      messages,
      system: `You are Genie, a helpful AI assistant that specializes in analyzing and answering questions about PDF documents. 
      
      When users ask questions about the PDF they've uploaded, provide clear, accurate, and helpful responses based on the document's content. 
      
      Always be friendly and professional in your responses. If you cannot find specific information in the PDF, let the user know and suggest alternative ways to help them.`,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
