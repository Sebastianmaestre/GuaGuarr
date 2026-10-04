import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { buildDemoRoute } from './demoRoute';
import type { Position, Source, Status } from './types';

const MAX_TRAIL = 60;
const CONNECT_ERROR =
  'No se pudo conectar. Revisá la URL, que el servidor esté corriendo y que CORS esté abierto.';

export function useTracking(source: Source) {
  const [status, setStatus] = useState<Status>('off');
  const [position, setPosition] = useState<Position | null>(null);
  const [trail, setTrail] = useState<[number, number][]>([]);
  const [lastSignalAt, setLastSignalAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPosition(null);
    setTrail([]);
    setLastSignalAt(null);
    setError(null);
    if (!source) {
      setStatus('off');
      return;
    }

    const onPosition = (p: Position) => {
      setStatus('on');
      setPosition(p);
      setLastSignalAt(Date.now());
      setTrail((t) => [...t, [p.latitude, p.longitude] as [number, number]].slice(-MAX_TRAIL));
    };

    if (source.kind === 'demo') {
      const route = buildDemoRoute();
      let i = 0;
      setStatus('waiting');
      const id = setInterval(() => onPosition(route[i++ % route.length]), 1000);
      return () => clearInterval(id);
    }

    setStatus('connecting');
    const socket = io(source.url, { transports: ['websocket'], reconnectionAttempts: 5 });
    socket.on('connect', () => {
      socket.emit('subscribe', source.imei);
      setError(null);
      setStatus('waiting');
    });
    socket.on('connect_error', () => {
      setError(CONNECT_ERROR);
      setStatus('off');
    });
    socket.on('disconnect', () => setStatus('off'));
    socket.on('position', onPosition);
    return () => {
      socket.disconnect();
    };
  }, [source]);

  return { status, position, trail, lastSignalAt, error };
}
