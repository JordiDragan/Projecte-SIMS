(function () {
	const container = document.getElementById('camera');
	if (!container) return;

	// Controles UI: resolución y zoom
	const controls = document.createElement('div');
	controls.style.display = 'flex';
	controls.style.gap = '0.5rem';
	controls.style.alignItems = 'center';
	controls.style.marginBottom = '0.5rem';

	const resolutionSelect = document.createElement('select');
	resolutionSelect.title = 'Resolución';
	const resolutions = [
		{ label: 'QVGA 320x240', w: 320, h: 240 },
		{ label: 'VGA 640x480', w: 640, h: 480 },
		{ label: 'HD 1280x720', w: 1280, h: 720 },
		{ label: 'FHD 1920x1080', w: 1920, h: 1080 }
	];
	resolutions.forEach((r, i) => {
		const o = document.createElement('option');
		o.value = i;
		o.textContent = r.label;
		resolutionSelect.appendChild(o);
	});

	const zoomLabel = document.createElement('label');
	zoomLabel.textContent = 'Zoom';
	zoomLabel.style.display = 'flex';
	zoomLabel.style.alignItems = 'center';

	const zoomInput = document.createElement('input');
	zoomInput.type = 'range';
	zoomInput.min = '1';
	zoomInput.max = '1';
	zoomInput.step = '0.1';
	zoomInput.value = '1';
	zoomInput.disabled = true; // se habilita si la cámara soporta zoom
	zoomInput.style.width = '140px';

	const zoomValue = document.createElement('span');
	zoomValue.textContent = '1x';
	zoomValue.style.minWidth = '40px';
	zoomValue.style.marginLeft = '0.25rem';

	zoomLabel.appendChild(zoomInput);
	zoomLabel.appendChild(zoomValue);

	controls.appendChild(resolutionSelect);
	controls.appendChild(zoomLabel);

	// Elementos UI
	const video = document.createElement('video');
	video.setAttribute('playsinline', ''); // importante para iOS
	video.autoplay = true;
	video.muted = true; // evitar autoplay bloqueos en algunos navegadores
	video.style.width = '80%';
	video.style.height = '80vh';

	const msg = document.createElement('div');
	msg.id = 'camera-message';
	msg.style.marginTop = '0.5rem';
	msg.style.color = '#333';
	msg.textContent = 'Iniciando cámara...';

	container.appendChild(controls);
	container.appendChild(video);
	container.appendChild(msg);

	let currentStream = null;

	async function startCamera(extraConstraints = {}) {
		if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
			msg.textContent = 'API de cámara no disponible en este navegador.';
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
			msg.textContent = 'Cámara activa';

			// Configurar capacidades de zoom si están disponibles
			const [track] = stream.getVideoTracks();
			if (track) {
				try {
					const caps = track.getCapabilities ? track.getCapabilities() : {};
					if (caps.zoom) {
						// caps.zoom es un rango {min, max}
						const min = caps.zoom.min || 1;
						const max = caps.zoom.max || 1;
						const step = caps.zoom.step || 0.1;
						zoomInput.min = String(min);
						zoomInput.max = String(max);
						zoomInput.step = String(step);
						zoomInput.value = String(track.getSettings().zoom || min);
						zoomValue.textContent = zoomInput.value + 'x';
						zoomInput.disabled = false;

						// Aplicar zoom al mover el slider
						zoomInput.oninput = async (e) => {
							const v = Number(e.target.value);
							zoomValue.textContent = v + 'x';
							try {
								await track.applyConstraints({ advanced: [{ zoom: v }] });
							} catch (err) {
								// Algunos navegadores aceptan { zoom: v } directamente
								try { await track.applyConstraints({ zoom: v }); } catch (e) {
									console.warn('No se pudo aplicar zoom:', e);
								}
							}
						};
					} else {
						zoomInput.disabled = true;
						zoomValue.textContent = '';
					}
				} catch (err) {
					console.warn('Error leyendo capacidades de la cámara:', err);
					zoomInput.disabled = true;
					zoomValue.textContent = '';
				}
			}
		} catch (err) {
			console.error('Error al acceder a la cámara:', err);
			if (err.name === 'NotAllowedError' || err.name === 'SecurityError') {
				msg.textContent = 'Permiso denegado para usar la cámara. Otorga permiso y vuelve a intentarlo.';
			} else if (err.name === 'NotFoundError') {
				msg.textContent = 'No se encontró ninguna cámara disponible.';
			} else {
				msg.textContent = 'No se pudo acceder a la cámara: ' + (err.message || err.name);
			}
		}
	}

	function stopCamera() {
		if (!currentStream) return;
		currentStream.getTracks().forEach(t => t.stop());
		currentStream = null;
		msg.textContent = 'Cámara detenida';
		video.srcObject = null;
		zoomInput.disabled = true;
	}

	// Cambiar resolución según selección
	resolutionSelect.addEventListener('change', () => {
		const idx = Number(resolutionSelect.value || 1);
		const r = resolutions[idx] || resolutions[1];
		const extra = { video: { width: { ideal: r.w }, height: { ideal: r.h } } };
		startCamera(extra);
	});

	// Intentar iniciar automáticamente al cargar el script con la resolución por defecto (índice 1 -> 640x480)
	resolutionSelect.selectedIndex = 1;
	startCamera({ video: { width: { ideal: resolutions[1].w }, height: { ideal: resolutions[1].h } } });

	// Parar la cámara al cerrar o navegar fuera de la página
	window.addEventListener('beforeunload', stopCamera);

	// Parar/reanudar según visibilidad (opcional): libera la cámara si la pestaña está oculta
	document.addEventListener('visibilitychange', () => {
		if (document.hidden) {
			stopCamera();
		} else {
			// reintentar iniciar cuando la pestaña vuelva
			if (!currentStream) startCamera();
		}
	});

	// Exponer funciones para depuración desde consola si se necesita
	window.__scanCamera = { start: startCamera, stop: stopCamera };
})();

