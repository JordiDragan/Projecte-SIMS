const SIDEBAR = document.getElementById("sideBar")
const SIDEBAR_BUTTON = document.getElementById("sideBarButton")
const BOTTOM = document.getElementById("bottomBar")

let isActive = false

SIDEBAR_BUTTON.addEventListener("click", () => {
    if(isActive) {
        closeSideBar()
    }else{
        openSideBar()
    }
   
});

function openSideBar(){
    SIDEBAR.classList.remove("hidden")
    SIDEBAR.classList.add("flex")
    BOTTOM.classList.add("get-down")
    SIDEBAR_BUTTON.classList.add("hidden")
    isActive = true
}

function closeSideBar(){
    SIDEBAR.classList.add("hidden")
    SIDEBAR.classList.remove("flex")
    BOTTOM.classList.remove("get-down")
    BOTTOM.classList.add("get-up")
    SIDEBAR_BUTTON.classList.remove("hidden")
    isActive = false
}

document.addEventListener('click', (e) => {
    const target = e.target;
    if (e.target.localName != "svg" && !SIDEBAR.contains(target)) {
        closeSideBar()
    }
});