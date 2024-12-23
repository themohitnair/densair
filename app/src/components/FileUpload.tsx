'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload } from 'lucide-react'

interface FileUploadProps {
    onFileUpload: (file: File) => void
}

export function FileUpload({ onFileUpload }: FileUploadProps) {
    const [fileName, setFileName] = useState<string | null>(null)

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0]
            setFileName(file.name)
            onFileUpload(file)
        }
    }, [onFileUpload])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        multiple: false
    })

    return (
        <div
            {...getRootProps()}
            className={`border-2 border-gray-600 border-dashed rounded-lg p-4 sm:p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-blue-500 bg-blue-500 bg-opacity-10' : 'hover:border-gray-500'
            }`}
        >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-blue-500" />
            {fileName ? (
                <p className="mt-2 text-sm sm:text-base text-gray-300">{fileName}</p>
            ) : (
                <p className="mt-2 text-xs sm:text-sm text-gray-400">
                    Drag & drop a PDF file here, or click to select one
                </p>
            )}
        </div>
    )
}