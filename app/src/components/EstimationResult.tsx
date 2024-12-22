import { Button } from '@/components/ui/button'

interface EstimationResultProps {
    result: {
        price: number
        tokens: number
        paymentLink: string
    }
    onDownload: () => void
    isFileReady: boolean
}

export function EstimationResult({ result, onDownload, isFileReady }: EstimationResultProps) {
    return (
        <div className="mt-6 p-4 bg-black rounded-lg border border-black">
            <h3 className="text-lg font-semibold mb-2 text-white">Estimation Result</h3>
            <p className="text-sm sm:text-base text-gray-300">Price: ${result.price.toFixed(2)}</p>
            <p className="text-sm sm:text-base text-gray-300">Tokens: {result.tokens}</p>
            <div className="mt-4">
                <Button
                    onClick={onDownload}
                    disabled={!isFileReady}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                    Download Presentation
                </Button>
            </div>
        </div>
    )
}