import { Button } from '@/components/ui/button'

interface EstimationResultProps {
    result: {
        price: number
        tokens: number
        paymentLink: string
    }
}

export function EstimationResult({ result }: EstimationResultProps) {
    return (
        <div className="mt-6 p-4 bg-gray-700 rounded-lg border border-gray-600">
            <h3 className="text-lg font-semibold mb-2 text-white">Estimation Result</h3>
            <p className="text-sm sm:text-base text-gray-300">Price: ${result.price.toFixed(2)}</p>
            <p className="text-sm sm:text-base text-gray-300">Tokens: {result.tokens}</p>
            <div className="mt-4">
                <Button
                    asChild
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                    <a
                        href={result.paymentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Pay with Stripe
                    </a>
                </Button>
            </div>
        </div>
    )
}