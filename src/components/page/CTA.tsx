import Link from 'next/link';

export default function CTA() {

    return (
        <div className="cta-wrap">
            <div className="cta-inner reveal">
                <h2 className="cta-titulo">¿Formas parte<br />del <em>equipo</em>?</h2>
                <p className="cta-desc">Accede a la plataforma para registrar productores, capturar datos de campo, consultar catálogos y visualizar el avance del proyecto en tiempo real.</p>
                <div className="cta-btns">
                    <Link className="btn-hero-primary" href="/login">🔐 Iniciar sesión</Link>
                    <Link className="btn-hero-ghost" href="/login#registro">✉ Crear cuenta</Link>
                </div>
            </div>
        </div>
    );

}