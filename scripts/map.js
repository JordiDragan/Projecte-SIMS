import { createCenterMarker } from './markers.js';

export function createMap(elementId, center, zoom) {
  const minimalGreenStyle = [
    { elementType: 'geometry', stylers: [{ color: '#f5f5f4' }] },
    { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5f4' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#e9e9e6' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#dededb' }] },
    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#CAF0D8' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#e8f6f0' }] }
  ];

  const map = new google.maps.Map(document.getElementById(elementId), {
    center,
    zoom,
    minZoom: zoom - 1,
    maxZoom: zoom + 3,
    styles: minimalGreenStyle,
    disableDefaultUI: true,
    zoomControl: false,
    gestureHandling: 'greedy'
  });

  return map;
}

