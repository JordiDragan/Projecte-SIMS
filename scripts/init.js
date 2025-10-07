import { createMap } from './map.js';
import { createCenterMarker, createRandomMarkers, bottomBarToggle } from './markers.js';

const CENTER = { lat: 40.70922331914339, lng: 0.5771204885805513 };
const ZOOM = 15
const MARKERS_COUNT= 5
const RADIUS_MT_FROM_CENTER=600

export function initMap() {
  const map = createMap('map', CENTER, ZOOM);

  createRandomMarkers(map, CENTER, MARKERS_COUNT, RADIUS_MT_FROM_CENTER);
  bottomBarToggle(map);
}

window.initMap = initMap;
