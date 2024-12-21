import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface PageRangeInputProps {
    startPage: string
    endPage: string
    onStartPageChange: (value: string) => void
    onEndPageChange: (value: string) => void
}

export function PageRangeInput({
    startPage,
    endPage,
    onStartPageChange,
    onEndPageChange
}: PageRangeInputProps) {
    return (
        <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <Label htmlFor="startPage" className="text-sm font-medium text-gray-300">
                    Start Page
                </Label>
                <Input
                    type="number"
                    id="startPage"
                    value={startPage}
                    onChange={(e) => onStartPageChange(e.target.value)}
                    min="1"
                    className="mt-1 bg-black text-white border-2 border-gray-600 focus:outline-0"
                />
            </div>
            <div>
                <Label htmlFor="endPage" className="text-sm font-medium text-gray-300">
                    End Page
                </Label>
                <Input
                    type="number"
                    id="endPage"
                    value={endPage}
                    onChange={(e) => onEndPageChange(e.target.value)}
                    min="1"
                    className="mt-1 bg-black text-white border-2 border-gray-600 focus:outline-0"
                />
            </div>
        </div>
    )
}