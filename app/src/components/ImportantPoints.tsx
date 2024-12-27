import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { importantPoints } from '@/lib/importantPoints';

export function ImportantPoints() {
    return (
        <Card className="bg-black text-white mb-6 border-2 border-gray-600">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold flex items-center">
                    <span className="text-blue-500">Important Information</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-2">
                    {importantPoints.map((point, index) => (
                        <li key={index} className="flex items-start">
                            <AlertCircle className="h-5 w-5 mr-2 text-blue-300 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-300">{point.description}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}