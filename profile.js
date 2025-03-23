function toggleDropdown() {
    document.getElementById("dropdown").classList.toggle("show");
}

window.onclick = function(event) {
    if (!event.target.closest(".profile-container")) {
        document.getElementById("dropdown").classList.remove("show");
    }
};
