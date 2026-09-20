import React, { useEffect, useRef } from 'react';
import { Facility } from '../types';
import L from 'leaflet';

interface FacilityMapProps {
  facilities: Facility[];
  onSelectFacility?: (fac: Facility) => void;
  selectedFacilityId?: string | null;
}

export const FacilityMap: React.FC<FacilityMapProps> = ({
  facilities,
  onSelectFacility,
  selectedFacilityId,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize map
      const map = L.map(mapContainerRef.current).setView([25.5941, 85.1376], 9);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear old markers
    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};

    // Group bounds
    const bounds = L.latLngBounds([]);

    facilities.forEach(fac => {
      const isDistrictHospital = fac.type === 'District Hospital';
      const isCHC = fac.type.includes('CHC');
      const isSelected = fac.id === selectedFacilityId;

      const markerColor = isDistrictHospital ? '#0d9488' : isCHC ? '#0284c7' : '#e11d48';

      // Custom HTML pin
      const iconHtml = `
        <div style="
          background-color: ${markerColor};
          width: ${isSelected ? '32px' : '26px'};
          height: ${isSelected ? '32px' : '26px'};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 11px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);
          border: 2px solid white;
          cursor: pointer;
          transition: transform 0.2s;
        ">
          ${isDistrictHospital ? 'DH' : isCHC ? 'CHC' : 'PHC'}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-facility-pin',
        html: iconHtml,
        iconSize: [isSelected ? 32 : 26, isSelected ? 32 : 26],
        iconAnchor: [isSelected ? 16 : 13, isSelected ? 16 : 13],
      });

      const marker = L.marker([fac.latitude, fac.longitude], { icon: customIcon }).addTo(map);

      const popupContent = document.createElement('div');
      popupContent.className = 'p-2 text-xs font-sans';
      popupContent.innerHTML = `
        <div style="font-weight: bold; font-size: 13px; color: #0f172a;">${fac.name}</div>
        <div style="color: #64748b; font-size: 11px; margin-top: 2px;">${fac.type} • ${fac.district}</div>
        <div style="margin-top: 6px; display: flex; gap: 4px; font-size: 10px;">
          <span style="background: ${fac.doctor_available ? '#dcfce7' : '#fee2e2'}; color: ${fac.doctor_available ? '#166534' : '#991b1b'}; padding: 2px 6px; border-radius: 4px; font-weight: 600;">
            ${fac.doctor_available ? 'Doctor Active' : 'Off-duty'}
          </span>
          <span style="background: ${fac.emergency_available ? '#dbeafe' : '#f1f5f9'}; color: ${fac.emergency_available ? '#1e40af' : '#64748b'}; padding: 2px 6px; border-radius: 4px; font-weight: 600;">
            ${fac.emergency_available ? '24x7 Emergency' : 'OPD'}
          </span>
        </div>
        <button id="select-fac-${fac.id}" style="
          margin-top: 8px;
          width: 100%;
          background: #0f172a;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          border: none;
          font-weight: 600;
          cursor: pointer;
        ">View Details</button>
      `;

      marker.bindPopup(popupContent);
      marker.on('popupopen', () => {
        const btn = document.getElementById(`select-fac-${fac.id}`);
        if (btn && onSelectFacility) {
          btn.onclick = () => onSelectFacility(fac);
        }
      });

      markersRef.current[fac.id] = marker;
      bounds.extend([fac.latitude, fac.longitude]);
    });

    if (facilities.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [facilities, selectedFacilityId, onSelectFacility]);

  return (
    <div className="w-full h-80 sm:h-96 rounded-xl overflow-hidden border border-slate-200 relative shadow-sm z-10">
      <div ref={mapContainerRef} className="w-full h-full" />
      <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200 text-[10px] flex items-center gap-3 z-[400] text-slate-700 shadow-sm">
        <span className="font-bold">Legend:</span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span> District Hospital
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span> Community Health Centre (CHC)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span> Primary Health Centre (PHC)
        </span>
      </div>
    </div>
  );
};
