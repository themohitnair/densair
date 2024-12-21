import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
    title: 'DensAIr - Condense Knowledge',
    description: 'Upload PDF, get condensed PPTX',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="dark">
            <body className={`${inter.className} bg-black text-white`}>{children}</body>
        </html>
    )
}