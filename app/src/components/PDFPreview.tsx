'use client'

import { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

interface PDFPreviewProps {
    file: File | null
}

export function PDFPreview({ file }: PDFPreviewProps) {
    const [numPages, setNumPages] = useState<number | null>(null)

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages)
    }

    if (!file) return null

    return (
        <div className="mt-4">
            <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                className="border border-gray-300 rounded-lg overflow-hidden"
            >
                <Page pageNumber={1} width={300} />
            </Document>
            <p className="text-sm text-gray-500 mt-2">Page 1 of {numPages}</p>
        </div>
    )
}