import { auth } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import Footer from "./footer";

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    redirect("/menu");
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-gray-100">
      <main className="flex-1">
        {/* Hero */}
        <section className="px-4 pt-20 pb-16 sm:pt-28 sm:pb-24">
          <div className="max-w-3xl mx-auto text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Happy Hour
            </p>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              Lunch ordering,{" "}
              <span className="bg-linear-to-r from-primary via-accent-orange to-accent-gold bg-clip-text text-transparent">
                made simple.
              </span>
            </h1>
            <p className="mt-5 text-lg leading-7 text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              Pick your meal for the week, keep everything organized, and let
              admins review orders, notify the team, and pay the caterer — all
              in one place.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/signin"
                className="flex h-12 items-center justify-center rounded-full bg-primary px-6 font-semibold text-white transition-colors hover:bg-primary-dark shadow-sm shadow-primary/30"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="flex h-12 items-center justify-center rounded-full border border-gray-300 dark:border-zinc-700 px-6 font-semibold text-gray-700 dark:text-gray-200 transition-colors hover:bg-gray-100 dark:hover:bg-zinc-800"
              >
                Create account
              </Link>
            </div>
          </div>
        </section>

        {/* Feature cards */}
        <section className="px-4 pb-20">
          <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-4">
            <div className="rounded-2xl p-5 bg-primary shadow-sm shadow-primary/20">
              <p className="text-2xl mb-2">🍽️</p>
              <p className="font-bold text-white">Pick your meal</p>
              <p className="text-sm text-white/70 mt-1">
                Two options a day, one tap to choose.
              </p>
            </div>
            <div className="rounded-2xl p-5 bg-accent-orange shadow-sm shadow-accent-orange/20">
              <p className="text-2xl mb-2">🔔</p>
              <p className="font-bold text-white">Stay notified</p>
              <p className="text-sm text-white/70 mt-1">
                New menus and orders, right in the app.
              </p>
            </div>
            <div className="rounded-2xl p-5 bg-accent-aqua shadow-sm shadow-accent-aqua/20">
              <p className="text-2xl mb-2">📊</p>
              <p className="font-bold text-white">Easy reporting</p>
              <p className="text-sm text-white/70 mt-1">
                Monthly costs and caterer sheets, exported instantly.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}