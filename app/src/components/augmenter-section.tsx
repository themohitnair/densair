"use client"

import type { AugmenterGroup, Augmenter } from "../types/paper-types"
import { LoadingAnimation } from "./loading-animation"

interface AugmenterSectionProps {
  augmenterGroups: AugmenterGroup[]
  loading?: boolean
}

export function AugmenterSection({ augmenterGroups, loading = false }: AugmenterSectionProps) {
  if (augmenterGroups.length === 0 && !loading) {
    return null
  }

  return (
    <>
      {augmenterGroups.map((group) => (
        <div key={group.term} className="bg-card rounded-lg p-4 mb-4">
          <h3 className="text-xl font-semibold mb-3">Resources for - {group.term}</h3>
          <ul className="space-y-2">
            {group.augmenters.map((augmenter: Augmenter) => (
              <li key={augmenter.url}>
                <a
                  href={augmenter.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {augmenter.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
      
      {loading && (
        <div className="flex flex-col items-center justify-center py-8">
          <LoadingAnimation />
        </div>
      )}
    </>
  )
}
