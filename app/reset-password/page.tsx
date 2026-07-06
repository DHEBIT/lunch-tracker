"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

export default function ResetPasswordPage() {
  const router = useRouter()
  import React, { Suspense } from "react"
  import ResetForm from "./reset-form"

  export default function ResetPasswordPage() {
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
        <ResetForm />
      </Suspense>
    )
  }