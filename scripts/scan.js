const TYPE_ID_BTN = document.getElementById('typeIdBtn')
const CAMERA_DIV = document.getElementById('camera')
const KEYBOARD_INPUT = document.getElementById('typedId')
const KEYBOARD_DIV = document.getElementById('keyboard')
const TEXT_SUB = document.getElementById('textSub')
const CHANGE_MODE_BTN = document.getElementById('changeModeText')
const SCAN_QR_ICON = document.getElementById('scanQRicon')
const TYPE_ID_ICON = document.getElementById('typeIdIcon')

TYPE_ID_BTN.addEventListener('click', () => {
	if( CAMERA_DIV.style.display === 'none' ){
		CAMERA_DIV.style.display = 'flex';
		KEYBOARD_INPUT.style.display = 'none';
		KEYBOARD_DIV.style.display = 'none';
		TEXT_SUB.innerText = 'Find the QR in the car';
		CHANGE_MODE_BTN.innerText = 'Type ID';
		SCAN_QR_ICON.style.display = 'none';
		TYPE_ID_ICON.style.display = 'block';
	}else{
		CAMERA_DIV.style.display = 'none';
		KEYBOARD_INPUT.style.display = 'flex';
		KEYBOARD_DIV.style.display = 'flex';
		TEXT_SUB.innerText = 'Type the ID manually';
		CHANGE_MODE_BTN.innerText = 'Scan QR';
		SCAN_QR_ICON.style.display = 'block';
		TYPE_ID_ICON.style.display = 'none';
	}
});

(function () {
	const container = document.getElementById('camera');
	if (!container) return;

	// UI elements
	const video = document.createElement('video');
	video.setAttribute('playsinline', ''); // important for iOS
	video.autoplay = true;
	video.muted = true; // evitar autoplay bloqueos en algunos navegadores
	// Make the video fill the camera container
	video.style.width = '100%';
	video.style.height = '100%';
	video.style.objectFit = 'cover';
	container.appendChild(video);

	let currentStream = null;

	async function startCamera(extraConstraints = {}) {
		if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
			console.error('API de cámara no disponible en este navegador.');
			return;
		}

	// Stop previous stream first
		if (currentStream) stopCamera();

		// Build base constraints: prefer rear camera on mobile
		const baseVideo = Object.assign({ facingMode: { ideal: 'environment' } }, extraConstraints.video || {});
		const constraints = Object.assign({ video: baseVideo, audio: false }, extraConstraints);

		try {
			const stream = await navigator.mediaDevices.getUserMedia(constraints);
			currentStream = stream;
			video.srcObject = stream;
			try { await video.play(); } catch (e) { /* ignore autoplay play errors */ }
		} catch (err) {
			console.error('Error al acceder a la cámara:', err);
		}
	}

	function stopCamera() {
		if (!currentStream) return;
		currentStream.getTracks().forEach(t => t.stop());
		currentStream = null;
		video.srcObject = null;
	}

	// Start the camera requesting an ideal resolution based on the container size
	function startCameraForContainer() {
		const rect = container.getBoundingClientRect();
		const DPR = window.devicePixelRatio || 1;
		const desiredWidth = Math.max(1, Math.round(rect.width * DPR));
		const desiredHeight = Math.max(1, Math.round(rect.height * DPR));

	// Request the resolution as ideal (not forced) so the browser can pick the best available
		startCamera({ video: { width: { ideal: desiredWidth }, height: { ideal: desiredHeight } } });
	}

	// Start the camera for the first time
	startCameraForContainer();

	// Readjust if the container size changes (250ms debounce)
	let resizeTimer = null;
	if (window.ResizeObserver) {
		const ro = new ResizeObserver(() => {
			clearTimeout(resizeTimer);
			resizeTimer = setTimeout(() => {
				// only restart if the tab is visible
				if (!document.hidden) startCameraForContainer();
			}, 250);
		});
		ro.observe(container);
	} else {
	// Fallback: listen to window resize
		window.addEventListener('resize', () => {
			clearTimeout(resizeTimer);
			resizeTimer = setTimeout(() => { if (!document.hidden) startCameraForContainer(); }, 250);
		});
	}

	// Also readjust after an orientation change
	window.addEventListener('orientationchange', () => { setTimeout(startCameraForContainer, 300); });

	// Stop the camera when closing or navigating away from the page
	window.addEventListener('beforeunload', stopCamera);

	// Pause/resume based on visibility (optional): release the camera when the tab is hidden
	document.addEventListener('visibilitychange', () => {
		if (document.hidden) {
			stopCamera();
		} else {
			// retry starting when the tab returns with resolution based on the container
			if (!currentStream) startCameraForContainer();
		}
	});
})();

