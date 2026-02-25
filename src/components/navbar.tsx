'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { censorName } from '@/lib/formatters'
import { mainConfig } from '@/lib/layout-config'
import Image from 'next/image'
import { Ticket, User, Trophy, TrendingUp, Menu, X, LogOut, Shield, Home } from 'lucide-react'
import { FaAdjust } from "react-icons/fa";

export function Navbar() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isDarkTheme, setIsDarkTheme] = useState(false)

  const applyTheme = (theme: 'light' | 'dark') => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
    localStorage.setItem('theme', theme)
  }

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')

    if (savedTheme === 'light' || savedTheme === 'dark') {
      applyTheme(savedTheme)
      setIsDarkTheme(savedTheme === 'dark')
      return
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initialTheme = prefersDark ? 'dark' : 'light'
    applyTheme(initialTheme)
    setIsDarkTheme(prefersDark)
  }, [])

  const handleLogout = async () => {
    logout()
    setMobileMenuOpen(false)
    router.push('/')
  }

  const handleToggleTheme = () => {
    const nextTheme = isDarkTheme ? 'light' : 'dark'
    applyTheme(nextTheme)
    setIsDarkTheme(nextTheme === 'dark')
  }

  return (
    <header className={`${mainConfig} bg-azul-royal! text-branco top-0 left-0 right-0 z-50`}>
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

          {/* Desktop Navigation + Theme Toggle + Mobile Menu Button */}
          <div className="flex items-center gap-4 ml-auto">
            <button
              onClick={handleToggleTheme}
              aria-label={isDarkTheme ? 'Ativar tema claro' : 'Ativar tema escuro'}
              title={isDarkTheme ? 'Ativar tema claro' : 'Ativar tema escuro'}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <FaAdjust />
            </button>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/"
                className="hover:text-emerald-100 transition-colors"
              >
                Lotes
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
                    <>
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                      >
                        <Shield className="w-4 h-4" />
                        Painel Admin
                      </Link>
                      <Link
                        href="/criar-lote"
                        className="bg-white text-emerald-600 hover:bg-emerald-50 px-6 py-2 rounded-lg font-semibold transition-colors"
                      >
                        + Criar Lote
                      </Link>
                    </>
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

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
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
                  {user.isVendedor && !user.isAdmin && (
                    <Link
                      href="/vendedor"
                      className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-left m-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <TrendingUp className="w-4 h-4" />
                      Painel Vendedor
                    </Link>
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
