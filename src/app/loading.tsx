export default function DashboardLoading() {
    return (
        <div className="min-h-screen bg-[#f8fafc] px-4 py-8 animate-pulse">
            <div className="max-w-4xl mx-auto">
                {/* Header Skeleton */}
                <div className="flex justify-between items-center mb-10 mt-2 px-1">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
                        <div>
                            <div className="h-6 w-32 bg-slate-200 rounded mb-2"></div>
                            <div className="h-4 w-48 bg-slate-200 rounded"></div>
                        </div>
                    </div>
                </div>

                {/* Section Title Skeleton */}
                <div className="h-5 w-24 bg-slate-200 rounded mb-6 ml-1"></div>

                {/* Apps Grid Skeleton */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-white rounded-[24px] p-5 ring-1 ring-slate-100 flex flex-col items-center gap-4">
                            <div className="relative w-[72px] h-[72px] rounded-[18px] bg-slate-200"></div>
                            <div className="w-full space-y-2">
                                <div className="h-4 w-20 bg-slate-200 rounded mx-auto"></div>
                                <div className="flex justify-center gap-2">
                                    <div className="h-3 w-3 bg-slate-200 rounded-full"></div>
                                    <div className="h-3 w-16 bg-slate-200 rounded"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
