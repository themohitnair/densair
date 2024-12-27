'use client'

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { AlertCircle } from 'lucide-react'
import { importantPoints } from "@/lib/importantPoints"

export function CollapsibleImportantPoints() {
    return (
        <Accordion type="single" collapsible className="w-full mb-6">
            <AccordionItem value="important-info">
                <AccordionTrigger className="text-blue-500">
                    <div className="flex items-center">
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Important Information
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    <ul className="space-y-2 text-sm text-gray-300">
                        {importantPoints.map((point, index) => (
                            <li key={index} className="flex items-start">
                                <span className="font-medium text-blue-400 mr-2">•</span>
                                <span>{point.description}</span>
                            </li>
                        ))}
                    </ul>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}