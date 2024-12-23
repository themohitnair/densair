'use client'

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

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
                    <h2 className="text-lg font-semibold mb-2">1. Services</h2>
                    <p className="mb-4">
                        densAIr provides a tool for condensing PDF documents into PowerPoint presentations. By using the
                        Services, you acknowledge that the quality of the condensed presentation depends on automated
                        processes and may not meet specific individual expectations.
                    </p>

                    <h2 className="text-lg font-semibold mb-2">2. User Responsibility</h2>
                    <p className="mb-4">
                        - You agree to provide accurate and lawful input documents for processing.<br />
                        - You confirm that you have the legal right to upload and process the documents you submit.<br />
                        - You acknowledge that the output generated is for personal or internal business use only and is
                        not guaranteed to meet your specific needs.
                    </p>

                    <h2 className="text-lg font-semibold mb-2">3. Payment Terms</h2>
                    <p className="mb-4">
                        - All payments for Services must be made upfront.<br />
                        - Pricing is based on the number of pages and complexity of the document.<br />
                        - By making a payment, you agree that the amount is non-refundable under any circumstances,
                        including dissatisfaction with the quality of the output.
                    </p>

                    <h2 className="text-lg font-semibold mb-2">4. Refund Policy</h2>
                    <p className="mb-4">
                        Due to the nature of the Services, <strong>no refunds</strong> will be issued after the
                        presentation is generated, regardless of the quality or your satisfaction level.
                    </p>

                    <h2 className="text-lg font-semibold mb-2">5. Limitation of Liability</h2>
                    <p className="mb-4">
                        - densAIr provides the Services &quot;as is&quot; without warranties, express or implied, including but not
                        limited to merchantability, fitness for a particular purpose, or non-infringement.<br />
                        - To the fullest extent permitted by law, densAIr and its affiliates, officers, employees, and
                        agents will not be liable for any direct, indirect, incidental, special, consequential, or
                        punitive damages arising out of your use of the Services, even if advised of the possibility of
                        such damages.
                    </p>

                    <h2 className="text-lg font-semibold mb-2">6. Indemnification</h2>
                    <p className="mb-4">
                        You agree to indemnify, defend, and hold harmless densAIr, its affiliates, and their respective
                        officers, directors, employees, and agents from any claims, liabilities, damages, losses, and
                        expenses, including legal fees, arising from your use of the Services or violation of these
                        Terms.
                    </p>

                    <h2 className="text-lg font-semibold mb-2">7. Dispute Resolution and Governing Law</h2>
                    <p className="mb-4">
                        - These Terms are governed by the laws of India.<br />
                        - Any disputes arising out of or in connection with these Terms will be subject to the exclusive
                        jurisdiction of the courts in [Your City], India.
                    </p>

                    <h2 className="text-lg font-semibold mb-2">8. Changes to the Terms</h2>
                    <p className="mb-4">
                        We reserve the right to update these Terms at any time without prior notice. Continued use of the
                        Services constitutes acceptance of the updated Terms.
                    </p>

                    <h2 className="text-lg font-semibold mb-2">9. Disclaimer</h2>
                    <p className="mb-4">
                        - You acknowledge that densAIr is not liable for any inaccuracies or errors in the presentations
                        generated.<br />
                        - You agree not to hold densAIr liable for any damages, financial loss, or reputational harm
                        arising from the use of the Services.
                    </p>

                    <h2 className="text-lg font-semibold mb-2">10. Prohibited Legal Action</h2>
                    <p className="mb-4">
                        By agreeing to these Terms, you explicitly waive the right to initiate legal action against
                        densAIr for any reason arising out of the use of the Services. However, this clause is subject
                        to applicable consumer protection laws and does not restrict statutory rights that cannot be
                        waived under Indian law.
                    </p>
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