'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Navbar } from "@/components/navbar";
import { AuthProvider } from "@/context/auth-context";
import { useAuth } from "@/context/auth-context";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  
  // Rotas de autenticação não devem mostrar navbar
  const isAuthRoute = pathname.startsWith('/auth/')
  
  if (loading) {
    return (
      <div className="min-h-screen bg-fundo-cinza dark:bg-cinza-escuro flex items-center justify-center">
        <div className="text-xl font-bold text-cinza dark:text-cinza-claro">Carregando...</div>
      </div>
    )
  }

  return (
    <>
      {!isAuthRoute && <Navbar />}
      {children}
    </>
  )
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-fundo-cinza dark:bg-cinza-escuro flex items-center justify-center">
        <div className="text-xl font-bold text-cinza dark:text-cinza-claro">Inicializando...</div>
      </div>
    )
  }

  return (
    <AuthProvider>
      <LayoutContent>{children}</LayoutContent>
    </AuthProvider>
  );
}
