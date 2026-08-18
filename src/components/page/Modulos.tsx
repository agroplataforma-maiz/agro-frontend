import Link from 'next/link';

export default function Modulos() {

    return (
        <section className="sec reveal" id="modulos">
            <div className="sec-kicker">Plataforma digital</div>
            <h2 className="sec-titulo">Módulos del <em>sistema</em></h2>
            <p className="sec-desc">La agroplataforma integra datos geoespaciales, socioeconómicos, culturales y agronómicos en un sistema accesible para investigadores, técnicos y comunidades.</p>
            <div className="modulos-landing">
                <div className="ml-card">
                    <div className="ml-ico">🧑‍🌾</div>
                    <div className="ml-nombre">Productores</div>
                    <p className="ml-desc">Registro completo de custodios del maíz nativo: perfil personal, socioeconómico, seguridad alimentaria, vulnerabilidad climática, identidad cultural y consentimiento informado.</p>
                    <Link className="ml-link" href="/login">Acceder →</Link>
                </div>
                <div className="ml-card">
                    <div className="ml-ico">🎭</div>
                    <div className="ml-nombre">Social y Cultural</div>
                    <p className="ml-desc">Saberes tradicionales, rituales agrícolas, narrativas orales, gastronomía, transmisión del conocimiento y nombres en lenguas originarias — el patrimonio biocultural del maíz.</p>
                    <Link className="ml-link" href="/login">Acceder →</Link>
                </div>
                <div className="ml-card">
                    <div className="ml-ico">📋</div>
                    <div className="ml-nombre">Catálogos</div>
                    <p className="ml-desc">Razas de maíz, colores de grano, uso del maíz, municipios, comunidades, lenguas, pueblos originarios y más de 15 catálogos del sistema con CRUD completo.</p>
                    <Link className="ml-link" href="/login">Acceder →</Link>
                </div>
                <div className="ml-card" style={{ opacity: .65 }}>
                    <div className="ml-ico">🗺️</div>
                    <div className="ml-nombre">Mapas y SIG</div>
                    <p className="ml-desc">Visualización interactiva de parcelas georeferenciadas, hotspots de diversidad genética, zonas prioritarias de conservación y cambios de uso de suelo. <em>Próximamente.</em></p>
                </div>
                <div className="ml-card" style={{ opacity: .65 }}>
                    <div className="ml-ico">🔬</div>
                    <div className="ml-nombre">Fenotípico</div>
                    <p className="ml-desc">Evaluaciones morfológicas, análisis nutrimentales de 30+ variedades, fenología y evidencia fotográfica de mazorca, planta y grano. <em>Próximamente.</em></p>
                </div>
                <div className="ml-card" style={{ opacity: .65 }}>
                    <div className="ml-ico">🌱</div>
                    <div className="ml-nombre">Agronómico</div>
                    <p className="ml-desc">Germoplasma nativo, ciclos agrícolas, sistemas de semilla, economía del cultivo y análisis de riesgo de pérdida de variedades. <em>Próximamente.</em></p>
                </div>
            </div>
        </section>
    );

}