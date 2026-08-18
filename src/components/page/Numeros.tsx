export default function Numeros() {
    return (
        <div className="numeros-wrap">
            <div className="numeros-inner reveal">
                <div className="sec-kicker" style={{ color: 'var(--maiz-cl)' }}>
                    <span style={{ display: 'block', width: 24, height: 1, background: 'var(--maiz-cl)' }}></span>
                    El proyecto en cifras
                </div>
                <div className="sec-titulo" style={{ color: '#fff', marginBottom: 0 }}>
                    Un proyecto de <em style={{ color: 'var(--maiz-cl)' }}>escala regional</em>
                </div>
                <div className="numeros-grid">
                    <div className="num-card"><div className="num-n">15+</div><div className="num-l">Localidades visitadas en la Huasteca</div></div>
                    <div className="num-card"><div className="num-n">11</div><div className="num-l">Investigadores e investigadoras</div></div>
                    <div className="num-card"><div className="num-n">30+</div><div className="num-l">Muestras nutrimentales</div></div>
                    <div className="num-card"><div className="num-n">5</div><div className="num-l">Talleres comunitarios</div></div>
                    <div className="num-card"><div className="num-n">100</div><div className="num-l">Jóvenes capacitados</div></div>
                </div>
            </div>
        </div>
    );
}