"use client";
import '@/styles/globals.css';
import '@/styles/landing-full.css';

import Head from 'next/head';

import Navbar from '@/components/page/Navbar';
import Hero from '@/components/page/Hero';
import Numeros from '@/components/page/Numeros';
import Modulos from '@/components/page/Modulos';
import Mapa from '@/components/page/Mapa';
import Avances from '@/components/page/Avances';
import Equipo from '@/components/page/Equipo';
import CTA from '@/components/page/CTA';
import Footer from '@/components/page/Footer';

import { useRevealOnScroll } from '@/hooks/useRevealOnScroll';

export default function Home() {

  useRevealOnScroll();

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;0,9..144,900;1,9..144,700&family=Nunito:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="alternate icon" type="image/png" href="/favicon.png" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      </Head>
      <Navbar />
      <main style={{ background: 'var(--crema)' }}>
        <Hero />
        <Numeros />
        <Modulos />
        <div className="sep-full"></div>
        <Mapa />
        <Avances />
        <div className="sep-full"></div>
        <Equipo />
        <CTA />
        <Footer />
      </main>
    </>
  );
}
