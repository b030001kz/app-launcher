import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">App Launcher</h1>
                    <p className="text-slate-500 mt-2">Vercelアプリを一元管理</p>
                </div>
                <SignIn
                    appearance={{
                        elements: {
                            rootBox: 'mx-auto w-full',
                            card: 'shadow-xl border border-slate-200',
                        },
                    }}
                />
            </div>
        </div>
    )
}
