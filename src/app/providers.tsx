"use client";

import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { useAuth } from '@/hooks/useAuth';
import ToastContainer from '@/components/ui/ToastContainer';

// Overlay global para red lenta
function SlowNetworkOverlay() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined' && 'connection' in navigator) {
      const conn = navigator.connection;
      interface NetworkInformation {
        effectiveType?: string;
        downlink?: number;
      }
      const netInfo = conn as NetworkInformation;
      if (
        netInfo &&
        (
          netInfo.effectiveType === 'slow-2g' ||
          netInfo.effectiveType === '2g' ||
          netInfo.effectiveType === 'gprs' ||
          (typeof netInfo.downlink === 'number' && netInfo.downlink < 0.1)
        )
      ) {
        setShow(true);
      }
    }
  }, []);
  if (!show) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(255,255,255,0.97)',
      zIndex: 2147483647,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 20,
      color: '#C8820A',
      fontWeight: 800,
      pointerEvents: 'none',
    }}>
      <div style={{ fontSize: 32, marginBottom: 18 }}>🌽</div>
      Cargando…<br />
      <span style={{ fontWeight: 400, fontSize: 15, color: '#6B7280' }}>
        Detectamos una conexión muy lenta.<br />La experiencia puede ser limitada, por favor espera…
      </span>
    </div>
  );
}

function SessionInit() {
  const { inicializarSesion } = useAuth();
  useEffect(() => { inicializarSesion(); }, []);
  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 min por defecto
        retry: 1,
      },
    },
  }));

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <SessionInit />
        <SlowNetworkOverlay />
        {children}
        <ToastContainer />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
