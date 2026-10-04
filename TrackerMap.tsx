import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Polyline, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const RD_CENTER: [number, number] = [18.7357, -70.1627];

const busIcon = L.divIcon({
  html: '<div class="bus-marker"><div class="bus-ring"></div><div class="bus-core"></div></div>',
  className: '',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

interface FollowProps {
  pos: [number, number] | null;
  follow: boolean;
  onUserMove: () => void;
}

function Follow({ pos, follow, onUserMove }: FollowProps) {
  const map = useMap();
  const first = useRef(true);
  useMapEvents({ dragstart: onUserMove });
  useEffect(() => {
    if (!pos) {
      first.current = true;
      return;
    }
    if (!follow) return;
    if (first.current) {
      map.setView(pos, 16);
      first.current = false;
    } else {
      map.panTo(pos, { animate: true, duration: 0.6 });
    }
  }, [pos, follow, map]);
  return null;
}

interface Props extends FollowProps {
  trail: [number, number][];
}

export function TrackerMap({ pos, trail, follow, onUserMove }: Props) {
  return (
    <MapContainer center={RD_CENTER} zoom={8} zoomControl={false} id="map">
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      {trail.length > 1 && <Polyline positions={trail} pathOptions={{ color: '#0E7C86', weight: 4, opacity: 0.85 }} />}
      {pos && <Marker position={pos} icon={busIcon} zIndexOffset={1000} />}
      <Follow pos={pos} follow={follow} onUserMove={onUserMove} />
    </MapContainer>
  );
}
