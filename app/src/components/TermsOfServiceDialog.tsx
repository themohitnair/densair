'use client'

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { termsOfService } from '@/lib/termsOfService';

interface TermsOfServiceDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onAccept: () => void;
    paymentLink: string;
}

export function TermsOfServiceDialog({ isOpen, onClose, onAccept, paymentLink }: TermsOfServiceDialogProps) {
    const [accepted, setAccepted] = useState(false);

    const handleAccept = () => {
        if (accepted) {
            onAccept();
            window.open(paymentLink, '_blank');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Terms of Service</DialogTitle>
                    <DialogDescription>
                        Please read and accept our Terms of Service before proceeding to payment.
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[300px] overflow-y-auto my-4">
                    {termsOfService.map((term, index) => (
                        <div key={index} className="mb-4">
                            <h2 className="text-lg font-semibold mb-2">{term.title}</h2>
                            {Array.isArray(term.content) ? (
                                <ul className="list-disc pl-5">
                                    {term.content.map((item, itemIndex) => (
                                        <li key={itemIndex} className="mb-1">{item}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>{term.content}</p>
                            )}
                        </div>
                    ))}
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="accept-terms"
                        checked={accepted}
                        onCheckedChange={(checked) => setAccepted(checked as boolean)}
                    />
                    <label
                        htmlFor="accept-terms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        I accept the Terms of Service
                    </label>
                </div>
                <DialogFooter>
                    <Button onClick={handleAccept} disabled={!accepted} className="bg-blue-600 hover:bg-blue-700 text-white">
                        Accept and Proceed to Payment
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

