const svg = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0D6344" class="size-6">
    <path fill-rule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clip-rule="evenodd" />
  </svg>`
)}`;

const selected = document.getElementById('selectedCarInfo');
const bottom = document.getElementById('bottomBar');


function randomPointAround(centerLatLng, radiusMeters) {
  const radiusInDegrees = radiusMeters / 111320; // approx conversion
  const u = Math.random();
  const v = Math.random();
  const w = radiusInDegrees * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const dx = w * Math.cos(t);
  const dy = w * Math.sin(t);
  const newLat = centerLatLng.lat + dy;
  const newLng = centerLatLng.lng + dx / Math.cos(centerLatLng.lat * Math.PI / 180);
  return { lat: newLat, lng: newLng };
}

export function createCenterMarker(map, center) {
  return new google.maps.Marker(
    { 
      position: center, 
      map, 
      icon: { 
        url: svg, scaledSize: new google.maps.Size(50,50), 
        anchor: new google.maps.Point(25,50) 
      } });
}

export function createRandomMarkers(map, center, count, radiusMeters ) {
  const markers = [];;
  for (let i=0;i<count;i++) {
    const p = randomPointAround(center, radiusMeters);
    const m = new google.maps.Marker({ 
      position: p, 
      map, 
      icon: { url: svg, scaledSize: new google.maps.Size(32,32), 
      anchor: new google.maps.Point(14,28) }, title: `Point ${i+1}` 
    });

    m.addListener('click', () => {
      bottom.classList.add('sliding-down')

      setTimeout(() => {

        selected.classList.add('grid');
        selected.classList.remove('hidden'); 
        bottom.classList.remove('sliding-down')
        bottom.classList.add('expanded');

      },200)
      
      
    });

    markers.push(m);
  }
  return markers;
}

export function bottomBarToggle(map) {
  // Collapse on map click
  map.addListener('click', () => {
    bottom.classList.add('sliding-down')

    setTimeout(() => {

        selected.classList.remove('grid');
        selected.classList.add('hidden'); 
        bottom.classList.remove('sliding-down')
        bottom.classList.remove('expanded');

      },200)
  });

  // Collapse when clicking outside the bottom bar
  document.addEventListener('click', (e) => {
    const target = e.target;
    if (!bottom.contains(target) && !target.closest('.gm-style')) {
      bottom.classList.add('sliding-down')

      setTimeout(() => {

        selected.classList.remove('grid');
        selected.classList.add('hidden'); 
        bottom.classList.remove('sliding-down')
        bottom.classList.remove('expanded');

      },200)
    }
  });
}
