let selectedFilters = [];

const checkboxes = document.querySelectorAll('input[type="checkbox"]');
const sections = {
    socmint: document.querySelector('.socmint-section'),
    geoint: document.querySelector('.geoint-section'),
    sigint: document.querySelector('.sigint-section'),
    misc: document.querySelector('.misc-section')
};

checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
        selectedFilters = [];
        checkboxes.forEach((checkbox) => {
            if (checkbox.checked) {
                selectedFilters.push(checkbox.nextElementSibling.textContent.trim().toLowerCase());
            }
        });
        for (let key in sections) {
            if (sections[key] !== null) {
                if (selectedFilters.includes(key)) {
                    sections[key].style.display = 'block';
                } else {
                    sections[key].style.display = 'none';
                }
            }
        }
    });
});
