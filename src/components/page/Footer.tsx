export default function Footer() {

  return (
    <footer>
      <div>
        <div className="foot-logo">🌽 Agroplataforma · Maíz Nativo</div>
        <div className="foot-sub">
          Proyecto PEE-2025-G-369 · Secihti 2025<br />
          Instituto Tecnológico de Ciudad Valles · TecNM<br />
          San Luis Potosí · México
        </div>
      </div>
      <div className="foot-logos">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/LOGOTECNM.png" alt="TecNM" />
        <div className="foot-logos-sep" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/secihti.png" alt="Secihti" />
        <div className="foot-logos-sep" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/logotec.png" alt="IT Ciudad Valles" />
      </div>
      <div className="foot-der">
        <div>Eje 2 · Mejoramiento de Cultivos de Maíz y Frijol</div>
        <div>Etapa 1 en curso · 2025–2026</div>
        <div style={{ marginTop: 6, opacity: .5 }}>alfredo.barron@tecvalles.mx · 481 391 8309</div>
      </div>
    </footer>
  );

}