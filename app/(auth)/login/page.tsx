"use client"

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

import { Suspense } from 'react'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
    } else {
      router.push(redirect)
    }
    setLoading(false)
  }

  return (
    <div className="w-full max-w-sm mx-auto mt-10 px-4 sm:px-0">
      <h1 className="text-2xl font-bold mb-6 text-center text-primary">Iniciar sesión</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <Input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full h-12 text-lg">
          {loading ? 'Ingresando...' : 'Ingresar'}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        ¿No tienes cuenta? <Link href="/signup" className="text-primary hover:text-primaryHover font-medium hover:underline">Regístrate</Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto mt-10">Cargando...</div>}>
      <LoginForm />
    </Suspense>
  )
}