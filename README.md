# GuaguaRD web (React + TypeScript)

```bash
npm install
npm run dev
```

Abrí la URL que muestre Vite. Dos modos:
- **Probar con datos simulados**: una guagua recorre una ruta de ejemplo, sin backend.
- **Conectar**: URL del servidor Socket.IO + IMEI. El cliente emite `subscribe` con el IMEI y escucha `position` (`latitude`, `longitude`, `speedKmh`, `satellites`, `gpsPositioned`). El contrato está en `src/types.ts`.

Estructura: `useTracking.ts` (conexión/demo), `TrackerMap.tsx` (mapa), `App.tsx` (UI).
