export function attachUserLocationControl(map) {
    const SVG = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent( 
                `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                    <path fill="#FF4D8A" d="M376 88C376 57.1 350.9 32 320 32C289.1 32 264 57.1 264 88C264 118.9 289.1 144 320 144C350.9 144 376 118.9 376 88zM400 300.7L446.3 363.1C456.8 377.3 476.9 380.3 491.1 369.7C505.3 359.1 508.3 339.1 497.7 324.9L427.2 229.9C402 196 362.3 176 320 176C277.7 176 238 196 212.8 229.9L142.3 324.9C131.8 339.1 134.7 359.1 148.9 369.7C163.1 380.3 183.1 377.3 193.7 363.1L240 300.7L240 576C240 593.7 254.3 608 272 608C289.7 608 304 593.7 304 576L304 416C304 407.2 311.2 400 320 400C328.8 400 336 407.2 336 416L336 576C336 593.7 350.3 608 368 608C385.7 608 400 593.7 400 576L400 300.7z"/>
                </svg>`
            )}`
    let accuracyCircle = null;
    let userMarker = null;

    async function locate({ desiredAccuracy, maxWaitMs } = {}) {
        if (!navigator.geolocation) {
            alert('Geolocation not supported by this browser.');
            return;
        }

        let bestPos = null;
        let watchId = null;

        function cleanup() {
            if (watchId !== null) navigator.geolocation.clearWatch(watchId);
        }

        return new Promise((resolve, reject) => {
            const onSuccess = (pos) => {

                if (!bestPos || (pos.coords.accuracy) < (bestPos.coords.accuracy)) {
                    bestPos = pos;
                }

                if ((pos.coords.accuracy || 1e6) <= desiredAccuracy) {
                    cleanup();
                    applyPosition(bestPos);
                    resolve(bestPos);
                }
            };

            const onError = (err) => {
                cleanup();
                console.error('Geolocation error:', err);
                reject(err);
            };

            watchId = navigator.geolocation.watchPosition(onSuccess, onError, {
                enableHighAccuracy: true,
                maximumAge: 0,
            });

            // Timeout: if we don't get desired accuracy in time, use the best available
            const timer = setTimeout(() => {
                cleanup();
                clearTimeout(timer);
                if (bestPos) {
                    applyPosition(bestPos);
                    resolve(bestPos);
                } else {
                    reject(new Error('Timeout obtaining location'));
                }
            }, maxWaitMs);
        });
    }

    function applyPosition(pos) {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = pos.coords.accuracy || 30;
        const latLng = { lat, lng };

        if (!userMarker) {
            userMarker = new google.maps.Marker({
                position: latLng,
                map,
                title: 'You are here',
                icon: {
                    url: SVG, scaledSize: new google.maps.Size(30, 30),
                    anchor: new google.maps.Point(15,15)
                }
            });
        } else {
            userMarker.setPosition(latLng);
        }

        if (!accuracyCircle) {
            accuracyCircle = new google.maps.Circle({
                strokeColor: '#FF4D8A',
                strokeOpacity: 0.4,
                strokeWeight: 2,
                fillColor: '#FF99CB',
                fillOpacity: 0.12,
                map,
                center: latLng,
                radius: accuracy
            });
        } else {
            accuracyCircle.setCenter(latLng);
            accuracyCircle.setRadius(accuracy);
        }
    }

    return {
        locate
    };
}
