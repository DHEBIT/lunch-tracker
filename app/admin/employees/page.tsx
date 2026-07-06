import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import EmployeesTable from "./employees-table"

export default async function EmployeesPage() {
  const session = await auth()
  if (!session?.user) redirect("/signin")
  if ((session.user as any).role !== "ADMIN") redirect("/menu")

  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true, role: true, department: true },
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-extrabold tracking-tight mb-1">
          <span className="text-primary">Employees</span>
        </h1>
        <p className="text-gray-500 dark:text-zinc-400 mb-6">
          Manage departments for reporting and exports.
        </p>

        <EmployeesTable initialUsers={users} />
      </div>
    </div>
  )
}