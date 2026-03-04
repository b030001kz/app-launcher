export default function ToolsLoading() {
    return (
        <div className="min-h-screen bg-[#f8fafc] px-4 py-6 sm:py-10 pb-24 sm:pb-10 animate-pulse">
            <div className="max-w-4xl mx-auto">
                {/* Header Skeleton */}
                <div className="flex items-center justify-between mb-8 mt-2 px-1">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
                        <div>
                            <div className="h-6 w-32 bg-slate-200 rounded mb-2"></div>
                            <div className="h-3 w-20 bg-slate-200 rounded"></div>
                        </div>
                    </div>
                    <div className="h-10 w-20 bg-slate-200 rounded-xl"></div>
                </div>

                {/* Categories Skeleton */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-9 w-24 bg-slate-200 rounded-full flex-shrink-0"></div>
                    ))}
                </div>

                {/* Tools Grid Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-white rounded-2xl p-4 ring-1 ring-slate-100 flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-200 flex-shrink-0"></div>
                            <div className="flex-1 w-full space-y-2 py-1">
                                <div className="h-5 w-24 bg-slate-200 rounded"></div>
                                <div className="h-3 w-full bg-slate-200 rounded"></div>
                                <div className="h-3 w-16 bg-slate-200 rounded mt-2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
