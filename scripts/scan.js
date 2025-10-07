(function () {
	const container = document.getElementById('camera');
	if (!container) return;

	// Elementos UI
	const video = document.createElement('video');
	video.setAttribute('playsinline', ''); // importante para iOS
	video.autoplay = true;
	video.muted = true; // evitar autoplay bloqueos en algunos navegadores
	// Hacer que el video llene el contenedor de cámara
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

	// Iniciar la cámara pidiendo una resolución ideal basada en el tamaño del contenedor
	function startCameraForContainer() {
		const rect = container.getBoundingClientRect();
		const DPR = window.devicePixelRatio || 1;
		const desiredWidth = Math.max(1, Math.round(rect.width * DPR));
		const desiredHeight = Math.max(1, Math.round(rect.height * DPR));

		// Pedimos la resolución como ideal (no forzada) para que el navegador elija la mejor disponible
		startCamera({ video: { width: { ideal: desiredWidth }, height: { ideal: desiredHeight } } });
	}

	// Inicia la cámara la primera vez
	startCameraForContainer();

	// Reajustar si el tamaño del contenedor cambia (debounce de 250ms)
	let resizeTimer = null;
	if (window.ResizeObserver) {
		const ro = new ResizeObserver(() => {
			clearTimeout(resizeTimer);
			resizeTimer = setTimeout(() => {
				// sólo reiniciar si la pestaña está visible
				if (!document.hidden) startCameraForContainer();
			}, 250);
		});
		ro.observe(container);
	} else {
		// Fallback: escuchar resize de ventana
		window.addEventListener('resize', () => {
			clearTimeout(resizeTimer);
			resizeTimer = setTimeout(() => { if (!document.hidden) startCameraForContainer(); }, 250);
		});
	}

	// También reajustar tras un cambio de orientación
	window.addEventListener('orientationchange', () => { setTimeout(startCameraForContainer, 300); });

	// Parar la cámara al cerrar o navegar fuera de la página
	window.addEventListener('beforeunload', stopCamera);

	// Parar/reanudar según visibilidad (opcional): libera la cámara si la pestaña está oculta
	document.addEventListener('visibilitychange', () => {
		if (document.hidden) {
			stopCamera();
		} else {
			// reintentar iniciar cuando la pestaña vuelva con resolución basada en el contenedor
			if (!currentStream) startCameraForContainer();
		}
	});
})();

