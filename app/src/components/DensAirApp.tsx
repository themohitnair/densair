'use client'

import { useState } from 'react'
import { FileUpload } from './FileUpload'
import { PageRangeInput } from './PageRangeInput'
import { EstimationResult } from './EstimationResult'
import { TermsOfServiceDialog } from './TermsOfServiceDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

type EstimationResultType = {
    price: number;
    tokens: number;
    payment_link: string;
};

export function DensAirApp() {
    const [file, setFile] = useState<File | null>(null)
    const [startPage, setStartPage] = useState('')
    const [endPage, setEndPage] = useState('')
    const [estimationResult, setEstimationResult] = useState<EstimationResultType | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

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
            } else {
                console.error('Error fetching estimation:', response.statusText);
            }
        } catch (error) {
            console.error('Error making API call:', error);
        }
    }

    const handlePaymentClick = () => {
        setIsDialogOpen(true);
    }

    const handleDialogClose = () => {
        setIsDialogOpen(false);
    }

    const handleTermsAccept = () => {
        setIsDialogOpen(false);
        // The actual redirection to the payment link is handled in the TermsOfServiceDialog component
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
                        onPaymentClick={handlePaymentClick}
                    />
                )}
                {estimationResult && (
                    <TermsOfServiceDialog
                        isOpen={isDialogOpen}
                        onClose={handleDialogClose}
                        onAccept={handleTermsAccept}
                        paymentLink={estimationResult.payment_link}
                    />
                )}
            </CardContent>
        </Card>
    )
}