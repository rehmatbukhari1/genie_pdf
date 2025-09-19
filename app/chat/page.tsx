"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Send, ArrowLeft, FileText, Bot, User } from "lucide-react";

function formatMessageContent(content: string) {
  const lines = content.split("\n").filter((line) => line.trim() !== "");
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="ml-6 list-disc text-gray-700 space-y-1">
          {listItems.map((item, i) => (
            <li key={i}>{renderInlineBold(item)}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  const renderInlineBold = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (/^\*\*[^*]+\*\*$/.test(part)) {
        return (
          <strong key={i} className="text-[#FA1C31]">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <React.Fragment key={i}>{part}</React.Fragment>;
    });
  };

  for (const line of lines) {
    const trimmedLine = line.trim();

    const bulletMatch = trimmedLine.match(/^\* (.+)/);
    if (bulletMatch) {
      listItems.push(bulletMatch[1]);
      continue;
    }

    flushList();
    elements.push(
      <p key={`para-${elements.length}`} className="text-gray-800">
        {renderInlineBold(trimmedLine)}
      </p>
    );
  }

  flushList();
  return <div className="font-montserrat space-y-2">{elements}</div>;
}

// rest of your code remains unchanged


export default function ChatPage() {
  const [pdfFileName, setPdfFileName] = useState<string>("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedFileName = sessionStorage.getItem("pdfFileName");
    if (!storedFileName) {
      router.push("/");
      return;
    }
    setPdfFileName(storedFileName);
  }, [router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleBackToUpload = () => {
    sessionStorage.removeItem("uploadedPDF");
    sessionStorage.removeItem("pdfFileName");
    router.push("/");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:8000/send_message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      if (!res.ok) throw new Error("Failed to get response");

      const data = await res.json();
      setMessages(data.history);
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <button
            onClick={handleBackToUpload}
            className="flex items-center px-3 py-2 text-gray-600 hover:text-[#FA1C31] hover:bg-gray-50 rounded-lg transition-all duration-200 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back</span>
          </button>

          <div className="flex items-center bg-gradient-to-r from-[#FA1C31]/10 to-red-50 px-4 py-2 rounded-full border border-[#FA1C31]/20">
            <FileText className="w-5 h-5 text-[#FA1C31] mr-3" />
            <h1 className="text-lg font-bold text-[#FA1C31] truncate max-w-md font-montserrat">{pdfFileName}</h1>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500 font-medium">Powered by</span>
            <div className="w-24 h-10 relative ">
              <div className="w-24 h-10 relative ">
                <img
                  src="/rp_logo.png" // Replace with your actual image path
                  alt="Genie Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-16">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50 max-w-2xl mx-auto">
                <div className="w-16 h-16 bg-gradient-to-br from-[#FA1C31] to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#FA1C31] mb-4 font-montserrat">Welcome to Genie!</h2>
                <p className="text-gray-600 font-montserrat leading-relaxed">
                  I've successfully loaded your PDF: <strong className="text-[#FA1C31]">{pdfFileName}</strong>
                  <br />
                  <span className="text-sm mt-2 block">
                    Ask me anything about the document and I'll provide detailed answers.
                  </span>
                </p>
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} mb-6`}>
              <div
                className={`flex items-start space-x-3 max-w-4xl ${message.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${message.role === "user"
                    ? "bg-gradient-to-br from-[#FA1C31] to-red-600"
                    : "bg-gradient-to-br from-gray-100 to-gray-200"
                    }`}
                >
                  {message.role === "user" ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-gray-600" />
                  )}
                </div>

                <div
                  className={`rounded-2xl px-6 py-4 shadow-lg backdrop-blur-sm border ${message.role === "user"
                      ? "bg-gradient-to-br from-[#FA1C31]/10 to-red-50 text-white border-[#fca5a5]"
                      : "bg-white/80 text-gray-800 border-gray-200/50"
                    } ${message.role === "user" ? "rounded-tr-md" : "rounded-tl-md"}`}
                >

                  <div className={message.role === "user" ? "text-white" : ""}>
                    {formatMessageContent(message.content)}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start mb-6">
              <div className="flex items-start space-x-3 max-w-4xl">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0 shadow-md">
                  <Bot className="w-5 h-5 text-gray-600" />
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl rounded-tl-md px-6 py-4 shadow-lg border border-gray-200/50">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-[#FA1C31] rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-[#FA1C31] rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-[#FA1C31] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                    <span className="text-sm text-gray-600 font-montserrat font-medium">Genie is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50 px-4 py-6 sticky bottom-0">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex space-x-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Genie about your PDF..."
                className="w-full border border-gray-300/50 rounded-2xl px-6 py-4 pr-4 focus:outline-none focus:ring-2 focus:ring-[#FA1C31]/50 focus:border-[#FA1C31]/50 font-montserrat bg-white/70 backdrop-blur-sm shadow-lg transition-all duration-200 placeholder-gray-400"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-gradient-to-r from-[#FA1C31] to-red-600 text-white px-8 py-4 rounded-2xl hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none group"
            >
              <Send className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}