export function ReviewsSkeleton() {
    return (
        <div className="mt-10 space-y-8">
            {/* Search Bar Skeleton */}
            <div className="relative mx-auto flex max-w-xl items-center rounded-full border border-gray-200 bg-white px-5 py-3 shadow-sm">
                <div className="h-5 w-full animate-pulse rounded bg-gray-200" />
            </div>

            <div className="space-y-6">
                {/* Pagination Info Skeleton */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 rounded-3xl border border-white/60 bg-white/70 px-4 py-3">
                    <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
                </div>

                {/* Card Skeletons */}
                {Array.from({ length: 5 }).map((_, i) => (
                    <article
                        key={i}
                        className="rounded-4xl border border-gray-100 bg-white/90 p-6 shadow-sm"
                    >
                        <div className="space-y-4">
                            <div className="space-y-2">
                                {/* Title */}
                                <div className="h-7 w-3/4 animate-pulse rounded-md bg-gray-200 sm:w-1/2" />

                                {/* City/State */}
                                <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />

                                {/* Meta info */}
                                <div className="mt-2 h-3 w-1/4 animate-pulse rounded bg-gray-200" />
                            </div>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                                {/* Rating Badge */}
                                <div className="h-9 w-20 animate-pulse rounded-full bg-gray-200" />

                                {/* Button */}
                                <div className="h-11 w-full sm:w-32 animate-pulse rounded-2xl bg-gray-200" />
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}
