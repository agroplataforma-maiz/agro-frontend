export default function Mapa() {

    return (
        <div className="mapa-wrap" id="mapa">
            <div className="mapa-inner">
                <div className="mapa-txt reveal">
                    <div className="sec-kicker">Cobertura geográfica</div>
                    <h2 className="sec-titulo">Huasteca <em>Potosina</em></h2>
                    <p className="sec-desc">El proyecto concentra su trabajo en la región Huasteca de San Luis Potosí, una de las zonas con mayor diversidad de maíces nativos en México y con alta presencia de comunidades indígenas custodias de estas semillas.</p>
                    <div className="comunidades-chips" style={{ marginTop: 24 }}>
                        <span className="chip activo">Ciudad Valles</span>
                        <span className="chip activo">Ébano</span>
                        <span className="chip activo">Tamuín</span>
                        <span className="chip activo">Tancanhuitz</span>
                        <span className="chip activo">Aquismón</span>
                        <span className="chip">Xilitla</span>
                        <span className="chip">Huehuetlán</span>
                        <span className="chip">Tanlajás</span>
                        <span className="chip">San Antonio</span>
                        <span className="chip">Coxcatlán</span>
                        <span className="chip">+5 más</span>
                    </div>
                </div>
                <div className="mapa-svg-wrap reveal">
                    <svg viewBox="0 0 340 300" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', display: 'block' }}>
                        <path d="M40 60 Q80 30 140 40 Q200 50 260 80 Q300 100 310 160 Q320 220 280 260 Q240 290 180 285 Q120 280 80 250 Q40 220 30 170 Q20 120 40 60Z" fill="rgba(42,92,63,.25)" stroke="rgba(42,92,63,.4)" strokeWidth="1.5" />
                        <path d="M60 100 Q120 130 180 120 Q230 110 280 150" stroke="rgba(74,140,100,.35)" strokeWidth="2" fill="none" strokeDasharray="4 3" />
                        <path d="M100 200 Q150 180 200 190 Q240 200 270 220" stroke="rgba(74,140,100,.25)" strokeWidth="1.5" fill="none" strokeDasharray="3 3" />
                        <g><circle cx="160" cy="150" r="8" fill="rgba(200,130,10,.3)" stroke="var(--maiz-cl)" strokeWidth="1.5" /><circle cx="160" cy="150" r="14" fill="rgba(200,130,10,.08)" stroke="var(--maiz-cl)" strokeWidth=".5" /><text x="160" y="154" textAnchor="middle" fontFamily="DM Mono" fontSize="7" fill="var(--maiz-cl)">CV</text></g>
                        <g><circle cx="220" cy="130" r="6" fill="rgba(200,130,10,.2)" stroke="rgba(240,180,41,.6)" strokeWidth="1" /><text x="220" y="133" textAnchor="middle" fontFamily="DM Mono" fontSize="6" fill="rgba(240,180,41,.7)">EB</text></g>
                        <g><circle cx="100" cy="170" r="6" fill="rgba(200,130,10,.2)" stroke="rgba(240,180,41,.6)" strokeWidth="1" /><text x="100" y="173" textAnchor="middle" fontFamily="DM Mono" fontSize="6" fill="rgba(240,180,41,.7)">AQ</text></g>
                        <g><circle cx="140" cy="200" r="5" fill="rgba(200,130,10,.15)" stroke="rgba(240,180,41,.4)" strokeWidth="1" /><text x="140" y="203" textAnchor="middle" fontFamily="DM Mono" fontSize="6" fill="rgba(240,180,41,.5)">TC</text></g>
                        <g><circle cx="200" cy="190" r="5" fill="rgba(200,130,10,.15)" stroke="rgba(240,180,41,.4)" strokeWidth="1" /><text x="200" y="193" textAnchor="middle" fontFamily="DM Mono" fontSize="6" fill="rgba(240,180,41,.5)">TM</text></g>
                        <g><circle cx="80" cy="130" r="4" fill="rgba(200,130,10,.1)" stroke="rgba(240,180,41,.3)" strokeWidth=".8" /></g>
                        <g><circle cx="240" cy="200" r="4" fill="rgba(200,130,10,.1)" stroke="rgba(240,180,41,.3)" strokeWidth=".8" /></g>
                        <circle cx="20" cy="275" r="5" fill="rgba(200,130,10,.3)" stroke="var(--maiz-cl)" strokeWidth="1" />
                        <text x="30" y="279" fontFamily="DM Mono" fontSize="7" fill="rgba(255,255,255,.4)">En campo</text>
                        <circle cx="100" cy="275" r="4" fill="rgba(200,130,10,.1)" stroke="rgba(240,180,41,.3)" strokeWidth=".8" />
                        <text x="110" y="279" fontFamily="DM Mono" fontSize="7" fill="rgba(255,255,255,.4)">Programada</text>
                        <text x="10" y="20" fontFamily="DM Mono" fontSize="9" fill="rgba(255,255,255,.25)" letterSpacing="1">HUASTECA POTOSINA · SLP</text>
                    </svg>
                </div>
            </div>
        </div>
    );

}