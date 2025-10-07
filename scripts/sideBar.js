const SIDEBAR = document.getElementById("sideBar")
const SIDEBAR_BUTTON = document.getElementById("sideBarButton")
const BOTTOM = document.getElementById("bottomBar")

let isActive = false

SIDEBAR_BUTTON.addEventListener("click", () => {
    if (isActive) closeSideBar()
    else openSideBar()
});

function openSideBar() {
    SIDEBAR.classList.remove('hidden')
    SIDEBAR.classList.remove('close-slide')
    SIDEBAR.classList.add('open-slide')
    SIDEBAR.classList.add('flex')
    BOTTOM.classList.add('get-down')
    SIDEBAR_BUTTON.classList.add('hidden')
    isActive = true
}

function closeSideBar() {
    SIDEBAR.classList.remove('open-slide')
    SIDEBAR.classList.add('close-slide')
    BOTTOM.classList.remove('get-down')
    BOTTOM.classList.add('get-up')
    SIDEBAR_BUTTON.classList.remove('hidden')
    isActive = false
}

SIDEBAR.addEventListener('transitionend', () => {
    if (!isActive) {
        SIDEBAR.classList.add('hidden')
        SIDEBAR.classList.remove('flex')
    }
});

document.addEventListener('click', (e) => {
    const target = e.target
    if (isActive && !SIDEBAR.contains(target) && !SIDEBAR_BUTTON.contains(target)) {
        closeSideBar()
    }
});