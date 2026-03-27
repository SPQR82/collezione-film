// URL del tuo Google Sheet in formato CSV
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQvDWnpCmYlgbTD7v1qwrI1WyPbRt5Kbbg3S0ZAQzVRmpaQMgO2lfYJ7vlfmWy4HnOgSthCtHBVbTIR/pub?gid=1209283805&single=true&output=csv";

fetch(CSV_URL)
    .then(response => response.text())
    .then(data => {

        // --- PARSING CSV ---
        const rows = data.split("\n").map(r => r.split(","));
        const headers = rows[0].map(h => h.trim());

        const films = rows.slice(1).map(row => {
            let obj = {};
            headers.forEach((h, i) => obj[h] = row[i] ? row[i].trim() : "");
            return obj;
        });

        // --- CONTROLLO SE SIAMO NELLA PAGINA FILM ---
        const params = new URLSearchParams(window.location.search);
        const titoloSelezionato = params.get("titolo");

        if (titoloSelezionato) {
            mostraSchedaFilm(films, titoloSelezionato);
            return;
        }

        // --- ALTRIMENTI SIAMO NELL'INDEX ---
        inizializzaIndex(films);
    });


// ======================================================
// FUNZIONE: MOSTRA SCHEDA FILM
// ======================================================
function mostraSchedaFilm(films, titolo) {

    const film = films.find(f => f.Titolo === titolo);
    const dettagli = document.getElementById("film-details");

    if (!film || !dettagli) return;

    // --- COSTRUZIONE HTML DELLA SCHEDA ---
    dettagli.innerHTML = `
        <p><strong>Titolo:</strong> ${film.Titolo}</p>
        <p><strong>Regia:</strong> ${film.Regia}</p>
        <p><strong>Uscita:</strong> ${film.Uscita}</p>
        <p><strong>Genere:</strong> ${film.Genere}</p>
        <p><strong>Formato:</strong> ${film.Formato}</p>
        <p><strong>Box:</strong> ${film.Box}</p>
        <p><strong>Casa Filmografica:</strong> ${film["Casa Filmografica"]}</p>
        <p><strong>Edizione Video:</strong> ${film["Edizione Video"]}</p>
        <p><strong>Note:</strong> ${film.Note}</p>

        <img src="img/${film.Copertina}">
    `;

    // --- ASSEGNA CLASSE GENERE ---
    let classeGenere = film.Genere.toLowerCase().replace(/\s+/g, "");
    dettagli.classList.add(classeGenere);

    // --- MOSTRA LA SCHEDA CON FADE-IN ---
    dettagli.classList.add("show");

    // --- BOTTONE INDIETRO ---
    const backBtn = document.getElementById("back-btn");
    if (backBtn) {
        backBtn.addEventListener("click", () => {
            window.location.href = "index.html";
        });
    }
}


// ======================================================
// FUNZIONE: INIZIALIZZA INDEX
// ======================================================
function inizializzaIndex(films) {

    const lista = document.getElementById("film-list");
    const searchInput = document.getElementById("search-input");

    let filtroAttivo = "all";
    let ricercaAttiva = "";

    function aggiornaLista() {
        lista.innerHTML = "";

        films
            .filter(film => {

                // FILTRO FORMATO
                if (filtroAttivo === "bluray" && film.Formato !==
