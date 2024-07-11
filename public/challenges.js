let selectedFilters = [];

const checkboxes = document.querySelectorAll('input[type="checkbox"]');
const socintSection = document.querySelector('.socint-section');
checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
        selectedFilters = [];
        checkboxes.forEach((checkbox) => {
            if (checkbox.checked) {
                selectedFilters.push(checkbox.nextElementSibling.textContent.trim());
            }
        });
        if (selectedFilters.includes("SOCINT")) {
            socintSection.style.display = "none";
        }
        else {
            socintSection.style.display = "block";
        }
    });
});
