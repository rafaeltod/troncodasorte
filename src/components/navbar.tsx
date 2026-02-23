'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { censorName } from '@/lib/formatters'
import { mainConfig } from '@/lib/layout-config'
import Image from 'next/image'
import { Ticket, User, Trophy, Menu, X, LogOut, Shield, Home } from 'lucide-react'

export function Navbar() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    logout()
    setMobileMenuOpen(false)
    router.push('/')
  }

  return (
    <header className={`${mainConfig} bg-azul-royal! text-branco top-0 left-0 right-0 z-50 border-b-20`}>
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link 
            href="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Image 
              src="/troncodasorte.png"
              alt="Tronco da Sorte"
              width={40}
              height={40}
              className="rounded"
              priority
            />
            <span className="font-bold text-xl hidden sm:inline">Tronco da Sorte</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/" className=" gap-2 flex items-center hover:text-branco/50 transition-colors"> 
              <Home className="w-4 h-4" />
              Lotes
            </Link>
            {user ? (
              <>
                
                {user.isAdmin && (
                  <>
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 hover:text-branco/50 transition-colors"
                    >
                      <Shield className="w-4 h-4" />
                      Painel Admin
                    </Link>
                  </>
                )}

                <Link
                  href="/account"
                  className="flex items-center gap-2 hover:text-branco/50 transition-colors"
                >
                  <User className="w-4 h-4" />
                  {censorName(user.name)}
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 border cursor-pointer bg-branco text-azul-royal hover:bg-branco/50 px-4 py-2 rounded-full transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              </>
            ) : (
              <Link
                href="/meus-bilhetes"
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition-colors"
              >
                <Ticket className="w-4 h-4" />
                Meus Bilhetes
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden hover:bg-white/10 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-white/20">
            <div className="flex flex-col gap-3">
              <Link
                href="/"
                className="flex items-center gap-2 text-branco hover:bg-branco/90 px-4 py-2 rounded-full font-semibold transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home className="w-4 h-4" />
                Lotes
              </Link>
              {user ? (
                <>
                  <Link
                    href="/account"
                    className="flex items-center gap-2 text-branco hover:bg-branco/90 px-4 py-2 rounded-full font-semibold transition-colors"
                    onClick={() => setMobileMenuOpen(false)}>
                    <User className="w-4 h-4" />
                    Perfil
                  </Link>
                  {user.isAdmin && (
                    <>
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 text-branco hover:bg-branco/90 px-4 py-2 rounded-full font-semibold transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Shield className="w-4 h-4" />
                        Painel Admin
                      </Link>
                      <Link
                        href="/criar-lote"
                        className=" text-branco hover:text-branco/90 px-4 py-2 rounded-full font-semibold transition-colors text-left m-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        + Criar Lote
                      </Link>
                    </>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-branco/90 rounded-full transition-colors text-left w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair
                  </button>
                </>
              ) : (
                <Link
                  href="/meus-bilhetes"
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Ticket className="w-4 h-4" />
                  Meus Bilhetes
                </Link>
              )}
            </div>
          </nav>
        )}
      
    </header>
  )
}
