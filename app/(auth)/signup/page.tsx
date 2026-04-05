'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    })
    if (error) {
      setError(error.message)
    } else {
      router.push('/login?message=Cuenta creada. Por favor inicia sesiÃ³n.')
    }
    setLoading(false)
  }

  return (
    <div className="w-full max-w-sm mx-auto mt-10 px-4 sm:px-0">
      <h1 className="text-2xl font-bold mb-6 text-center text-primary">Crear cuenta</h1>
      <form onSubmit={handleSignup} className="space-y-4">
        <Input
          placeholder="Nombre completo"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <Input
          type="email"
          placeholder="Correo electrÃ³nico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="ContraseÃ±a"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full h-12 text-lg">
          {loading ? 'Registrando...' : 'Registrarse'}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        ¿Ya tienes cuenta? <Link href="/login" className="text-primary hover:text-primaryHover font-medium hover:underline">Inicia sesión</Link>
      </p>
    </div>
  )
}
