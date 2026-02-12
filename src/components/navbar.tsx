'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { censorName } from '@/lib/formatters'
import Image from 'next/image'
import { Ticket, User, Trophy, Menu, X, LogOut } from 'lucide-react'

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
    <header className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
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
              href="/campanhas"
              className="hover:text-emerald-100 transition-colors"
            >
              Campanhas
            </Link>
            <Link
              href="/top-compradores"
              className="flex items-center gap-1 hover:text-emerald-100 transition-colors"
            >
              <Trophy className="w-4 h-4" />
              Top Compradores
            </Link>
            {user ? (
              <>
                <Link
                  href="/account"
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
                >
                  <User className="w-4 h-4" />
                  {censorName(user.name)}
                </Link>
                {user.isAdmin && (
                  <Link
                    href="/criar-campanha"
                    className="bg-white text-emerald-600 hover:bg-emerald-50 px-6 py-2 rounded-lg font-semibold transition-colors"
                  >
                    + Criar Campanha
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 border border-white/50 hover:bg-white/10 px-4 py-2 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              </>
            ) : (
              <Link
                href="/meus-bilhetes"
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
              >
                <Ticket className="w-4 h-4" />
                Meus Bilhetes
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-white/20">
            <div className="flex flex-col gap-3">
              <Link
                href="/campanhas"
                className="text-left px-4 py-2 hover:bg-white/10 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Campanhas
              </Link>
              <Link
                href="/top-compradores"
                className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Trophy className="w-4 h-4" />
                Top Compradores
              </Link>
              {user ? (
                <>
                  <Link
                    href="/account"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    Minha Conta
                  </Link>
                  {user.isAdmin && (
                    <Link
                      href="/criar-campanha"
                      className="bg-white text-emerald-600 px-4 py-2 rounded-lg font-semibold transition-colors text-left m-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      + Criar Campanha
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-lg transition-colors text-left w-full"
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
      </div>
    </header>
  )
}
