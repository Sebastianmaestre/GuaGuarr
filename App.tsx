import { useEffect, useState } from 'react';
import { TrackerMap } from './TrackerMap';
import { useTracking } from './useTracking';
import type { Source, Status } from './types';

const PILL: Record<Status, { text: string; dot: string }> = {
  off: { text: 'Sin conectar', dot: '' },
  connecting: { text: 'Conectando…', dot: 'waiting' },
  waiting: { text: 'Conectado', dot: 'waiting' },
  on: { text: 'EN VIVO', dot: 'on' },
};

function useNow(ms: number) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

function ago(last: number | null, now: number) {
  if (!last) return '—';
  const s = Math.max(0, Math.round((now - last) / 1000));
  if (s < 3) return 'justo ahora';
  if (s < 60) return `hace ${s}s`;
  return `hace ${Math.round(s / 60)} min`;
}

export default function App() {
  const [source, setSource] = useState<Source>(null);
  const [url, setUrl] = useState('http://localhost:3000');
  const [imei, setImei] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [follow, setFollow] = useState(true);
  const now = useNow(1000);

  const { status, position, trail, lastSignalAt, error } = useTracking(source);
  const pos: [number, number] | null = position ? [position.latitude, position.longitude] : null;

  const connect = () => {
    if (!url.trim() || !imei.trim()) {
      setFormError('Completá la URL del servidor y el IMEI.');
      return;
    }
    setFormError(null);
    setFollow(true);
    setSource({ kind: 'live', url: url.trim(), imei: imei.trim() });
  };

  const startDemo = () => {
    setFormError(null);
    setFollow(true);
    setSource({ kind: 'demo' });
  };

  const showPanel = !source || !!error;
  const unitId = source?.kind === 'live' ? source.imei : 'DEMO';
  const pill = PILL[status];

  return (
    <>
      <TrackerMap pos={pos} trail={trail} follow={follow} onUserMove={() => setFollow(false)} />

      <header>
        <div className="brand">
          <div className="brand-mark">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M4 17h16M6 17V9a2 2 0 012-2h8a2 2 0 012 2v8M8 17v2M16 17v2M6 12h12" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="brand-name">GuaguaRD</span>
        </div>
        <button className="live-pill" onClick={() => source && setSource(null)} title={source ? 'Desconectar' : undefined}>
          <span className={`live-dot ${pill.dot}`} />
          <span>{pill.text}</span>
        </button>
      </header>

      {status === 'waiting' && (
        <div className="waiting-banner">
          <span className="spin" />
          Conectado — esperando la primera posición del dispositivo…
        </div>
      )}

      {showPanel && (
        <div className="connect-panel">
          <h2>Conectar con el servidor real</h2>
          <p>Apuntá esto al backend de NestJS ya corriendo (local o desplegado). El mapa se llena con la posición real que mande el GT06.</p>
          <div className="field">
            <label>URL del servidor</label>
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="http://localhost:3000" />
          </div>
          <div className="field">
            <label>IMEI de la unidad</label>
            <input value={imei} onChange={(e) => setImei(e.target.value)} placeholder="ej. 868765432109123" />
          </div>
          <button className="connect-btn" onClick={connect}>Conectar y escuchar posición</button>
          <button className="demo-btn" onClick={startDemo}>Probar con datos simulados</button>
          {(formError || error) && <div className="connect-err">{formError ?? error}</div>}
        </div>
      )}

      {position && (
        <div className="sheet">
          <div className="sheet-handle" />
          <div className="unit-row">
            <div className="unit-id">
              <div className="unit-badge">{unitId.slice(-2)}</div>
              <div>
                <div className="unit-name">Unidad {unitId.slice(-4)}</div>
                <div className="unit-company">
                  {status === 'off' ? 'Sin conexión: última posición conocida' : source?.kind === 'demo' ? 'Recorrido simulado' : 'Señal en vivo desde el dispositivo'}
                </div>
              </div>
            </div>
            <div className="status-tag">{position.gpsPositioned === false ? 'GPS débil' : 'GPS OK'}</div>
          </div>
          <div className="stats-row">
            <div className="stat">
              <div className="stat-label">Velocidad</div>
              <div className="stat-value accent">{position.speedKmh ?? '—'} km/h</div>
            </div>
            <div className="stat">
              <div className="stat-label">Satélites</div>
              <div className="stat-value">{position.satellites ?? '—'}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Última señal</div>
              <div className="stat-value">{ago(lastSignalAt, now)}</div>
            </div>
          </div>
        </div>
      )}

      {pos && !follow && (
        <button className="recenter" onClick={() => setFollow(true)}>Seguir unidad</button>
      )}
    </>
  );
}
