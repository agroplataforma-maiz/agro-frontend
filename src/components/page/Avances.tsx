"use client";

import { useState } from "react";

type Avance = {
    fecha: string;
    titulo: string;
    descripcion: string;
    estado: string;
    estadoClase: string;
};

type Actividad = {
    icono: string;
    texto: string;
};

type Etapa = {
    nombre: string;
    estado: string;
    estadoClase: string;
    duracion: string;
    progreso: string;
    avances: Avance[];
    actividades: Actividad[];
};

const ETAPAS: Etapa[] = [
    {
        nombre: "Etapa 1 · Diagnóstico territorial y sistematización de datos",
        estado: "Terminada",
        estadoClase: "badge-completado",
        duracion: "Duración: 5 meses · 2025",
        progreso: "100%",

        avances: [
            {
                fecha: "MES 1",
                titulo: "Diseño de la base de datos",
                descripcion:
                    "Arquitectura PostgreSQL/PostGIS con 7 esquemas y 40+ tablas.",
                estado: "Completado",
                estadoClase: "badge-completado",
            },
            {
                fecha: "MES 2",
                titulo: "Catálogos territoriales",
                descripcion:
                    "Estados, municipios, comunidades, localidades y lenguas originarias cargados.",
                estado: "Completado",
                estadoClase: "badge-completado",
            },
            {
                fecha: "MES 3",
                titulo: "Módulos de captura",
                descripcion:
                    "Frontend completo para productores, catálogos y módulos social y cultural.",
                estado: "Completado",
                estadoClase: "badge-completado",
            },
            {
                fecha: "MES 4",
                titulo: "Visitas de campo",
                descripcion:
                    "Levantamiento en 15+ comunidades con GPS y dron Mavic 3.",
                estado: "Completado",
                estadoClase: "badge-completado",
            },
            {
                fecha: "MES 5",
                titulo: "Informe de diagnóstico",
                descripcion:
                    "Reporte socioterritorial y análisis preliminar de resultados de campo.",
                estado: "Completado",
                estadoClase: "badge-completado",
            },
        ],

        actividades: [
            {
                icono: "✅",
                texto: "Base de datos PostgreSQL/PostGIS construida",
            },
            {
                icono: "✅",
                texto: "Módulos de captura frontend listos",
            },
            {
                icono: "✅",
                texto: "Sistema de autenticación JWT implementado",
            },
            {
                icono: "✅",
                texto: "Visitas de campo en 15+ comunidades",
            },
            {
                icono: "✅",
                texto: "Entrevistas y registro GPS",
            },
            {
                icono: "✅",
                texto: "Vuelos de dron DJI Mavic 3 Multispectral",
            },
            {
                icono: "✅",
                texto: "Análisis satelital Sentinel-2 / GEE",
            },
            {
                icono: "✅",
                texto: "Informe de diagnóstico socioterritorial",
            },
        ],
    },

    {
        nombre: "Etapa 2 · Desarrollo tecnológico, validación y difusión comunitaria",
        estado: "Actual",
        estadoClase: "badge-en-curso",
        duracion: "Duración: 11 meses · Enero – Noviembre 2026",
        progreso: "0%",

        avances: [
            {
                fecha: "FASE 1",
                titulo: "Diseño y desarrollo de la agroplataforma",
                descripcion:
                    "Diseño de la base de datos geoespacial, interfaces UX/UI y arquitectura tecnológica.",
                estado: "En curso",
                estadoClase: "badge-en-curso",
            },
            {
                fecha: "FASE 2",
                titulo: "Integración tecnológica",
                descripcion:
                    "Desarrollo del backend, frontend, base de datos geoespacial y mapas interactivos.",
                estado: "En curso",
                estadoClase: "badge-en-curso",
            },
            {
                fecha: "FASE 3",
                titulo: "Análisis espacial y mapas temáticos",
                descripcion:
                    "Aplicación de herramientas SIG e inteligencia artificial para analizar información territorial.",
                estado: "Próximo",
                estadoClase: "badge-proximo",
            },
            {
                fecha: "FASE 4",
                titulo: "Análisis nutrimental y documentación",
                descripcion:
                    "Análisis de muestras de maíces nativos y elaboración de documentos técnicos y materiales visuales.",
                estado: "Próximo",
                estadoClase: "badge-proximo",
            },
            {
                fecha: "FASE 5",
                titulo: "Validación y difusión comunitaria",
                descripcion:
                    "Pruebas de usabilidad, talleres participativos y capacitación para el uso de la plataforma.",
                estado: "Próximo",
                estadoClase: "badge-proximo",
            },
        ],

        actividades: [
            {
                icono: "⏳",
                texto: "Desarrollo iterativo de la aplicación web",
            },
            {
                icono: "⏳",
                texto: "Integración de backend, base de datos geoespacial y mapas interactivos",
            },
            {
                icono: "⏳",
                texto: "Análisis espacial con SIG e inteligencia artificial",
            },
            {
                icono: "⏳",
                texto: "Integración de imágenes satelitales y capturas de dron",
            },
            {
                icono: "⏳",
                texto: "Análisis nutrimental de al menos 30 muestras de maíces nativos",
            },
            {
                icono: "⏳",
                texto: "Generación de documentos técnicos y materiales de difusión",
            },
            {
                icono: "⏳",
                texto: "Pruebas de usabilidad y talleres comunitarios",
            },
            {
                icono: "⏳",
                texto: "Elaboración de manuales, videotutoriales y presentación de resultados",
            },
        ],
    },
];

export default function Avances() {
    // 0 = Etapa 1 | 1 = Etapa 2
    // La página inicia mostrando la Etapa 2.
    const [etapaSeleccionada, setEtapaSeleccionada] = useState(1);

    const etapa = ETAPAS[etapaSeleccionada];

    return (
        <section className="sec" id="avances">
            <div className="sec-kicker reveal">Estado del proyecto</div>

            <h2 className="sec-titulo reveal">
                Avances y <em>próximos pasos</em>
            </h2>

            <div className="etapas-selector reveal">
                <label htmlFor="selector-etapa">
                    Visualizar etapa:
                </label>

                <select
                    id="selector-etapa"
                    value={etapaSeleccionada}
                    onChange={(e) =>
                        setEtapaSeleccionada(Number(e.target.value))
                    }
                >
                    {ETAPAS.map((etapa, index) => (
                        <option key={etapa.nombre} value={index}>
                            {etapa.nombre}
                        </option>
                    ))}
                </select>
            </div>

            <div className="avances-grid">
                <div className="reveal">
                    {etapa.avances.map((avance) => (
                        <div
                            className="avance-item"
                            key={`${etapa.nombre}-${avance.fecha}`}
                        >
                            <div className="avance-fecha">
                                {avance.fecha}
                            </div>

                            <div>
                                <div className="avance-titulo">
                                    {avance.titulo}
                                </div>

                                <div className="avance-desc">
                                    {avance.descripcion}
                                </div>

                                <span
                                    className={`avance-badge ${avance.estadoClase}`}
                                >
                                    {avance.estado}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="etapa-vis reveal">
                    <div className="etapa-header">
                        <div className="etapa-nombre">
                            {etapa.nombre}
                        </div>

                        <span
                            className={`etapa-estado ${etapa.estadoClase}`}
                        >
                            {etapa.estado}
                        </span>
                    </div>

                    <div className="etapa-body">
                        <div className="etapa-dur">
                            {etapa.duracion}
                        </div>

                        {etapa.actividades.map((actividad, index) => (
                            <div
                                className="etapa-item"
                                key={`${etapa.nombre}-actividad-${index}`}
                            >
                                <span className="etapa-item-ico">
                                    {actividad.icono}
                                </span>

                                {actividad.texto}
                            </div>
                        ))}

                        <div className="prog-wrap">
                            <div className="prog-track">
                                <div
                                    className="prog-fill"
                                    style={{
                                        width: etapa.progreso,
                                    }}
                                ></div>
                            </div>

                            <div className="prog-lbl">
                                ▸ {etapa.progreso} completado
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}