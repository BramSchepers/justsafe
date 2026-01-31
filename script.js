function updateMenuAria() {
    const sidebar = document.querySelector('.sidebar');
    const menuButtonContainer = document.querySelector('.menu-button-container');
    const button = menuButtonContainer ? menuButtonContainer.querySelector('button') : null;
    if (!button) return;
    const isOpen = sidebar && sidebar.classList.contains('show');
    button.setAttribute('aria-expanded', isOpen);
    button.setAttribute('aria-label', isOpen ? 'Menu sluiten' : 'Menu openen');
}

function toggleMenu(event) {
    // Voorkom dat de klik "doorvloeit" naar het document (stopPropagation)
    if (event) event.stopPropagation();

    const sidebar = document.querySelector('.sidebar');
    const menuButton = document.querySelector('.menu-button-container');

    sidebar.classList.toggle('show');
    menuButton.classList.toggle('open');
    updateMenuAria();
}

// Sluiten als je op een link klikt of buiten de sidebar
document.addEventListener('click', function (event) {
    const sidebar = document.querySelector('.sidebar');
    const menuButtonContainer = document.querySelector('.menu-button-container');

    // Als de sidebar open is...
    if (sidebar.classList.contains('show')) {
        // ...en de klik is NIET binnen de sidebar en NIET op de menuknop
        if (!sidebar.contains(event.target) && !menuButtonContainer.contains(event.target)) {
            sidebar.classList.remove('show');
            menuButtonContainer.classList.remove('open');
            updateMenuAria();
        }
    }
});

// Sluiten als de resolutie te groot wordt (Media Query check)
window.addEventListener('resize', function () {
    if (window.innerWidth > 1400) { // Match dit getal met je CSS breakpoint
        const sidebar = document.querySelector('.sidebar');
        const menuButtonContainer = document.querySelector('.menu-button-container');

        sidebar.classList.remove('show');
        menuButtonContainer.classList.remove('open');
        updateMenuAria();
    }
});

// Zorg dat de sidebar sluit als je op een link IN de sidebar klikt
const sidebarLinks = document.querySelectorAll('.sidebar a');
sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
        const sidebar = document.querySelector('.sidebar');
        const menuButtonContainer = document.querySelector('.menu-button-container');
        sidebar.classList.remove('show');
        menuButtonContainer.classList.remove('open');
        updateMenuAria();
    });
});

//Zet juiste jaar op de site
document.addEventListener('DOMContentLoaded', () => {
    // We zoeken op alle elementen met de ID 'current-year'
    const yearElements = document.querySelectorAll('#current-year');
    const year = new Date().getFullYear();

    yearElements.forEach(element => {
        element.textContent = year;
    });
});

async function updateVrijePlaatsen() {
    // Gebruik hier de Web App URL van je Google Script
    const webAppUrl = "https://script.google.com/macros/s/AKfycbykNbbWjuSXfGrIU5f15yxuXkOHirG9g5Yo_xn_mnUQwX5GojJuAMGdmQyOG_In5ss/exec";

    // We zoeken de 'tbody' op waar de rijen in moeten komen
    const tableBody = document.getElementById('sessie-body');

    if (!tableBody) return; // Veiligheidscheck

    try {
        const response = await fetch(webAppUrl);
        const data = await response.json(); // Dit is nu een LIJST (Array) van sessies

        // 1. Maak de tabel eerst leeg (haalt "Laden..." weg)
        tableBody.innerHTML = '';

        // 2. Loop door elke sessie in de ontvangen data
        data.forEach((sessie) => {
            // Maak een nieuwe tabelrij aan
            const row = document.createElement('tr');

            // Bepaal de status en knop instellingen
            let statusTekst = "Beschikbaar";
            let statusClass = "status-badge badge-available";
            let knopHTML = `<a href="/nl/rijbewijs/vormingsmoment-begeleider/inschrijving.html" class="btn-table">Inschrijven</a>`;

            if (sessie.vrij <= 0) {
                statusTekst = "Volgeboekt";
                statusClass = "status-badge badge-full";
                knopHTML = `<a href="#" class="btn-table" style="pointer-events: none; background-color: #ccc; border-color: #ccc; color: #666;" aria-disabled="true">Volzet</a>`;
            }

            // 3. Bouw de HTML voor deze specifieke rij
            // We gebruiken de namen die we in het Google Script hebben gedefinieerd
            row.innerHTML = `
                <td data-label="Cursus">${sessie.cursusnaam || "Vormingsmoment Begeleiders"}</td>
                <td data-label="Datum">${sessie.datum}</td>
                <td data-label="Tijdstip">18:30 - 21:30</td>
                <td data-label="Prijs">€ 21</td>
                <td data-label="Plaatsen"><span>${sessie.vrij}</span></td>
                <td data-label="Status"><span class="${statusClass}">${statusTekst}</span></td>
                <td data-label="Actie">${knopHTML}</td>
            `;

            // 4. Voeg de rij toe aan de tabel
            tableBody.appendChild(row);
        });

    } catch (error) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:red;">Kon de actuele data niet laden. Probeer later opnieuw.</td></tr>';
    }
}

async function updateTheorieCards() {
    const webAppUrl = "https://script.google.com/macros/s/AKfycbzywhmn0g1YD6NZkC3mvk5Dv4mq48P6AsdrJHT7IDs_pJzH1hEgp7EdFCS6SwDLjNZ_/exec";
    const container = document.getElementById('theorie-cards-container');
    const template = document.getElementById('course-card-template');

    if (!container || !template) return;

    try {
        const response = await fetch(webAppUrl);
        const data = await response.json();

        // Maakt de container leeg (verwijdert het "worden geladen..." zinnetje)
        container.innerHTML = '';

        data.forEach((sessie) => {
            const clone = template.content.cloneNode(true);

            // 1. Lesdata invullen
            clone.querySelector('.lesdata').innerText = sessie.datum;

            // 2. Plaatsen weergave opbouwen: "5/20 vrije plaatsen"
            // We gebruiken sessie.vrij_teller (kolom E) en sessie.max_plaatsen (kolom D)
            const aantalVrij = sessie.vrij_teller;
            const totaalPlaatsen = sessie.max_plaatsen || 20; // Fallback naar 20 als leeg
            const plaatsenTekst = `${aantalVrij}/${totaalPlaatsen} vrije plaatsen`;

            clone.querySelector('.vrije-plaatsen-weergave').innerText = plaatsenTekst;

            const badge = clone.querySelector('.status-badge');
            const footer = clone.querySelector('.card-footer');

            // 3. Status en knop bepalen
            if (aantalVrij <= 0) {
                badge.innerText = "Volgeboekt";
                badge.className = "status-badge badge-full";
                footer.innerHTML = `<button class="btn-card btn-full" disabled style="background-color: #ccc; cursor: not-allowed;">Volzet</button>`;
            } else {
                badge.innerText = "Beschikbaar";
                badge.className = "status-badge badge-available";
                footer.innerHTML = `<a href="https://justsafe.be/nl/rijbewijs/auto/theorie/inschrijving.html" class="btn-card">Inschrijven</a>`;
            }

            container.appendChild(clone);
        });

    } catch (error) {
        container.innerHTML = '<p>Kon de data niet laden. Probeer het later opnieuw.</p>';
    }
}
if (document.getElementById('theorie-cards-container')) updateTheorieCards();
if (document.getElementById('sessie-body')) updateVrijePlaatsen();

window.addEventListener('load', function () {
    const heroimage = document.getElementById('heroimage');

    // De 'if' controleert of we op een pagina zijn met het heroimage (index pagina)
    if (heroimage) {
        const fotos = [
            "/image/moto-just-safe-grootV2.webp",
            "/image/auto-just-safe-grootV2.webp"
        ];

        let vorigeIndex = sessionStorage.getItem('laatsteFotoIndex');
        let nieuweIndex;

        if (vorigeIndex === null) {
            nieuweIndex = Math.floor(Math.random() * fotos.length);
        } else {
            nieuweIndex = (parseInt(vorigeIndex) + 1) % fotos.length;
        }

        heroimage.src = fotos[nieuweIndex];
        sessionStorage.setItem('laatsteFotoIndex', nieuweIndex);
    }
});