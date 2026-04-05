import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  let { data: webapps } = await supabase.from('webapps').select('*')
  
  // Si la base de datos está vacía o desconectada, mostramos información por defecto (Fallback)
  if (!webapps || webapps.length === 0) {
    webapps = [
      {
        id: 'fallback-condominio',
        name: 'Sentinel-Condominio',
        slug: 'condominio',
        description: 'Gestión completa de condominios: personal, finanzas y reportes.',
        video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
      }
    ] as any;
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-10 px-4">
      <h1 className="text-3xl font-bold mb-12 text-center text-primary">Plataforma Sentinel</h1>
      
      <div className="w-full max-w-5xl flex justify-center flex-wrap gap-10">
        {webapps?.map((webapp) => (
          <div 
            key={webapp.id} 
            className="w-full max-w-[340px] bg-[#fdf5cc] dark:bg-[#d6c26b] rounded-2xl p-6 flex flex-col items-center text-center shadow-[0_15px_40px_-5px_rgba(0,0,0,0.2)] dark:shadow-[0_15px_40px_-5px_rgba(0,0,0,0.6)] transition-all hover:-translate-y-1 hover:shadow-[0_20px_50px_-5px_rgba(0,0,0,0.25)] border border-[#fbf2b5]"
          >
            {/* Contenedor del video con borde naranja */}
            <div className="w-full aspect-video border-[1.5px] border-orange-400 p-0.5 rounded-sm mb-6 bg-orange-50/50 flex items-center justify-center overflow-hidden">
              {webapp.video_url ? (
                <iframe 
                  src={webapp.video_url} 
                  title={`${webapp.name} demo`}
                  className="w-full h-full"
                  allowFullScreen
                />
              ) : (
                <span className="text-orange-400 font-medium">Video</span>
              )}
            </div>
            
            {/* Título en azul */}
            <h2 className="text-lg font-semibold text-blue-700 dark:text-blue-900 mb-6">
              {webapp.name}
            </h2>
            
            {/* Botón redondeado con borde azul */}
            <Link
              href={`/${webapp.slug}`}
              className="inline-block border-[1.5px] border-blue-700 text-blue-700 dark:text-blue-900 dark:border-blue-900 font-medium px-8 py-2 rounded-full hover:bg-blue-700 hover:text-white dark:hover:bg-blue-900 dark:hover:text-[#fdf5cc] transition-colors"
            >
              Suscribirse o Entrar
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}