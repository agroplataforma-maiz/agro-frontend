export default function Equipo() {

    return (
        <section className="sec" id="avances">
        <div className="sec-kicker reveal">Estado del proyecto</div>
        <h2 className="sec-titulo reveal">Avances y <em>próximos pasos</em></h2>
        <div className="avances-grid">
            <div className="reveal">
                <div className="avance-item">
                    <div className="avance-fecha">MES 1</div>
                    <div><div className="avance-titulo">Diseño de la base de datos</div><div className="avance-desc">Arquitectura PostgreSQL/PostGIS con 7 esquemas y 40+ tablas.</div><span className="avance-badge badge-completado">Completado</span></div>
                </div>
                <div className="avance-item">
                    <div className="avance-fecha">MES 2</div>
                    <div><div className="avance-titulo">Catálogos territoriales</div><div className="avance-desc">Estados, municipios, comunidades, localidades y lenguas originarias cargados.</div><span className="avance-badge badge-completado">Completado</span></div>
                </div>
                <div className="avance-item">
                    <div className="avance-fecha">MES 3</div>
                    <div><div className="avance-titulo">Módulos de captura</div><div className="avance-desc">Frontend completo para productores, catálogos y módulos social y cultural.</div><span className="avance-badge badge-en-curso">En curso</span></div>
                </div>
                <div className="avance-item">
                    <div className="avance-fecha">MES 4</div>
                    <div><div className="avance-titulo">Visitas de campo</div><div className="avance-desc">Levantamiento en 15+ comunidades con GPS y dron Mavic 3.</div><span className="avance-badge badge-en-curso">En curso</span></div>
                </div>
                <div className="avance-item">
                    <div className="avance-fecha">MES 5</div>
                    <div><div className="avance-titulo">Informe de diagnóstico</div><div className="avance-desc">Reporte socioterritorial y análisis preliminar de resultados de campo.</div><span className="avance-badge badge-proximo">Próximo</span></div>
                </div>
            </div>
            <div className="etapa-vis reveal">
                <div className="etapa-header">
                    <div className="etapa-nombre">Etapa 1 · Diagnóstico</div>
                    <span className="etapa-estado badge-en-curso">En curso</span>
                </div>
                <div className="etapa-body">
                    <div className="etapa-dur">Duración: 5 meses · 2025</div>
                    <div className="etapa-item"><span className="etapa-item-ico">✅</span> Base de datos PostgreSQL/PostGIS construida</div>
                    <div className="etapa-item"><span className="etapa-item-ico">✅</span> Módulos de captura frontend listos</div>
                    <div className="etapa-item"><span className="etapa-item-ico">✅</span> Sistema de autenticación JWT implementado</div>
                    <div className="etapa-item"><span className="etapa-item-ico">🔄</span> Visitas de campo en 15+ comunidades</div>
                    <div className="etapa-item"><span className="etapa-item-ico">🔄</span> Entrevistas y registro GPS</div>
                    <div className="etapa-item"><span className="etapa-item-ico">⏳</span> Vuelos de dron DJI Mavic 3 Multispectral</div>
                    <div className="etapa-item"><span className="etapa-item-ico">⏳</span> Análisis satelital Sentinel-2 / GEE</div>
                    <div className="etapa-item"><span className="etapa-item-ico">⏳</span> Informe de diagnóstico socioterritorial</div>
                    <div className="prog-wrap">
                        <div className="prog-track"><div className="prog-fill" style={{ width: '68%' }}></div></div>
                        <div className="prog-lbl">▸ 68% completado</div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    );
}