// src/app/productores/[id]/page.tsx
// Perfil PÚBLICO de productor — Server Component con SEO dinámico
// URL: /productores/42 → indexable, compartible, Open Graph

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Productor } from '@/types'
import { nombreCompleto, calcularEdad, dash } from '@/lib/utils'
import styles from './perfil.module.css'

const API = process.env.NEXT_PUBLIC_API_URL

function buildApiUrl(path: string): string {
  const base = (API ?? '').replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const apiPath = normalizedPath.startsWith('/api/') ? normalizedPath : `/api${normalizedPath}`
  return `${base}${apiPath}`
}

async function getProductor(id: string): Promise<Productor | null> {
  const res = await fetch(buildApiUrl(`/social/productor/${id}/`), {
    next: { revalidate: 120 },
  })
  if (!res.ok) return null
  return res.json()
}

// SEO dinámico por productor — cada perfil tiene su propio título y descripción
export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  const p = await getProductor(id)
  if (!p) return { title: 'Productor no encontrado' }

  const nombre = nombreCompleto(p.nombres, p.apellido_paterno, p.apellido_materno)
  return {
    title: `${nombre} · Productor de Maíz Nativo`,
    description:
      `${nombre} es guardián del maíz nativo en ${p.municipio_nombre ?? 'la Huasteca Potosina'}` +
      (p.anios_experiencia ? ` con ${p.anios_experiencia} años de experiencia.` : '.'),
    openGraph: {
      title: nombre,
      description: `Guardián del maíz nativo · ${p.municipio_nombre ?? 'Huasteca Potosina'}`,
    },
  }
}

export default async function PerfilPublicoPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const p = await getProductor(id)
  if (!p) notFound()

  const nombre = nombreCompleto(p.nombres, p.apellido_paterno, p.apellido_materno)
  const edad   = p.fecha_nacimiento ? calcularEdad(p.fecha_nacimiento) : null

  return (
    <main className={styles.main}>
      <Link href="/productores" className={styles.btnVolver}>← Todos los productores</Link>

      <header className={styles.header}>
        <div className={styles.avatarGrande}>{nombre.charAt(0)}</div>
        <div className={styles.headerInfo}>
          <h1 className={styles.nombre}>{nombre}</h1>
          <div className={styles.meta}>
            {edad && <span>{edad} años</span>}
            {p.genero && <span>{p.genero}</span>}
            {p.municipio_nombre && <span>📍 {p.municipio_nombre}</span>}
            {p.localidad_nombre && <span>{p.localidad_nombre}</span>}
          </div>
          {p.tipo_productor_nombre && (
            <span className={styles.badge}>{p.tipo_productor_nombre}</span>
          )}
        </div>
      </header>

      <div className={styles.datos}>
        <DatoItem label="Municipio"  valor={p.municipio_nombre} />
        <DatoItem label="Localidad"  valor={p.localidad_nombre} />
        <DatoItem label="Comunidad"  valor={p.comunidad_nombre} />
        <DatoItem label="Experiencia" valor={p.anios_experiencia ? `${p.anios_experiencia} años` : undefined} />
      </div>
    </main>
  )
}

function DatoItem({ label, valor }: { label: string; valor?: string }) {
  return (
    <div className={styles.dato}>
      <span className={styles.datoLabel}>{label}</span>
      <span className={styles.datoValor}>{dash(valor)}</span>
    </div>
  )
}
