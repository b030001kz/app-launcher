export default function ProjectDetailLoading() {
    return (
        <div className="min-h-screen bg-[#f8fafc] px-4 py-6 sm:py-10 pb-24 sm:pb-10 animate-pulse">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header Skeleton */}
                <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-slate-200 rounded-lg mt-1"></div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
                            <div className="h-7 w-48 bg-slate-200 rounded"></div>
                            <div className="h-5 w-16 bg-slate-200 rounded-full"></div>
                        </div>
                        <div className="h-4 w-64 bg-slate-200 rounded ml-[52px]"></div>
                    </div>
                </div>

                {/* Progress Bar Skeleton */}
                <div className="bg-white rounded-2xl ring-1 ring-slate-100 p-4">
                    <div className="flex justify-between mb-2">
                        <div className="h-4 w-32 bg-slate-200 rounded"></div>
                        <div className="h-4 w-10 bg-slate-200 rounded"></div>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full"></div>
                </div>

                {/* Meta info cards Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-white rounded-2xl ring-1 ring-slate-100 p-4 h-32">
                        <div className="h-3 w-20 bg-slate-200 rounded mb-4"></div>
                        <div className="space-y-2">
                            <div className="h-4 w-full bg-slate-200 rounded"></div>
                            <div className="h-4 w-4/5 bg-slate-200 rounded"></div>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="bg-white rounded-2xl ring-1 ring-slate-100 p-4 h-20"></div>
                        <div className="bg-white rounded-2xl ring-1 ring-slate-100 p-4 h-24"></div>
                    </div>
                </div>

                {/* Tasks list Skeleton */}
                <div className="bg-white rounded-2xl ring-1 ring-slate-100 p-4 sm:p-5">
                    <div className="h-3 w-20 bg-slate-200 rounded mb-4"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-3 items-center">
                                <div className="h-5 w-5 bg-slate-200 rounded-full"></div>
                                <div className="h-4 w-3/4 bg-slate-200 rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
