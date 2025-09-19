"use client"

import React, { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Upload, FileText } from "lucide-react"

export default function UploadPage() {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const router = useRouter()

  const handleFileUpload = async (file: File) => {
    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file only.")
      return
    }

    setIsUploading(true)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("http://localhost:8000/upload_pdf", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) throw new Error("Upload failed")

      const data = await res.json()

      // Store for later use in chat
      sessionStorage.setItem("pdfFileName", data.display_name)
      sessionStorage.setItem("uploadedFileId", data.file_id)

      router.push("/chat")
    } catch (err) {
      alert("Failed to upload file.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  return (
    <div className="relative min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* Logo */}
      <div className="absolute top-40 left-1/2 transform -translate-x-1/2 mt-8">
        <Image src="/rp_logo.png" alt="Logo" width={350} height={350} />
      </div>

      <div className="max-w-md w-full mt-20">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#FA1C31] mb-2">GenieAI</h1>
          <p className="text-gray-600">Upload your PDF to start chatting</p>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver
              ? "border-[#FA1C31] bg-red-50"
              : "border-gray-300 bg-white hover:border-gray-400"
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragOver(true)
          }}
          onDragLeave={() => setIsDragOver(false)}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FA1C31] mb-4"></div>
              <p className="text-gray-600">Processing your PDF...</p>
            </div>
          ) : (
            <>
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-[#FA1C31] mb-2">Drop your PDF here</h3>
              <p className="text-gray-600 mb-4">or click to browse your files</p>

              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-4 py-2 bg-[#FA1C31] text-white rounded-lg hover:bg-red-700 cursor-pointer transition-colors"
              >
                <FileText className="w-4 h-4 mr-2" />
                Choose PDF File
              </label>
            </>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">Supported format: PDF files only</p>
        </div>
      </div>
    </div>
  )
}



