function toggleMenu(event) {
    // Voorkom dat de klik "doorvloeit" naar het document (stopPropagation)
    if (event) event.stopPropagation();

    const sidebar = document.querySelector('.sidebar');
    const menuButton = document.querySelector('.menu-button-container'); // Gebruik de container

    sidebar.classList.toggle('show');
    menuButton.classList.toggle('open');
}

// Sluiten als je op een link klikt of buiten de sidebar
document.addEventListener('click', function(event) {
    const sidebar = document.querySelector('.sidebar');
    const menuButtonContainer = document.querySelector('.menu-button-container');

    // Als de sidebar open is...
    if (sidebar.classList.contains('show')) {
        // ...en de klik is NIET binnen de sidebar en NIET op de menuknop
        if (!sidebar.contains(event.target) && !menuButtonContainer.contains(event.target)) {
            sidebar.classList.remove('show');
            menuButtonContainer.classList.remove('open');
        }
    }
});

// Sluiten als de resolutie te groot wordt (Media Query check)
window.addEventListener('resize', function() {
    if (window.innerWidth > 1400) { // Match dit getal met je CSS breakpoint
        const sidebar = document.querySelector('.sidebar');
        const menuButtonContainer = document.querySelector('.menu-button-container');
        
        sidebar.classList.remove('show');
        menuButtonContainer.classList.remove('open');
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

//Vrije plaatsen update

async function updateVrijePlaatsen() {
    // Gebruik hier de Web App URL van je Google Script
    const webAppUrl = "https://script.google.com/macros/s/AKfycbykNbbWjuSXfGrIU5f15yxuXkOHirG9g5Yo_xn_mnUQwX5GojJuAMGdmQyOG_In5ss/exec";
    
    // We zoeken de 'tbody' op waar de rijen in moeten komen
    const tableBody = document.getElementById('sessie-body');
    
    if (!tableBody) return; // Veiligheidscheck

    console.log("Data ophalen van:", webAppUrl);
    
    try {
        const response = await fetch(webAppUrl);
        const data = await response.json(); // Dit is nu een LIJST (Array) van sessies
        
        console.log("Data ontvangen:", data);
        
        // 1. Maak de tabel eerst leeg (haalt "Laden..." weg)
        tableBody.innerHTML = '';
        
        // 2. Loop door elke sessie in de ontvangen data
        data.forEach((sessie) => {
            // Maak een nieuwe tabelrij aan
            const row = document.createElement('tr');
            
            // Bepaal de status en knop instellingen
            let statusTekst = "Beschikbaar";
            let statusClass = "status-badge";
            let knopHTML = `<a href="inschrijving-vormingsmoment-begeleiders.html" class="btn-table">Inschrijven</a>`;

            if (sessie.vrij <= 0) {
                statusTekst = "Volgeboekt";
                statusClass = "status-badge full";
                knopHTML = `<a href="#" class="btn-table" style="pointer-events: none; background-color: #ccc; border-color: #ccc; color: #666;" aria-disabled="true">Volzet</a>`;
            }

            // 3. Bouw de HTML voor deze specifieke rij
            // We gebruiken de namen die we in het Google Script hebben gedefinieerd
            row.innerHTML = `
                <td data-label="Cursus">${sessie.cursusnaam || "Vormingsmoment Begeleiders"}</td>
                <td data-label="Datum">${sessie.datum}</td>
                <td data-label="Tijdstip">${sessie.tijdstip || "18:30 - 21:30"}</td>
                <td data-label="Prijs">€${sessie.prijs || "20"}</td>
                <td data-label="Plaatsen"><span>${sessie.vrij}</span>/20</td>
                <td data-label="Status"><span class="${statusClass}">${statusTekst}</span></td>
                <td data-label="Actie">${knopHTML}</td>
            `;
            
            // 4. Voeg de rij toe aan de tabel
            tableBody.appendChild(row);
        });
        
    } catch (error) {
        console.error("Fout bij het ophalen van Google data:", error);
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:red;">Kon de actuele data niet laden. Probeer later opnieuw.</td></tr>';
    }
}

async function updateTheorieCards() {
    // 1. Gebruik je nieuwe Web App URL
    const webAppUrl = "https://script.google.com/macros/s/AKfycbygwbn59LcBY-o2epfr_mRDtmy7Gpl0-bVXik0qcZncl65iXEyXBKICPtI8ebELPyOYww/exec"; 
    const container = document.getElementById('theorie-cards-container');
    
    if (!container) return;

    try {
        const response = await fetch(webAppUrl);
        const data = await response.json(); 
        
        container.innerHTML = ''; 

        data.forEach((sessie) => {
            const card = document.createElement('div');
            card.className = 'course-card';
            
            let statusTekst = "Beschikbaar";
            let statusClass = "badge-available";
            let knopHTML = `<a href="inschrijving-theorie-rijbewijs-b.html" class="btn-card">Inschrijven</a>`;

            // Controleer of de sessie vol is
            if (sessie.vrij <= 0) {
                statusTekst = "Volgeboekt";
                statusClass = "badge-full";
                knopHTML = `<button class="btn-card btn-full" disabled>Volzet</button>`;
            }

            // Gebruik €120 als de prijs in de Sheet leeg is of 0 aangeeft
            const prijsTonen = (sessie.prijs && sessie.prijs !== "0") ? sessie.prijs : "120";

            card.innerHTML = `
                <div class="card-header">
                    <h3>${sessie.cursusnaam}</h3>
                    <span class="status-badge ${statusClass}">${statusTekst}</span>
                </div>
                <div class="card-body">
                    <div class="info-row">
                        <strong>📅 Lesdata:</strong>
                        <div class="dates-list" style="white-space: pre-line;">${sessie.datum}</div>
                    </div>
                    <div class="info-row">
                        <strong>👥 Plaatsen:</strong> 
                        <span>${sessie.vrij_teller} vrije plaatsen</span>
                    </div>
                    <div class="info-row">
                        <strong>💰 Prijs:</strong> 
                        <span>€${prijsTonen}</span>
                    </div>
                </div>
                <div class="card-footer">
                    ${knopHTML}
                </div>
            `;
            
            container.appendChild(card);
        });
        
    } catch (error) {
        console.error("Fout bij het laden:", error);
        container.innerHTML = '<p style="text-align:center; color:red;">Kon de data niet laden.</p>';
    }
}

updateTheorieCards();