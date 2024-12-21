import { DensAirApp } from '../components/DensAirApp'

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-10 lg:p-16">
            <h1 className="text-3xl sm:text-5xl font-bold mb-2 text-center">Dens<span className="text-blue-500 text-5xl">AI</span>r</h1>
            <p className="text-lg sm:text-xl text-blue-500 mb-8 text-center">Condense Knowledge</p>
            <DensAirApp />
        </main>
    )
}