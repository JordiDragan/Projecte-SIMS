const RESERVE_BTN = document.getElementById("reserve_button")

// Guardamos el texto original del botón para restaurarlo al finalizar
const ORIGINAL_TEXT = RESERVE_BTN ? RESERVE_BTN.innerText : "Reserve"

// Estado del timer
let reserveInterval = null
let reserveRemaining = 0

function formatTime(seconds) {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function startReserveTimer(seconds) {
    if (!RESERVE_BTN) return

    if (reserveInterval) {
        clearInterval(reserveInterval)
        reserveInterval = null
    }

    reserveRemaining = seconds
    RESERVE_BTN.disabled = true
    updateButtonText()

    reserveInterval = setInterval(() => {
        reserveRemaining -= 1
        if (reserveRemaining <= 0) {
            clearInterval(reserveInterval)
            reserveInterval = null
            RESERVE_BTN.disabled = false
            RESERVE_BTN.innerText = ORIGINAL_TEXT
        } else {
            updateButtonText()
        }
    }, 1000)
}

function updateButtonText() {
    RESERVE_BTN.innerText = `${formatTime(reserveRemaining)}`
}

function startFiveMinuteTimer() {
    startReserveTimer(5 * 60)
}


RESERVE_BTN.addEventListener('click', () => {
    startFiveMinuteTimer()
})
