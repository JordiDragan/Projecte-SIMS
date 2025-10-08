import { createMap } from './map.js';
import { createRandomMarkers, bottomBarToggle } from './markers.js';
import { attachUserLocationControl } from './userLocation.js';

const CENTER = { lat: 40.70922331914339, lng: 0.5771204885805513 };
const ZOOM = 15
const MARKERS_COUNT= 10
const RADIUS_MT_FROM_CENTER=600

export function initMap() {
  const map = createMap('map', CENTER, ZOOM);

  createRandomMarkers(map, CENTER, MARKERS_COUNT, RADIUS_MT_FROM_CENTER);
  bottomBarToggle(map);
  attachUserLocationControl(map).locate({ desiredAccuracy: 30, maxWaitMs: 10000 }).catch((e) => {
    console.warn('Initial locate failed or timed out:', e);
  });
}

window.initMap = initMap;
