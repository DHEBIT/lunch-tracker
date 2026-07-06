import { Suspense } from "react"
import ResetForm from "./reset-form"

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900 dark:bg-zinc-950 dark:text-gray-100">
      <div className="w-full max-w-sm">
        <h1 className="text-4xl font-extrabold text-center mb-1">
          <span className="text-primary">HAPPY</span>{" "}
          <span className="text-accent-orange">HOUR</span>
        </h1>
        <p className="text-center text-sm text-gray-500 mb-6">Set a new password</p>

        <div className="bg-white dark:bg-zinc-900 p-8 rounded-lg shadow-md border border-gray-200 dark:border-zinc-800">
          <Suspense fallback={<p className="text-gray-400 text-sm">Loading…</p>}>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}