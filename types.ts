// Contrato del evento `position` que emite el backend (Socket.IO).
// Si el gateway de NestJS usa otros nombres, se ajusta solo acá.
export interface Position {
  latitude: number;
  longitude: number;
  speedKmh?: number;
  satellites?: number;
  gpsPositioned?: boolean;
}

export type Status = 'off' | 'connecting' | 'waiting' | 'on';

export type Source =
  | { kind: 'live'; url: string; imei: string }
  | { kind: 'demo' }
  | null;
