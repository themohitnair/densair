'use client'

import { useState } from 'react'
import { FileUpload } from './FileUpload'
import { PageRangeInput } from './PageRangeInput'
import { EstimationResult } from './EstimationResult'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

type EstimationResultType = {
    price: number;
    tokens: number;
    paymentLink: string;
};

export function DensAirApp() {
    const [file, setFile] = useState<File | null>(null)
    const [startPage, setStartPage] = useState('')
    const [endPage, setEndPage] = useState('')
    const [estimationResult, setEstimationResult] = useState<EstimationResultType | null>(null);
    const [isFileReady, setIsFileReady] = useState(false);

    const handleEstimate = async () => {
        if (!file || !startPage || !endPage) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('start_page', startPage);
        formData.append('end_page', endPage);

        try {
            const response = await fetch('http://localhost:8000/estimate', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                setEstimationResult(result);
                setIsFileReady(true); // Set file as ready for download immediately
            } else {
                console.error('Error fetching estimation:', response.statusText);
            }
        } catch (error) {
            console.error('Error making API call:', error);
        }
    }

    const handleDownload = async () => {
        if (!file || !isFileReady) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('start_page', startPage);
        formData.append('end_page', endPage);

        try {
            const response = await fetch('http://localhost:8000/convert', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = 'presentation.pptx';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            } else {
                console.error('Error converting file:', response.statusText);
            }
        } catch (error) {
            console.error('Error making API call:', error);
        }
    }

    return (
        <Card className="w-full max-w-2xl bg-black border-none shadow-lg">
            <CardContent className="p-4 sm:p-6">
                <FileUpload onFileUpload={setFile} />
                <PageRangeInput
                    startPage={startPage}
                    endPage={endPage}
                    onStartPageChange={setStartPage}
                    onEndPageChange={setEndPage}
                />
                <div className="mt-6 flex justify-center">
                    <Button
                        onClick={handleEstimate}
                        disabled={!file || !startPage || !endPage}
                        className="w-full sm:w-auto bg-blue-500 hover:bg-blue-700 text-white"
                    >
                        Estimate
                    </Button>
                </div>
                {estimationResult && (
                    <EstimationResult 
                        result={estimationResult} 
                        onDownload={handleDownload}
                        isFileReady={isFileReady}
                    />
                )}
            </CardContent>
        </Card>
    )
}