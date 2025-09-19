import React from "react"
import Image from "next/image"
import Link from "next/link"
import { Upload, FileText } from "lucide-react"

export default function HomePage() {
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

        <div className="border-2 border-dashed rounded-lg p-8 text-center transition-colors border-gray-300 bg-white hover:border-gray-400">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-[#FA1C31] mb-2">Ready to get started?</h3>
          <p className="text-gray-600 mb-4">Click below to upload your PDF</p>

          <Link
            href="/upload"
            className="inline-flex items-center px-4 py-2 bg-[#FA1C31] text-white rounded-lg hover:bg-red-700 cursor-pointer transition-colors"
          >
            <FileText className="w-4 h-4 mr-2" />
            Upload PDF File
          </Link>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">Supported format: PDF files only</p>
        </div>
      </div>
    </div>
  )
}
