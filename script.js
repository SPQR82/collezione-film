const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQvDWnpCmYlgbTD7v1qwrI1WyPbRt5Kbbg3S0ZAQzVRmpaQMgO2lfYJ7vlfmWy4HnOgSthCtHBVbTIR/pub?gid=1209283805&single=true&output=csv";

let films = [];

/* --- PARSER CSV UNIVERSALE --- */
function parseCSV(text) {
    const rows = text
        .split(/\r?\n/)
        .map(r => r.split(/;(?=(?:[^"]*"[^"]*")*[^"]*$)|,(?=(?:[^"]*"[^"]*")*[^"]*$)/));

    const headers = rows[0].map(h => h.trim().replace(/^"|"$/g, ""));

    return rows.slice(1).map(row => {
        let obj = {};
        headers.forEach((h, i) => {
            obj[h] = row[i] ? row[i].trim().replace(/^"|"$/g, "") : "";
        });
        return obj;
    });
}

/* --- CARICA CSV --- */
async function loadCSV() {
    const response = await fetch(CSV_URL);
    const text = await response.text();
    films = parseCSV(text);
}

/* --- LISTA FILM --- */
async function initListPage() {
    await loadCSV();

    const list = document.getElementById("film-list");
    const search = document.getElementById("search");
    const buttons = document.querySelectorAll(".filter-btn");

    let currentFilter = "Tutti";

    function render() {
        const query = search.value.toLowerCase();
        list.innerHTML = "";

        films
            .filter(f => currentFilter === "Tutti" || f.Formato === currentFilter)
            .filter(f =>
                f.Titolo.toLowerCase().includes(query) ||
                f.Regia.toLowerCase().includes(query) ||
                f.Genere.toLowerCase().split(/[\s,\/]+/).includes(query) ||
                f.Box.toLowerCase().includes(query) ||
                f["Casa Filmografica"].toLowerCase().includes(query) ||
                f["Edizione Video"].toLowerCase().includes(query) ||
                f.Note.toLowerCase().includes(query)
            )
            .forEach(f => {
                const li = document.createElement("li");
                li.innerHTML = `<a href="film.html?id=${f.ID}&from=${currentFilter}">${f.Titolo}</a>`;
                list.appendChild(li);
            });
    }

    search.addEventListener("input", render);

    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            currentFilter = btn.dataset.format;
            render();
        });
    });

    render();
}

/* --- PAGINA DETTAGLI FILM --- */
async function initFilmPage() {
    await loadCSV();

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const from = params.get("from") || "Tutti";

    const film = films.find(f => f.ID === id);

    document.getElementById("film-title").textContent = film.Titolo;

    const details = document.getElementById("film-details");
    details.innerHTML = `
        <p><strong>Formato:</strong> ${film.Formato}</p>
        <p><strong>Regia:</strong> ${film.Regia}</p>
        <p><strong>Casa Filmografica:</strong> ${film["Casa Filmografica"]}</p>
        <p><strong>Uscita:</strong> ${film.Uscita}</p>
        <p><strong>Genere:</strong> ${film.Genere}</p>
        <p><strong>Box:</strong> ${film.Box}</p>
        <p><strong>Edizione Video:</strong> ${film["Edizione Video"]}</p>
        <p><strong>Note:</strong> ${film.Note}</p>
    `;

    document.getElementById("back-btn").addEventListener("click", () => {
        window.location.href = `index.html#${from}`;
    });
}

/* --- AVVIO --- */
if (document.getElementById("film-list")) initListPage();
if (document.getElementById("film-details")) initFilmPage();
