import { auth } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    redirect("/menu");
  }

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-gray-50 px-4 py-16 text-gray-900 dark:bg-zinc-950 dark:text-gray-100">
      <main className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          Happy Hour
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Lunch ordering, made simple.
        </h1>
        <p className="mt-4 text-base leading-7 text-gray-600 dark:text-gray-400">
          Pick your meal for the week, keep everything organized, and let admins
          review the orders in one place.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/signin"
            className="flex h-12 items-center justify-center rounded-full bg-primary px-5 font-semibold text-white transition-colors hover:bg-primary/90"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="flex h-12 items-center justify-center rounded-full border border-gray-300 px-5 font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:border-zinc-700 dark:text-gray-200 dark:hover:bg-zinc-800"
          >
            Create account
          </Link>
        </div>
      </main>
    </div>
  );
}
