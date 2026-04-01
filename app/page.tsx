import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'

export default async function Home() {
  const supabase = await createClient()
  const { data: webapps } = await supabase.from('webapps').select('*')
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-center">Plataforma Sentinel</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {webapps?.map((webapp) => (
          <Card key={webapp.id} className="hover:shadow-lg transition">
            <CardHeader>
              <CardTitle>{webapp.name}</CardTitle>
              <CardDescription>{webapp.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href={`/${webapp.slug}`}
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Ingresar
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}