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
    stripeLink: string;
};

export function DensAirApp() {
    const [file, setFile] = useState<File | null>(null)
    const [startPage, setStartPage] = useState('')
    const [endPage, setEndPage] = useState('')
    const [estimationResult, setEstimationResult] = useState<EstimationResultType | null>(null);

    const handleEstimate = async () => {
        // Placeholder for API call
        const result = {
            price: 10.99,
            tokens: 5000,
            stripeLink: 'https://stripe.com/payment/placeholder'
        }
        setEstimationResult(result)
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
                {estimationResult && <EstimationResult result={estimationResult} />}
            </CardContent>
        </Card>
    )
}