import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('agro_token')?.value
  const rol = cookieStore.get('agro_rol')?.value

  if (token && rol) {
    redirect('/dashboard')
  }

  return (
    <main>
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grain" />
        <div className="hero-contenido">
          <p className="hero-kicker">Agroplataforma Maiz Nativo</p>
          <h1 className="hero-h1">
            Trazabilidad y analisis de <em>maiz nativo</em>
          </h1>
          <p className="hero-desc">
            Plataforma para registrar productores, comunidades, fenotipos y avance de investigacion
            en la Huasteca Potosina.
          </p>
          <div className="hero-acciones">
            <Link href="/login" className="btn-hero-primary">
              Iniciar sesion
            </Link>
            <a href="#modulos" className="btn-hero-ghost">
              Ver modulos
            </a>
          </div>
        </div>
      </section>

      <section id="modulos" className="sec">
        <p className="sec-kicker">Modulos clave</p>
        <h2 className="sec-titulo">
          Captura, gestion y consulta en un solo <em>flujo</em>
        </h2>
        <p className="sec-desc">
          Accede a productores, informacion sociocultural y fenotipos con una vista unificada
          orientada al trabajo de campo y analisis tecnico.
        </p>
        <div className="modulos-landing">
          <article className="ml-card">
            <span className="ml-ico">🌽</span>
            <h3 className="ml-nombre">Productores</h3>
            <p className="ml-desc">Registro y seguimiento del padron de productores y su contexto.</p>
          </article>
          <article className="ml-card">
            <span className="ml-ico">🧬</span>
            <h3 className="ml-nombre">Fenotipo</h3>
            <p className="ml-desc">Captura de descriptores y reportes para caracterizacion de materiales.</p>
          </article>
          <article className="ml-card">
            <span className="ml-ico">📍</span>
            <h3 className="ml-nombre">Comunidades</h3>
            <p className="ml-desc">Contexto territorial y social para decisiones basadas en evidencia.</p>
          </article>
        </div>
      </section>

      <section className="cta-wrap">
        <div className="cta-inner">
          <h2 className="cta-titulo">
            Entra a la plataforma y continua con tu <em>captura</em>
          </h2>
          <p className="cta-desc">Solo usuarios autorizados pueden acceder a los modulos internos.</p>
          <div className="cta-btns">
            <Link href="/login" className="btn-hero-primary">
              Ir a login
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
