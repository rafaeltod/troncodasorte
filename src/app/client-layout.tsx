'use client'

import { useEffect, useState } from 'react'
import { Navbar } from "@/components/navbar";
import { AuthProvider } from "@/context/auth-context";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    console.log('[ClientLayout] Mounted')
    setMounted(true)
  }, [])

  return (
    <AuthProvider>
      {mounted ? (
        <>
          <Navbar />
          {children}
        </>
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
          <div className="text-xl font-bold text-slate-600">⏳ Inicializando...</div>
        </div>
      )}
    </AuthProvider>
  );
}
