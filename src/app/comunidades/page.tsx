// src/app/comunidades/page.tsx
'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { GET } from '@/lib/api';
import ModalComunidad from '@/components/comunidades/ModalComunidad';

import AdminShell from '@/components/dashboard/AdminShell';
import SidebarComunidades from '@/components/comunidades/SidebarComunidades';

import MapaHuasteca, { type PuntoMapaHuasteca } from '@/components/ui/MapaHuasteca';
import TablaComunidades from '@/components/comunidades/TablaComunidades';
import PerfilComunidad from '@/components/comunidades/PerfilComunidad';
import type { Comunidad, Municipio } from '@/types';

import '@/components/comunidades/hide-modals-mobile.css'

const COMUNIDADES_HUASTECA: PuntoMapaHuasteca[] = [
  { id: 1, comunidad: 'Ébano', municipio: 'Ébano', latitud: 22.265697, longitud: -98.625804 },
  { id: 2, comunidad: 'San José el Viejo', municipio: 'Tamasopo', latitud: 21.7018753, longitud: -99.228642 },
  { id: 3, comunidad: 'Nuevo Jomté', municipio: 'San Vicente Tancuayalab', latitud: 21.855922, longitud: -98.576321 },
  { id: 4, comunidad: 'Ponciano Arriaga', municipio: 'Ébano', latitud: 22.2386708, longitud: -98.5673783 },
  { id: 5, comunidad: 'Tanluche', municipio: 'Ciudad Valles', latitud: 22.143333, longitud: -99.115833 },
  { id: 6, comunidad: 'Ponciano Arriaga', municipio: 'Ébano', latitud: 22.2386708, longitud: -98.5673783 },
  { id: 7, comunidad: 'Ejido La Lima', municipio: 'Ciudad Valles', latitud: 21.927849, longitud: -99.100947 },
  { id: 8, comunidad: 'Ejido Palo de Arco', municipio: 'Aquismón', latitud: 21.925571, longitud: -99.191220 },
  { id: 9, comunidad: 'Ojo de Agua', municipio: 'Ciudad Valles', latitud: 21.991583, longitud: -99.123659 },
  { id: 10, comunidad: 'Ejido La Lima', municipio: 'Ciudad Valles', latitud: 21.9244445, longitud: -99.099959 },
  { id: 11, comunidad: 'Zopope', municipio: 'Aquismón', latitud: 21.57856, longitud: -99.0818169 },
  { id: 12, comunidad: 'Puerto Rancho Nuevo', municipio: 'Tamasopo', latitud: 21.783778, longitud: -99.490611 },
  { id: 13, comunidad: 'Puerto Rancho Nuevo', municipio: 'Tamasopo', latitud: 21.7829745, longitud: -99.4894382 },
  { id: 14, comunidad: 'Puerto Rancho Nuevo', municipio: 'Tamasopo', latitud: 21.7834602, longitud: -99.4901064 },
  { id: 15, comunidad: 'Agua Puerca', municipio: 'Tamasopo', latitud: 21.762768, longitud: -99.481854 },
  { id: 16, comunidad: 'Cuéchod', municipio: 'San Antonio', latitud: 21.6240087, longitud: -98.9107526 },
  { id: 17, comunidad: 'El Chuche', municipio: 'Tanlajás', latitud: 21.6836592, longitud: -98.9109448 },
  { id: 18, comunidad: 'Aldzulup', municipio: 'Tancanhuitz', latitud: 21.6169203, longitud: -98.927553 },
  { id: 19, comunidad: 'El Chuche', municipio: 'Tanlajás', latitud: 21.6864942, longitud: -98.9120133 },
  { id: 20, comunidad: 'Río Verdito', municipio: 'Ciudad Valles', latitud: 22.214776, longitud: -99.260781 },
  { id: 21, comunidad: 'Ejido Santa Rosa', municipio: 'Tanlajás', latitud: 21.73898688, longitud: -98.8701427 },
  { id: 22, comunidad: 'Coromohom', municipio: 'Tanlajás', latitud: 21.6770912, longitud: -98.8884554 },
];

// Hook para detectar si es móvil
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 700);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

export default function ComunidadesPage() {

  const isMobile = useIsMobile();

  // Usuario y protección de ruta
  const usuario = useAppStore(s => s.usuario);
  const rol = usuario?.rol;
  const [mounted, setMounted] = useState(false);
  const setMunicipios = useAppStore(s => s.setMunicipios);
  const municipiosStore = useAppStore(s => s.municipios);
  const router = useRouter();

  // Estados y lógica para filtros y selección
  const [busqueda, setBusqueda] = useState('');
  const [municipioFiltro, setMunicipioFiltro] = useState('todos');
  // Modal de nueva comunidad o edición
  const [modalNuevaOpen, setModalNuevaOpen] = useState(false);
  const [comunidadEdit, setComunidadEdit] = useState<Comunidad | null>(null);
  const [comunidadPerfilId, setComunidadPerfilId] = useState<number | null>(null);
  const [comunidades, setComunidades] = useState(COMUNIDADES_HUASTECA.map(c => ({
    id: Number(c.id),
    nombre: c.comunidad,
    municipio_nombre: c.municipio,
    localidad_nombre: '',
    lengua_indigena: '',
    poblacion: undefined,
    num_productores: undefined,
    latitud: c.latitud,
    longitud: c.longitud,
  })));
  const [puntoActivoId, setPuntoActivoId] = useState<number | string | null>(null);

    // Cierra el panel de perfil si se entra a móvil
  useEffect(() => {
    if (isMobile && comunidadPerfilId) {
      setComunidadPerfilId(null);
    }
  }, [isMobile, comunidadPerfilId]);


  useEffect(() => {
    setMounted(true);
    // Guardar la última ruta visitada
    if (typeof window !== 'undefined') {
      localStorage.setItem('agro_last_path', window.location.pathname);
    }
    // Esperar 80ms para permitir la hidratación del usuario desde localStorage
    if (!usuario) {
      const timeout = setTimeout(() => {
        if (!useAppStore.getState().usuario) {
          router.replace('/');
        }
      }, 80);
      return () => clearTimeout(timeout);
    }
    // Cargar municipios si no hay
    if (municipiosStore.length === 0) {
      GET('/catalogo/municipio')
        .then((data: unknown) => {
          let lista: unknown[] = [];
          if (Array.isArray(data)) {
            lista = data;
          } else if (typeof data === 'object' && data !== null) {
            const d = data as { items?: unknown[]; results?: unknown[] };
            lista = d.items ?? d.results ?? [];
          }
          function isMunicipio(m: unknown): m is Municipio {
            return (
              typeof m === 'object' &&
              m !== null &&
              'id' in m &&
              typeof (m as { id?: unknown }).id === 'number' &&
              'nombre' in m &&
              typeof (m as { nombre?: unknown }).nombre === 'string'
            );
          }
          const municipiosValidos = (lista as unknown[]).filter(isMunicipio);
          setMunicipios(municipiosValidos);
        })
        .catch(() => {});
    }
  }, [usuario, router, municipiosStore.length, setMunicipios]);

  // Si no hay usuario, no renderizar nada (ni pantalla de cargando)
  if (!usuario) return null;
  if (!mounted) return null;

  // Filtrar comunidades según búsqueda y municipio
  const ubicacionesFiltradas = COMUNIDADES_HUASTECA.filter(p => {
    const coincideBusqueda =
      p.comunidad.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.municipio.toLowerCase().includes(busqueda.toLowerCase());
    const coincideMunicipio = municipioFiltro === 'todos' || p.municipio === municipioFiltro;
    return coincideBusqueda && coincideMunicipio;
  });

  // Municipios únicos para los filtros
  const municipiosMapa = Array.from(new Set(COMUNIDADES_HUASTECA.map(p => p.municipio)));

  // Adaptar datos para la tabla (admin)
  const comunidadesTabla = comunidades;

  const mostrarSidebarComunidades = ['investigador', 'tecnico_campo', 'administrador'].includes(rol ?? '')

  // Datos de usuario para overlays
  return (
    <AdminShell contentPadding="0" defaultSidebarCollapsed={true}>
      {/* Vista para administrador: tabla */}
      {rol === 'administrador' ? (
        <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Fraunces,Georgia,serif', fontSize: 22, fontWeight: 900, color: '#C8820A', marginBottom: 18 }}>Comunidades registradas</h2>
          {comunidadPerfilId ? (
            <>
              {!isMobile && (
                <PerfilComunidad
                  id={comunidadPerfilId}
                  onVolver={() => setComunidadPerfilId(null)}
                  onEdit={id => {
                    setComunidadEdit(comunidades.find(c => c.id === id) ?? null);
                    setModalNuevaOpen(true);
                  }}
                />
              )}
              {modalNuevaOpen && !isMobile && (
                <ModalComunidad
                  comunidad={comunidadEdit}
                  onClose={() => {
                    setModalNuevaOpen(false);
                    setComunidadEdit(null);
                  }}
                  onSaved={() => {
                    setModalNuevaOpen(false);
                    setComunidadEdit(null);
                    // Aquí podrías recargar la lista desde el backend si fuera necesario
                  }}
                />
              )}
            </>
          ) : (
            <TablaComunidades
              comunidades={comunidadesTabla}
              onEdit={comunidad => {
                setComunidadPerfilId(comunidad.id);
              }}
              onDelete={id => {
                setComunidades(prev => prev.filter(c => c.id !== id));
              }}
            />
          )}
        </div>
      ) : (
        // Vista para otros roles: mapa y sidebar
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: isMobile ? 'calc(100dvh - var(--topbar-h,64px))' : 'calc(100vh - 64px)',
            minHeight: 0,
            margin: 0,
            padding: 0,
            background: '#f8fafc',
            overflow: 'hidden',
            boxSizing: 'border-box',
          }}
        >
          {/* Mapa ocupa todo el fondo */}
          <div
            style={{
              width: '100%',
              height: '100%',
              minHeight: 320,
              margin: 0,
              padding: 0,
              position: 'relative',
              zIndex: 1,
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <MapaHuasteca
              puntos={ubicacionesFiltradas}
              height={undefined}
              selectedId={puntoActivoId}
              onSelectPoint={setPuntoActivoId}
              isMobile={isMobile}
            />
          </div>
          {/* Panel lateral flotante (sidebar de comunidades) */}
          { mostrarSidebarComunidades  && (
            <SidebarComunidades
              rol={rol}
              busqueda={busqueda}
              setBusqueda={setBusqueda}
              municipioFiltro={municipioFiltro}
              setMunicipioFiltro={setMunicipioFiltro}
              municipiosMapa={municipiosMapa}
              ubicacionesFiltradas={ubicacionesFiltradas}
              COMUNIDADES_HUASTECA={COMUNIDADES_HUASTECA}
              puntoActivoId={puntoActivoId}
              setPuntoActivoId={setPuntoActivoId}
              setModalNuevaOpen={setModalNuevaOpen}
            />
          )}
        </div>
      )}
      {/* Modal para nueva comunidad (no admin) */}
      {modalNuevaOpen && rol !== 'administrador' && !isMobile && (
        <ModalComunidad
          comunidad={null}
          onClose={() => setModalNuevaOpen(false)}
          onSaved={() => {
            setModalNuevaOpen(false);
            // Aquí podrías recargar la lista si fuera necesario
          }}
        />
      )}
    </AdminShell>
  );
}
