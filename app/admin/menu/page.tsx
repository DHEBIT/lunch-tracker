import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import MenuForm from "./menu-form"

export default async function AdminMenuPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/signin")
  }

  if ((session.user as any).role !== "ADMIN") {
    redirect("/menu")
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold mb-1">
          <span className="text-primary">Upload</span>{" "}
          <span className="text-accent-gold">Weekly Menu</span>
        </h1>
        <p className="text-gray-500 mb-8">
          Enter two options for each weekday.
        </p>

        <MenuForm />
      </div>
    </div>
  )
}