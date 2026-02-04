'use client'

import { useAuth } from '@/context/auth-context'
import { useEffect, useState } from 'react'

export default function DebugPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const [storageUser, setStorageUser] = useState<any>(null)
  const [storageToken, setStorageToken] = useState<any>(null)

  useEffect(() => {
    setStorageUser(localStorage.getItem('user'))
    setStorageToken(localStorage.getItem('token'))
  }, [])

  return (
    <div className="p-8 space-y-4 text-slate-900">
      <h1 className="text-2xl font-bold">🐛 Debug Auth</h1>
      
      <div className="bg-slate-100 p-4 rounded">
        <h2 className="font-bold mb-2">Context State:</h2>
        <pre className="bg-white p-2 rounded text-xs overflow-auto">
{JSON.stringify({
  user,
  isAuthenticated,
  loading
}, null, 2)}
        </pre>
      </div>

      <div className="bg-slate-100 p-4 rounded">
        <h2 className="font-bold mb-2">LocalStorage:</h2>
        <pre className="bg-white p-2 rounded text-xs overflow-auto">
{JSON.stringify({
  user: storageUser ? JSON.parse(storageUser) : null,
  token: storageToken ? `${storageToken.substring(0, 20)}...` : null
}, null, 2)}
        </pre>
      </div>

      <button 
        onClick={() => {
          localStorage.clear()
          window.location.reload()
        }}
        className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700"
      >
        Limpar localStorage
      </button>
    </div>
  )
}
