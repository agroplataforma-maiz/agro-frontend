import Link from 'next/link';

export default function Hero() {
   
    return (
        <section className="hero">
            <div className="hero-bg"></div>
            <div className="hero-grain"></div>
            <div className="hero-lines"></div>
            <svg className="hero-maiz-deco" viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg">
                <path d="M60 180 Q20 140 10 90 Q40 110 60 150 Z" fill="#4A8C64" />
                <path d="M60 180 Q100 140 110 90 Q80 110 60 150 Z" fill="#2A5C3F" />
                <path d="M60 160 Q15 120 8 60 Q45 90 60 140 Z" fill="#5AAD78" opacity=".6" />
                <path d="M60 160 Q105 120 112 60 Q75 90 60 140 Z" fill="#3A7050" opacity=".6" />
                <rect x="56" y="155" width="8" height="40" rx="3" fill="#3A7050" />
                <ellipse cx="60" cy="95" rx="22" ry="55" fill="#D4922A" />
                <ellipse cx="48" cy="60" rx="4" ry="5" fill="#F0B429" /><ellipse cx="56" cy="58" rx="4" ry="5" fill="#E8A020" />
                <ellipse cx="64" cy="58" rx="4" ry="5" fill="#F0B429" /><ellipse cx="72" cy="60" rx="4" ry="5" fill="#E8A020" />
                <ellipse cx="46" cy="72" rx="4" ry="5" fill="#F2C040" /><ellipse cx="54" cy="70" rx="4" ry="5" fill="#E8A020" />
                <ellipse cx="62" cy="70" rx="4" ry="5" fill="#F0B429" /><ellipse cx="70" cy="70" rx="4" ry="5" fill="#F2C040" />
                <ellipse cx="78" cy="72" rx="4" ry="5" fill="#E8A020" /><ellipse cx="44" cy="84" rx="4" ry="5" fill="#E8A020" />
                <ellipse cx="52" cy="82" rx="4" ry="5" fill="#F0B429" /><ellipse cx="60" cy="82" rx="4" ry="5" fill="#F2C040" />
                <ellipse cx="68" cy="82" rx="4" ry="5" fill="#E8A020" /><ellipse cx="76" cy="84" rx="4" ry="5" fill="#F0B429" />
                <ellipse cx="44" cy="96" rx="4" ry="5" fill="#F0B429" /><ellipse cx="52" cy="94" rx="4" ry="5" fill="#E8A020" />
                <ellipse cx="60" cy="94" rx="4" ry="5" fill="#F2C040" /><ellipse cx="68" cy="94" rx="4" ry="5" fill="#F0B429" />
                <ellipse cx="76" cy="96" rx="4" ry="5" fill="#E8A020" /><ellipse cx="46" cy="108" rx="4" ry="5" fill="#E8A020" />
                <ellipse cx="54" cy="106" rx="4" ry="5" fill="#F0B429" /><ellipse cx="62" cy="106" rx="4" ry="5" fill="#F2C040" />
                <ellipse cx="70" cy="106" rx="4" ry="5" fill="#E8A020" /><ellipse cx="78" cy="108" rx="4" ry="5" fill="#F0B429" />
                <ellipse cx="48" cy="120" rx="4" ry="5" fill="#F0B429" /><ellipse cx="56" cy="118" rx="4" ry="5" fill="#E8A020" />
                <ellipse cx="64" cy="118" rx="4" ry="5" fill="#F2C040" /><ellipse cx="72" cy="120" rx="4" ry="5" fill="#F0B429" />
                <path d="M38 52 Q30 30 36 10" stroke="#F2C040" strokeWidth="1.2" fill="none" opacity=".6" />
                <path d="M48 50 Q44 26 52 6" stroke="#F0B429" strokeWidth="1.2" fill="none" opacity=".6" />
                <path d="M60 48 Q62 22 68 4" stroke="#F2C040" strokeWidth="1.2" fill="none" opacity=".6" />
                <path d="M72 50 Q80 26 78 8" stroke="#F0B429" strokeWidth="1.2" fill="none" opacity=".6" />
            </svg>
            <div className="hero-contenido">
                <div className="hero-kicker">PEE-2025-G-369 · Secihti 2025</div>
                <h1 className="hero-h1">Conservando el<br />maíz <em>nativo</em><br />de la Huasteca</h1>
                <p className="hero-desc">Una agroplataforma digital que combina inteligencia geoespacial, saberes comunitarios y ciencia de datos para proteger la biodiversidad del maíz nativo en la Huasteca Potosina.</p>
                <div className="hero-acciones">
                    <Link className="btn-hero-primary" href="/login">🔐 Acceder a la plataforma</Link>
                    <a className="btn-hero-ghost" href="/divulgacion.html">🌽 Para comunidades</a>
                </div>
            </div>
        </section>
    );
}