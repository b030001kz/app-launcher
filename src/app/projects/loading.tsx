export default function ProjectsLoading() {
    return (
        <div className="min-h-screen bg-[#f8fafc] px-4 py-6 sm:py-10 pb-24 sm:pb-10 animate-pulse">
            <div className="max-w-4xl mx-auto">
                {/* Header Skeleton */}
                <div className="flex items-center justify-between mb-8 mt-2 px-1">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
                        <div>
                            <div className="h-6 w-36 bg-slate-200 rounded mb-2"></div>
                            <div className="h-3 w-24 bg-slate-200 rounded"></div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <div className="h-9 w-20 bg-slate-200 rounded-lg"></div>
                        <div className="h-9 w-20 bg-slate-200 rounded-xl"></div>
                    </div>
                </div>

                {/* Projects Grid Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white rounded-2xl p-5 ring-1 ring-slate-100 flex flex-col h-40">
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-200"></div>
                                <div className="h-4 w-12 bg-slate-200 rounded-full"></div>
                            </div>
                            <div className="h-5 w-3/4 bg-slate-200 rounded mb-2"></div>
                            <div className="h-3 w-full bg-slate-200 rounded mb-1"></div>
                            <div className="h-3 w-1/2 bg-slate-200 rounded"></div>

                            <div className="mt-auto pt-3 flex gap-3 border-t border-slate-50">
                                <div className="h-3 w-12 bg-slate-200 rounded"></div>
                                <div className="h-3 w-16 bg-slate-200 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
