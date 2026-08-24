'use client'

import { useState, useEffect, useRef } from 'react'
import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query'
import { GET, POST, PUT, DEL } from '@/lib/api'
import { useAppStore } from '@/store/useAppStore'
import Tabla, { type Columna } from '@/components/ui/Tabla'
import type { Catalogo } from '@/types'
import styles from './catalogos.module.css'
import AdminShell from '@/components/dashboard/AdminShell'
import Button from '@/components/ui/Button'
import ModuleHero from '@/components/ui/ModuleHero'
import SearchInput from '@/components/ui/SearchInput'
import Modal from '@/components/ui/Modal'
import Field from '@/components/ui/Field'
import SelectField from '@/components/ui/SelectField'
import Paginacion from '@/components/ui/Paginacion'
import AccessGuardScreen from '@/components/ui/AccessGuardScreen'
import { useRolGuard } from '@/hooks/useRolGuard'
import { useRouter } from 'next/navigation'
import { useCatalogos } from '@/hooks/useCatalogos'

// Tipos de campo para el modal dinámico
type CampoTexto     = { key: string; label: string; type: 'text' | 'textarea' | 'number'; required?: boolean }
type CampoSelect    = { key: string; label: string; type: 'select'; queryPath: string; required?: boolean }
type CampoCheckbox  = { key: string; label: string; type: 'checkbox' }
type Campo = CampoTexto | CampoSelect | CampoCheckbox
type CatDef = { key: string; label: string; path: string; campos: Campo[] }

// Ejes temáticos con sus catálogos
const EJES: { eje: string; emoji: string; catalogos: CatDef[] }[] = [
  {
    eje: 'Germoplasma', emoji: '🌽',
    catalogos: [
      {
        key: 'raza_maiz', label: 'Razas de maíz', path: '/catalogo/raza_maiz',
        campos: [
          { key: 'nombre',        label: 'Nombre',           type: 'text',     required: true },
          { key: 'descripcion',   label: 'Descripción',      type: 'textarea' },
          { key: 'region_origen', label: 'Región de origen', type: 'text' },
          { key: 'tipo_ciclo',    label: 'Tipo de ciclo',    type: 'text' },
          { key: 'es_nativa',     label: 'Es nativa',        type: 'checkbox' },
        ],
      },
      {
        key: 'color_grano', label: 'Colores de grano', path: '/catalogo/color_grano',
        campos: [
          { key: 'nombre',      label: 'Nombre',      type: 'text', required: true },
          { key: 'descripcion', label: 'Descripción', type: 'textarea' },
          { key: 'es_nativo',   label: 'Es nativo',   type: 'checkbox' },
        ],
      },
      {
        key: 'estado_conservacion', label: 'Estados de conservación', path: '/catalogo/estado_conservacion',
        campos: [
          { key: 'nombre',       label: 'Nombre',               type: 'text',     required: true },
          { key: 'descripcion',  label: 'Descripción',           type: 'textarea' },
          { key: 'nivel_riesgo', label: 'Nivel de riesgo (1–5)', type: 'number' },
        ],
      },
      {
        key: 'uso_maiz', label: 'Usos del maíz', path: '/catalogo/uso_maiz',
        campos: [
          { key: 'nombre',      label: 'Nombre',      type: 'text',     required: true },
          { key: 'descripcion', label: 'Descripción', type: 'textarea' },
        ],
      },
    ],
  },
  {
    eje: 'Agronómico', emoji: '🌾',
    catalogos: [
      {
        key: 'tipo_practica', label: 'Tipos de práctica', path: '/catalogo/tipo_practica',
        campos: [
          { key: 'nombre',      label: 'Nombre',      type: 'text',     required: true },
          { key: 'descripcion', label: 'Descripción', type: 'textarea' },
        ],
      },
      {
        key: 'practica_agricola', label: 'Prácticas agrícolas', path: '/catalogo/practica_agricola',
        campos: [
          { key: 'nombre',      label: 'Nombre',           type: 'text',     required: true },
          { key: 'descripcion', label: 'Descripción',      type: 'textarea' },
          { key: 'tipo_id',     label: 'Tipo de práctica', type: 'select', queryPath: '/catalogo/tipo_practica' },
        ],
      },
      {
        key: 'sistema_manejo', label: 'Sistemas de manejo', path: '/catalogo/sistema_manejo',
        campos: [
          { key: 'nombre',         label: 'Nombre',         type: 'text',     required: true },
          { key: 'descripcion',    label: 'Descripción',    type: 'textarea' },
          { key: 'es_tradicional', label: 'Es tradicional', type: 'checkbox' },
        ],
      },
      {
        key: 'sistema_cultivo', label: 'Sistemas de cultivo', path: '/catalogo/sistema_cultivo',
        campos: [
          { key: 'nombre',      label: 'Nombre',      type: 'text',     required: true },
          { key: 'descripcion', label: 'Descripción', type: 'textarea' },
        ],
      },
      {
        key: 'metodo_almacenamiento', label: 'Métodos de almacenamiento', path: '/catalogo/metodo_almacenamiento',
        campos: [
          { key: 'nombre',      label: 'Nombre',      type: 'text',     required: true },
          { key: 'descripcion', label: 'Descripción', type: 'textarea' },
        ],
      },
    ],
  },
  {
    eje: 'Fenotipo', emoji: '🔬',
    catalogos: [
      {
        key: 'tipo_fenotipo', label: 'Tipos de fenotipo', path: '/fenotipo/tipo_fenotipo',
        campos: [
          { key: 'nombre',      label: 'Nombre',      type: 'text',     required: true },
          { key: 'unidad',      label: 'Unidad',      type: 'text' },
          { key: 'descripcion', label: 'Descripción', type: 'textarea' },
        ],
      },
      {
        key: 'etapa_fenologica', label: 'Etapas fenológicas', path: '/catalogo/etapa_fenologica',
        campos: [
          { key: 'nombre',      label: 'Nombre',      type: 'text',     required: true },
          { key: 'descripcion', label: 'Descripción', type: 'textarea' },
        ],
      },
    ],
  },
  {
    eje: 'Territorio', emoji: '🗺',
    catalogos: [
      {
        key: 'estado', label: 'Estados', path: '/catalogo/estado',
        campos: [
          { key: 'nombre',       label: 'Nombre',       type: 'text', required: true },
          { key: 'clave_inegi',  label: 'Clave INEGI',  type: 'text' },
          { key: 'abreviatura',  label: 'Abreviatura',  type: 'text' },
        ],
      },
      {
        key: 'municipio', label: 'Municipios', path: '/catalogo/municipio',
        campos: [
          { key: 'nombre',              label: 'Nombre',              type: 'text',   required: true },
          { key: 'estado_id',           label: 'Estado',              type: 'select', queryPath: '/catalogo/estado', required: true },
          { key: 'clave_inegi',         label: 'Clave INEGI',         type: 'text' },
          { key: 'clave_completa',      label: 'Clave completa',      type: 'text' },
          { key: 'nombre_corto',        label: 'Nombre corto',        type: 'text' },
          { key: 'cabecera',            label: 'Cabecera municipal',  type: 'text' },
          { key: 'region',              label: 'Región',              type: 'text' },
          { key: 'superficie_km2',      label: 'Superficie km²',      type: 'number' },
          { key: 'latitud_centroide',   label: 'Latitud centroide',   type: 'number' },
          { key: 'longitud_centroide',  label: 'Longitud centroide',  type: 'number' },
        ],
      },
      {
        key: 'localidad', label: 'Localidades', path: '/catalogo/localidad',
        campos: [
          { key: 'nombre',            label: 'Nombre',              type: 'text',   required: true },
          { key: 'municipio_id',      label: 'Municipio',           type: 'select', queryPath: '/catalogo/municipio', required: true },
          { key: 'comunidad_id',      label: 'Comunidad',           type: 'select', queryPath: '/catalogo/comunidad' },
          { key: 'clave_inegi',       label: 'Clave INEGI',         type: 'text' },
          { key: 'nombre_lengua_orig',label: 'Nombre en lengua orig.', type: 'text' },
          { key: 'tipo',              label: 'Tipo',                type: 'text' },
          { key: 'categoria',         label: 'Categoría',           type: 'text' },
          { key: 'grado_marginacion', label: 'Grado de marginación',type: 'text' },
          { key: 'poblacion_total',   label: 'Población total',     type: 'number' },
          { key: 'num_viviendas',     label: 'Núm. viviendas',      type: 'number' },
          { key: 'latitud',           label: 'Latitud',             type: 'number' },
          { key: 'longitud',          label: 'Longitud',            type: 'number' },
          { key: 'altitud_m',         label: 'Altitud (m)',         type: 'number' },
          { key: 'indigena',          label: 'Comunidad indígena',  type: 'checkbox' },
          { key: 'fuente',            label: 'Fuente',              type: 'text' },
        ],
      },
      {
        key: 'comunidad', label: 'Comunidades', path: '/core/comunidad',
        campos: [
          { key: 'nombre',             label: 'Nombre',                 type: 'text',   required: true },
          { key: 'municipio_id',       label: 'Municipio',              type: 'select', queryPath: '/catalogo/municipio', required: true },
          { key: 'nombre_lengua_orig', label: 'Nombre en lengua orig.', type: 'text' },
          { key: 'tipo',               label: 'Tipo',                   type: 'text' },
          { key: 'poblacion_total',    label: 'Población total',        type: 'number' },
          { key: 'num_localidades',    label: 'Núm. localidades',       type: 'number' },
          { key: 'fuente',             label: 'Fuente',                 type: 'text' },
        ],
      },
      {
        key: 'colonia', label: 'Colonias', path: '/catalogo/colonia',
        campos: [
          { key: 'nombre',       label: 'Nombre',         type: 'text',   required: true },
          { key: 'localidad_id', label: 'Localidad',      type: 'select', queryPath: '/catalogo/localidad', required: true },
          { key: 'tipo',         label: 'Tipo',           type: 'text' },
          { key: 'codigo_postal',label: 'Código postal',  type: 'text' },
          { key: 'latitud',      label: 'Latitud',        type: 'number' },
          { key: 'longitud',     label: 'Longitud',       type: 'number' },
        ],
      },
    ],
  },
  {
    eje: 'Ambiental', emoji: '🌧',
    catalogos: [
      {
        key: 'tipo_evento_climatico', label: 'Tipos de evento climático', path: '/catalogo/tipo_evento_climatico',
        campos: [
          { key: 'nombre',         label: 'Nombre',              type: 'text',     required: true },
          { key: 'descripcion',    label: 'Descripción',         type: 'textarea' },
          { key: 'severidad_base', label: 'Severidad base (1–5)', type: 'number' },
        ],
      },
      {
        key: 'variable_ambiental', label: 'Variables ambientales', path: '/catalogo/variable_ambiental',
        campos: [
          { key: 'nombre',     label: 'Nombre',     type: 'text', required: true },
          { key: 'unidad',     label: 'Unidad',     type: 'text' },
          { key: 'valor_min',  label: 'Valor mínimo', type: 'number' },
          { key: 'valor_max',  label: 'Valor máximo', type: 'number' },
        ],
      },
      {
        key: 'tipo_amenaza', label: 'Tipos de amenaza', path: '/catalogo/tipo_amenaza',
        campos: [
          { key: 'nombre',      label: 'Nombre',      type: 'text',     required: true },
          { key: 'descripcion', label: 'Descripción', type: 'textarea' },
        ],
      },
      {
        key: 'clase_uso_suelo', label: 'Clases de uso de suelo', path: '/catalogo/clase_uso_suelo',
        campos: [
          { key: 'nombre',             label: 'Nombre',              type: 'text',     required: true },
          { key: 'codigo',             label: 'Código',              type: 'text' },
          { key: 'categoria_general',  label: 'Categoría general',   type: 'text' },
          { key: 'descripcion',        label: 'Descripción',         type: 'textarea' },
          { key: 'relevante_maiz',     label: 'Relevante para maíz', type: 'checkbox' },
          { key: 'activo',             label: 'Activo',              type: 'checkbox' },
        ],
      },
    ],
  },
  {
    eje: 'Social', emoji: '👥',
    catalogos: [
      {
        key: 'tipo_productor', label: 'Tipos de productor', path: '/catalogo/tipo_productor',
        campos: [
          { key: 'nombre',      label: 'Nombre',      type: 'text',     required: true },
          { key: 'descripcion', label: 'Descripción', type: 'textarea' },
        ],
      },
      {
        key: 'lengua', label: 'Lenguas', path: '/catalogo/lengua',
        campos: [
          { key: 'nombre',              label: 'Nombre',              type: 'text', required: true },
          { key: 'nombre_original',     label: 'Nombre original',     type: 'text' },
          { key: 'familia_linguistica', label: 'Familia lingüística', type: 'text' },
          { key: 'variante',            label: 'Variante',            type: 'text' },
          { key: 'clave_inali',         label: 'Clave INALI',         type: 'text' },
        ],
      },
      {
        key: 'pueblo_originario', label: 'Pueblos originarios', path: '/catalogo/pueblo_originario',
        campos: [
          { key: 'nombre',               label: 'Nombre',                type: 'text',     required: true },
          { key: 'nombre_propio',        label: 'Nombre propio',         type: 'text' },
          { key: 'lengua_id',            label: 'Lengua',                type: 'select',   queryPath: '/catalogo/lengua' },
          { key: 'region_historica',     label: 'Región histórica',      type: 'text' },
          { key: 'municipios_presencia', label: 'Municipios de presencia', type: 'textarea' },
        ],
      },
    ],
  },
  {
    eje: 'Cultural', emoji: '🎭',
    catalogos: [
      {
        key: 'tipo_ritual_agricola', label: 'Tipos de ritual agrícola', path: '/catalogo/tipo_ritual_agricola',
        campos: [
          { key: 'nombre',      label: 'Nombre',      type: 'text',     required: true },
          { key: 'descripcion', label: 'Descripción', type: 'textarea' },
        ],
      },
      {
        key: 'tipo_narrativa_oral', label: 'Tipos de narrativa oral', path: '/catalogo/tipo_narrativa_oral',
        campos: [
          { key: 'nombre',      label: 'Nombre',      type: 'text',     required: true },
          { key: 'descripcion', label: 'Descripción', type: 'textarea' },
        ],
      },
      {
        key: 'categoria_saber_agricola', label: 'Categorías de saber agrícola', path: '/catalogo/categoria_saber_agricola',
        campos: [
          { key: 'nombre',      label: 'Nombre',      type: 'text',     required: true },
          { key: 'descripcion', label: 'Descripción', type: 'textarea' },
        ],
      },
      {
        key: 'ocasion', label: 'Ocasiones', path: '/catalogo/ocasion',
        campos: [
          { key: 'nombre',      label: 'Nombre',      type: 'text',     required: true },
          { key: 'descripcion', label: 'Descripción', type: 'textarea' },
        ],
      },
      {
        key: 'mecanismo_transmision', label: 'Mecanismos de transmisión', path: '/catalogo/mecanismo_transmision',
        campos: [
          { key: 'nombre',      label: 'Nombre',      type: 'text',     required: true },
          { key: 'descripcion', label: 'Descripción', type: 'textarea' },
        ],
      },
      {
        key: 'vinculo_maiz', label: 'Vínculos con el maíz', path: '/catalogo/vinculo_maiz',
        campos: [
          { key: 'nombre',      label: 'Nombre',      type: 'text',     required: true },
          { key: 'descripcion', label: 'Descripción', type: 'textarea' },
        ],
      },
    ],
  },
  {
    eje: 'Trazabilidad', emoji: '📋',
    catalogos: [
      {
        key: 'tipo_producto_dron', label: 'Tipos de producto dron', path: '/trazabilidad/tipo_producto_dron',
        campos: [
          { key: 'nombre',      label: 'Nombre',      type: 'text',     required: true },
          { key: 'descripcion', label: 'Descripción', type: 'textarea' },
        ],
      },
      {
        key: 'formato_archivo', label: 'Formatos de archivo', path: '/trazabilidad/formato_archivo',
        campos: [
          { key: 'nombre',      label: 'Nombre',      type: 'text', required: true },
        ],
      },
      {
        key: 'tipo_capa_sig', label: 'Tipos de capa SIG', path: '/trazabilidad/tipo_capa_sig',
        campos: [
          { key: 'nombre',      label: 'Nombre',      type: 'text',     required: true },
          { key: 'descripcion', label: 'Descripción', type: 'textarea' },
        ],
      },
      {
        key: 'fuente_captura', label: 'Fuentes de captura', path: '/trazabilidad/fuente_captura',
        campos: [
          { key: 'nombre',      label: 'Nombre',      type: 'text',     required: true },
          { key: 'descripcion', label: 'Descripción', type: 'textarea' },
        ],
      },
      {
        key: 'fuente_', label: 'Fuentes de información/captura', path: '/trazabilidad/fuente',
        campos: [
          { key: 'nombre',      label: 'Nombre',      type: 'text',     required: true },
          { key: 'descripcion', label: 'Descripción', type: 'textarea' },
          { key: 'tipo',        label: 'Tipo',        type: 'text' },
        ],
      },
      {
        key: 'origen_material', label: 'Orígenes de material', path: '/trazabilidad/origen_material',
        campos: [
          { key: 'nombre',      label: 'Nombre',      type: 'text',     required: true },
          { key: 'descripcion', label: 'Descripción', type: 'textarea' },
        ],
      }
    ],
  },
]

export default function CatalogosPage() {

  // Siempre llama los hooks al inicio
  const router = useRouter();
  const accesoPermitido = useRolGuard(['administrador', 'investigador']);
  useCatalogos();
  const qc       = useQueryClient();
  const addToast = useAppStore(s => s.addToast);

  const [ejeActivo,    setEjeActivo]    = useState(EJES[0]);
  const [catActivo,    setCatActivo]    = useState(EJES[0].catalogos[0]);
  const [busqueda,     setBusqueda]     = useState('');
  const [busquedaDB,   setBusquedaDB]   = useState('');
  const [pagina,       setPagina]       = useState(1);

  // Debounce: solo lanza la query 400ms después del último keystroke
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setBusquedaDB(busqueda);
      setPagina(1);
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [busqueda]);
  const PAG = 15;
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando,     setEditando]     = useState<Catalogo | null>(null);
  const [confirmItem,  setConfirmItem]  = useState<Catalogo | null>(null);
  const [detalleItem,  setDetalleItem]  = useState<Catalogo | null>(null);

  type PaginatedResponse = { count?: number; total?: number; results?: Catalogo[]; items?: Catalogo[] };

  const { data: respuesta, isLoading } = useQuery<PaginatedResponse | Catalogo[]>({
    queryKey: ['catalogo', catActivo.key, pagina, busquedaDB],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('limit',  String(PAG));
      params.set('offset', String((pagina - 1) * PAG));
      if (busquedaDB) params.set('search', busquedaDB);
      return GET(`${catActivo.path}?${params.toString()}`);
    },
    placeholderData: (prev) => prev,
  });

  const data: Catalogo[] = Array.isArray(respuesta)
    ? respuesta
    : (respuesta as PaginatedResponse)?.results ?? (respuesta as PaginatedResponse)?.items ?? []

  const totalItems: number = Array.isArray(respuesta)
    ? respuesta.length
    : (respuesta as PaginatedResponse)?.count ?? (respuesta as PaginatedResponse)?.total ?? 0

  const eliminar = useMutation({
    mutationFn: (id: number) => DEL(`${catActivo.path}/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['catalogo', catActivo.key] })
      addToast('Registro eliminado', 'ok')
    },
    onError: (e: Error) => addToast(e.message, 'err'),
  })

  // Si no hay usuario, redirige a inicio (evita pantalla de permisos infinita tras logout)
  const usuario = useAppStore(s => s.usuario);
  if (!usuario) {
    if (typeof window !== 'undefined') {
      router.replace('/login')
    }
    return null
  }
  if (!accesoPermitido) return <AccessGuardScreen message="Verificando permisos..." />

  const totalPaginas = Math.ceil(totalItems / PAG) || 1
  const paginados = data

  // Columnas dinámicas según el catálogo
  const CAMPOS_OCULTOS = ['id', 'nombre', 'created_at', 'updated_at', 'creado_en', 'actualizado_en', 'fecha_creacion', 'fecha_actualizacion','codigo']

  const columnas: Columna<Catalogo>[] = [
    { key: 'id', header: 'ID', nowrap: true, hideOnMobile: true, hideOnTablet: true },
    { key: 'nombre', header: 'Nombre' },
    ...(data[0]
      ? Object.keys(data[0])
          .filter(k => !CAMPOS_OCULTOS.includes(k))
          .slice(0, 3)
          .map(k => {
            if (k === 'es_nativo' || k === 'es_nativa' || k === 'es_tradicional' || k === 'indigena' || k === 'relevante_maiz' || k === 'activo' || k === 'es_informacion' || k === 'es_captura') {
              const HEADERS: Record<string, string> = { es_nativo: 'Nativo', es_nativa: 'Nativa', es_tradicional: 'Tradicional', indigena: 'Indígena' }
              return {
                key: k,
                header: HEADERS[k] ?? k,
                nowrap: true,
                hideOnMobile: true,
                hideOnTablet: true,
                render: (row: Catalogo) => {
                  const val = (row as Record<string, unknown>)[k]
                  return val
                    ? <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'2px 10px', borderRadius:999, fontSize:12, fontWeight:600, background:'var(--verde-claro,#e6f4ea)', color:'var(--verde,#2e7d32)' }}>✔ Sí</span>
                    : <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'2px 10px', borderRadius:999, fontSize:12, fontWeight:600, background:'#fdecea', color:'#c62828' }}>✘ No</span>
                },
              }
            }
            if (k === 'nivel_riesgo') {
              const RIESGO: Record<number, { bg: string; color: string; label: string }> = {
                1: { bg: '#e8f5e9', color: '#2e7d32', label: '1 · Mínimo' },
                2: { bg: '#f9fbe7', color: '#558b2f', label: '2 · Bajo' },
                3: { bg: '#fff8e1', color: '#f57f17', label: '3 · Moderado' },
                4: { bg: '#fff3e0', color: '#e65100', label: '4 · Alto' },
                5: { bg: '#fdecea', color: '#b71c1c', label: '5 · Crítico' },
              }
              return {
                key: k,
                header: 'Nivel de riesgo',
                nowrap: true,
                hideOnMobile: true,
                hideOnTablet: true,
                render: (row: Catalogo) => {
                  const val = Number((row as Record<string, unknown>)[k])
                  const cfg = RIESGO[val]
                  if (!cfg) return <span style={{ color: '#999' }}>—</span>
                  return (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '3px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                      background: cfg.bg, color: cfg.color,
                      border: `1px solid ${cfg.color}33`,
                    }}>
                      {cfg.label}
                    </span>
                  )
                },
              }
            }
            return { key: k, header: k.replace(/_/g, ' '), hideOnMobile: true, hideOnTablet: true }
          })
      : []),
  ]

  return (
    <AdminShell>
    <div className={styles.page}>
      <ModuleHero
        eyebrow="Administración · Catálogos maestros"
        title={<>Gestión de <em>Catálogos</em> 📋</>}
        description="Centraliza catálogos de germoplasma, territorio, fenotipo y dimensiones socioculturales para mantener la plataforma consistente." 
        stats={[
          { label: 'resultados', value: totalItems },
          { label: 'eje activo', value: ejeActivo.eje },
          { label: 'catálogos', value: ejeActivo.catalogos.length },
        ]}
      />
      <header className={styles.header}>
        <h1 className={styles.titulo}>Catálogos</h1>
        <Button variante="primario" onClick={() => { setEditando(null); setModalAbierto(true) }}>
          + Nuevo
        </Button>
      </header>

      {/* Selector de eje */}
      <div className={styles.ejes}>
        {EJES.map(e => (
          <button
            key={e.eje}
            className={`${styles.ejeBtn} ${ejeActivo.eje === e.eje ? styles.ejeActivo : ''}`}
            onClick={() => {
              setEjeActivo(e)
              setCatActivo(e.catalogos[0])
              setBusqueda('')
              setBusquedaDB('')
              setPagina(1)
            }}
          >
            <span>{e.emoji}</span> {e.eje}
          </button>
        ))}
      </div>

      {/* Tabs de catálogos del eje activo */}
      <div className={styles.tabs}>
        {ejeActivo.catalogos.map(c => (
          <button
            key={c.key}
            className={`${styles.tab} ${catActivo.key === c.key ? styles.tabActive : ''}`}
            onClick={() => { setCatActivo(c); setBusqueda(''); setBusquedaDB(''); setPagina(1); qc.removeQueries({ queryKey: ['catalogo', c.key] }) }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Buscador */}
      <SearchInput
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        placeholder={`Buscar en ${catActivo.label}…`}
        style={{ marginBottom: 16 }}
      />

      {/* Tabla */}
      <Tabla
        datos={paginados}
        columnas={columnas}
        cargando={isLoading}
        vacio="Sin registros en este catálogo"
        onRowClick={item => setDetalleItem(item)}
        acciones={item => (
          <div className={styles.acciones}>
            <Button variante="ghost" tamaño="sm" onClick={() => { setEditando(item); setModalAbierto(true) }}>✏️</Button>
            <Button variante="peligro" tamaño="sm" onClick={() => setConfirmItem(item)}>🗑</Button>
          </div>
        )}
      />

      <Paginacion
        paginaActual={pagina}
        totalPaginas={totalPaginas}
        onCambiar={setPagina}
        totalItems={totalItems}
        itemsPorPagina={PAG}
      />

      {/* Modal detalle (solo lectura) */}
      <Modal
        open={!!detalleItem}
        titulo={`${catActivo.label} — #${detalleItem?.id}`}
        onClose={() => setDetalleItem(null)}
        footer={
          <>
            <Button variante="secundario" onClick={() => setDetalleItem(null)}>Cerrar</Button>
            <Button variante="primario" onClick={() => { setEditando(detalleItem); setDetalleItem(null); setModalAbierto(true) }}>✏️ Editar</Button>
          </>
        }
      >
        <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px', margin: 0 }}>
          {detalleItem && Object.entries(detalleItem).filter(([k]) => !['id','created_at','updated_at','creado_en','actualizado_en','fecha_creacion','fecha_actualizacion'].includes(k)).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <dt style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--tierra)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {k.replace(/_/g, ' ')}
              </dt>
              <dd style={{ margin: 0, fontSize: 15, fontWeight: 500, color: 'var(--texto)' }}>
                {v === null || v === undefined || v === '' ? <span style={{ color: 'var(--borde)', fontStyle: 'italic' }}>—</span> : String(v)}
              </dd>
            </div>
          ))}
        </dl>
      </Modal>

      {/* Modal CRUD */}
      {modalAbierto && (
        <ModalCatalogo
          item={editando}
          catPath={catActivo.path}
          catLabel={catActivo.label}
          campos={catActivo.campos}
          onClose={() => setModalAbierto(false)}
          onSaved={() => {
            setModalAbierto(false)
            qc.invalidateQueries({ queryKey: ['catalogo', catActivo.key] })
            addToast(editando ? 'Registro actualizado' : 'Registro creado', 'ok')
          }}
        />
      )}

      {/* Modal confirmar eliminar */}
      <Modal
        open={!!confirmItem}
        titulo={`¿Eliminar "${confirmItem?.nombre}"?`}
        onClose={() => setConfirmItem(null)}
        footer={
          <>
            <Button variante="secundario" onClick={() => setConfirmItem(null)}>Cancelar</Button>
            <Button variante="peligro" onClick={() => { eliminar.mutate(confirmItem!.id as number); setConfirmItem(null) }}>Eliminar</Button>
          </>
        }
      >
        <p style={{ margin: 0 }}>Esta acción no se puede deshacer.</p>
      </Modal>
    </div>
    </AdminShell>
  )
}

// ── Modal genérico para catálogos ─────────────────────────────────────────────
function toArr(d: unknown): { id: number; nombre: string }[] {
  if (Array.isArray(d)) return d as { id: number; nombre: string }[]
  const obj = d as Record<string, unknown>
  return ((obj?.items ?? obj?.results ?? []) as { id: number; nombre: string }[])
}

function ModalCatalogo({
  item, catPath, catLabel, campos, onClose, onSaved,
}: {
  item: Catalogo | null
  catPath: string
  catLabel: string
  campos: Campo[]
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    campos.forEach(c => {
      const raw = item ? (item as Record<string, unknown>)[c.key] : undefined
      init[c.key] = c.type === 'checkbox'
        ? String(raw === true || raw === 'true')
        : raw !== undefined && raw !== null ? String(raw) : ''
    })
    return init
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  // Extrae los queryPath únicos de todos los campos select
  const selectPaths = [...new Set(
    campos.filter((c): c is CampoSelect => c.type === 'select').map(c => c.queryPath)
  )]

  // Carga dinámicamente las opciones para cada FK
  const fkResults = useQueries({
    queries: selectPaths.map(path => ({
      queryKey: ['fk-opts', path],
      queryFn: () => GET(path),
      select: toArr,
      staleTime: Infinity,
    }))
  })

  const optionsMap: Record<string, { id: number; nombre: string }[]> = {}
  selectPaths.forEach((path, i) => {
    optionsMap[path] = fkResults[i].data ?? []
  })

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const payload: Record<string, unknown> = {}
      campos.forEach(c => {
        const val = form[c.key]
        if (c.type === 'checkbox') {
          payload[c.key] = val === 'true'
        } else if (c.type === 'number') {
          payload[c.key] = val !== '' ? Number(val) : null
        } else if (c.key.endsWith('_id')) {
          payload[c.key] = val ? Number(val) : null
        } else {
          payload[c.key] = val
        }
      })
      if (item?.id) await PUT(`${catPath}/${item.id}`, payload)
      else           await POST(catPath, payload)
      onSaved()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open
      titulo={item ? `Editar ${catLabel}` : `Nuevo — ${catLabel}`}
      onClose={onClose}
      footer={
        <>
          <Button variante="secundario" type="button" onClick={onClose}>Cancelar</Button>
          <Button variante="primario" type="submit" form="form-catalogo" cargando={loading}>
            {item ? 'Guardar' : 'Crear'}
          </Button>
        </>
      }
    >
      <form id="form-catalogo" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {campos.map(c => {
          if (c.type === 'select') {
            const opts = (optionsMap[(c as CampoSelect).queryPath] ?? []).map(o => ({
              value: String(o.id),
              label: o.nombre,
            }))
            return (
              <SelectField
                key={c.key}
                name={c.key}
                label={c.label}
                value={form[c.key]}
                onChange={e => set(c.key, e.target.value)}
                options={[{ value: '', label: `Selecciona ${c.label.toLowerCase()}` }, ...opts]}
                required={c.required}
              />
            )
          }
          if (c.type === 'checkbox') {
            return (
              <label key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none', fontSize: 14 }}>
                <input
                  type="checkbox"
                  checked={form[c.key] === 'true'}
                  onChange={e => set(c.key, String(e.target.checked))}
                  style={{ width: 16, height: 16, accentColor: 'var(--verde)' }}
                />
                {c.label}
              </label>
            )
          }
          if (c.type === 'textarea') {
            return (
              <Field
                key={c.key}
                label={c.label}
                name={c.key}
                as="textarea"
                rows={3}
                required={(c as CampoTexto).required}
                value={form[c.key]}
                onChange={e => set(c.key, e.target.value)}
              />
            )
          }
          if (c.type === 'number') {
            return (
              <Field
                key={c.key}
                label={c.label}
                name={c.key}
                type="number"
                required={(c as CampoTexto).required}
                value={form[c.key]}
                onChange={e => set(c.key, e.target.value)}
              />
            )
          }
          return (
            <Field
              key={c.key}
              label={c.label}
              name={c.key}
              required={(c as CampoTexto).required}
              value={form[c.key]}
              onChange={e => set(c.key, e.target.value)}
            />
          )
        })}
        {error && <p style={{ color: 'var(--rojo)', fontSize: '13px', margin: 0 }}>{error}</p>}
      </form>
    </Modal>
  )
}
