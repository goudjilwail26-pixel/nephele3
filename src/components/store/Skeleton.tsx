import React from 'react'
import { cn } from '@/lib/utils'

interface SkeletonCardProps {
  className?: string
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div className={cn("animate-pulse", className)}>
      <div className="aspect-[3/4] bg-nephele-border/20 mb-3 border border-nephele-border" />
      <div className="space-y-2 px-2">
        <div className="h-3 w-16 bg-nephele-border/30 rounded" />
        <div className="h-3 w-24 bg-nephele-border/30 rounded" />
        <div className="h-3 w-12 bg-nephele-border/30 rounded" />
      </div>
    </div>
  )
}

interface SkeletonGridProps {
  count?: number
}

export function SkeletonGrid({ count = 8 }: SkeletonGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2 gap-y-8 sm:gap-x-4 sm:gap-y-12">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}