import { Button } from '@/components/ui/button'

interface EstimationResultProps {
    result: {
        price: number
        tokens: number
        payment_link: string
    }
    onPaymentClick: () => void
}

export function EstimationResult({ result, onPaymentClick }: EstimationResultProps) {
    return (
        <div className="mt-6 p-4 bg-black rounded-lg border border-black">
            <h3 className="text-lg font-semibold mb-2 text-white">Estimation Result</h3>
            <p className="text-sm sm:text-base text-gray-300">Price: ${result.price.toFixed(2)}</p>
            <p className="text-sm sm:text-base text-gray-300">Tokens: {result.tokens}</p>
            <div className="mt-4">
                <Button
                    onClick={onPaymentClick}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                    Proceed to Payment
                </Button>
            </div>
        </div>
    )
}