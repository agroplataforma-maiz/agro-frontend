export default function Equipo() {

    return (
        <div className="equipo-wrap" id="equipo">
            <div className="equipo-inner">
                <div className="sec-kicker reveal">Grupo de investigación</div>
                <h2 className="sec-titulo reveal">El equipo <em>detrás</em> del proyecto</h2>
                <p className="sec-desc reveal">Once investigadoras e investigadores del Instituto Tecnológico de Ciudad Valles con especialidades en computación, agroecología, nutrición, fitopatología y ciencias ambientales.</p>
                <div className="equipo-grid">
                    <div className="eq-card reveal" style={{ animationDelay: '.05s', borderColor: 'rgba(74,140,100,.3)', background: 'var(--verde-pal)' }}><div className="eq-inicial" style={{ background: 'var(--verde-cl)' }}>AB</div><div className="eq-nombre">Alfredo Barrón Rodríguez</div><div className="eq-esp" style={{ color: 'var(--verde-cl)' }}>Responsable técnico</div></div>
                    <div className="eq-card reveal" style={{ animationDelay: '.1s' }}><div className="eq-inicial">SR</div><div className="eq-nombre">Sofía del Rosario Romero Ramos</div><div className="eq-esp">Industrias alimentarias</div></div>
                    <div className="eq-card reveal" style={{ animationDelay: '.15s' }}><div className="eq-inicial">HL</div><div className="eq-nombre">Hugo René Larraga Altamirano</div><div className="eq-esp">Sistemas computacionales</div></div>
                    <div className="eq-card reveal" style={{ animationDelay: '.2s' }}><div className="eq-inicial">DP</div><div className="eq-nombre">Daniel Perales Rosas</div><div className="eq-esp">Parasitología agrícola</div><span className="eq-sni">SNI Nivel I</span></div>
                    <div className="eq-card reveal" style={{ animationDelay: '.25s' }}><div className="eq-inicial">DH</div><div className="eq-nombre">Dalia Rosario Hernández López</div><div className="eq-esp">Sistemas computacionales</div></div>
                    <div className="eq-card reveal" style={{ animationDelay: '.3s' }}><div className="eq-inicial">OE</div><div className="eq-nombre">Omar Espinosa Guerra</div><div className="eq-esp">Electrónica y software</div></div>
                    <div className="eq-card reveal" style={{ animationDelay: '.35s' }}><div className="eq-inicial">RJ</div><div className="eq-nombre">Rosa María Jiménez Maldonado</div><div className="eq-esp">Emprendimiento comunitario</div></div>
                    <div className="eq-card reveal" style={{ animationDelay: '.4s' }}><div className="eq-inicial">CG</div><div className="eq-nombre">Carlos Cecilio Góngora Canul</div><div className="eq-esp">Fitopatología</div><span className="eq-sni">SNI Nivel I</span></div>
                    <div className="eq-card reveal" style={{ animationDelay: '.45s' }}><div className="eq-inicial">HM</div><div className="eq-nombre">Habacuc Lorenzo Márquez</div><div className="eq-esp">SIG y análisis estadístico</div></div>
                    <div className="eq-card reveal" style={{ animationDelay: '.5s' }}><div className="eq-inicial">DA</div><div className="eq-nombre">Dulce Carolina Acosta Pintor</div><div className="eq-esp">Desarrollo sustentable</div></div>
                    <div className="eq-card reveal" style={{ animationDelay: '.55s' }}><div className="eq-inicial">AP</div><div className="eq-nombre">Ana María Piedad Rubio</div><div className="eq-esp">Sistemas computacionales</div></div>
                    <div className="eq-card reveal" style={{ animationDelay: '.6s' }}><div className="eq-inicial">CW</div><div className="eq-nombre">Cynthia Wong Arguelles</div><div className="eq-esp">Ciencias ambientales</div><span className="eq-sni">SNI Nivel I</span></div>
                </div>
            </div>
        </div>
    );

}