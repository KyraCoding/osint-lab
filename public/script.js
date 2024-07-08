document.getElementById("loginBtn").addEventListener("click", () => {
    document.getElementById("main").style.visibility = "visible";
});

const hiddenSections = document.querySelectorAll(".hidden");
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("show");
        }
        else {
            entry.target.classList.remove("show");
        }
    });
});

hiddenSections.forEach((el) => {
    observer.observe(el);
});