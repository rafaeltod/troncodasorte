'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/context/auth-context'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()

  const handleLogout = () => {
    logout()
    setIsOpen(false)
    router.push('/auth/login')
  }

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 border-b-2 border-indigo-100">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="font-black text-2xl md:text-3xl text-indigo-600 hover:text-indigo-700 transition flex items-center gap-2">
          <Image 
            src="/troncodasorte.png" 
            alt="Tronco da Sorte" 
            width={40} 
            height={40}
            priority
            unoptimized
            className="rounded-lg"
          />
          <span>Tronco da Sorte</span>
        </Link>

        <div className="hidden md:flex gap-8 items-center">
          <Link href="/dashboard" className="text-slate-700 font-semibold hover:text-indigo-600 transition">
            Home
          </Link>
          <Link href="/rifas" className="text-slate-700 font-semibold hover:text-indigo-600 transition">
            Rifas
          </Link>
          {isAuthenticated && (
            <>
              <Link href="/top-compradores" className="text-slate-700 font-semibold hover:text-indigo-600 transition">
                Top Compradores
              </Link>
              <Link href="/historico" className="text-slate-700 font-semibold hover:text-indigo-600 transition">
                Meu Histórico
              </Link>
            </>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link href="/account" className="text-slate-700 font-semibold hover:text-indigo-600 transition">
                👤 {user?.name}
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition"
              >
                Sair
              </button>
              <Link href="/criar-rifa" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition transform hover:scale-105">
                + Criar Rifa
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/auth/login" className="text-indigo-600 font-bold hover:text-indigo-700">
                Entrar
              </Link>
              <Link href="/auth/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 transition">
                Criar Conta
              </Link>
            </div>
          )}
        </div>

        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="w-6 h-0.5 bg-slate-800 transition-all"></div>
          <div className="w-6 h-0.5 bg-slate-800 transition-all"></div>
          <div className="w-6 h-0.5 bg-slate-800 transition-all"></div>
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden bg-gradient-to-b from-slate-50 to-white border-t-2 border-indigo-100 flex flex-col gap-3 p-4">
          <Link href="/" className="text-slate-700 font-semibold hover:text-indigo-600 transition py-2">
            Home
          </Link>
          <Link href="/rifas" className="text-slate-700 font-semibold hover:text-indigo-600 transition py-2">
            Rifas
          </Link>
          {isAuthenticated && (
            <>
              <Link href="/top-compradores" className="text-slate-700 font-semibold hover:text-indigo-600 transition py-2">
                Top Compradores
              </Link>
              <Link href="/historico" className="text-slate-700 font-semibold hover:text-indigo-600 transition py-2">
                Meu Histórico
              </Link>
            </>
          )}
          
          {isAuthenticated ? (
            <>
              <div className="py-2 text-slate-700 font-semibold border-t border-slate-200">
                👤 {user?.name}
              </div>
              <Link href="/account" className="text-slate-700 font-semibold hover:text-indigo-600 transition py-2">
                Minha Conta
              </Link>
              <Link href="/criar-rifa" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 transition text-center">
                Criar Rifa
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-2 rounded-lg transition text-center">
                Entrar
              </Link>
              <Link href="/auth/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 transition text-center">
                Criar Conta
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
