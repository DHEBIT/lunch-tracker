"use client"

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-gray-200 px-4 py-2 rounded font-semibold hover:bg-gray-300 dark:hover:bg-zinc-700 transition-colors"
    >
      Print
    </button>
  )
}