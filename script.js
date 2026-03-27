// URL del tuo Google Sheet in formato CSV
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQvDWnpCmYlgbTD7v1qwrI1WyPbRt5Kbbg3S0ZAQzVRmpaQMgO2lfYJ7vlfmWy4HnOgSthCtHBVbTIR/pub?gid=1209283805&single=true&output=csv";

// Funzione per normalizzare il testo (rende la ricerca più intelligente)
function normalizza(testo) {
    return testo
        .toLowerCase()
        .normalize("NFD")               
        .replace(/[\u0300-\u036f]/g, "") 
        .replace(/['’]/g, "")            
        .replace(/\s+/g, " ")            
        .trim();
}

// Evidenziazione del testo trovato
function evidenzia(testo, query) {
    if (!query) return testo;

    let parole = query.split(" ").filter(p => p.length > 1);

    parole.forEach(parola => {
        let regex = new RegExp(`(${parola})`, "gi");
        testo = testo.replace(regex, "<mark>$1</mark>");
    });

    return testo;
}

fetch(CSV_URL)
    .then(response => response.text())
    .then(data => {
        const rows = data.split("\n").map(r => r.split(","));

        const headers = rows[0].map(h => h.trim());
        const films = rows.slice(1).map(row => {
            let obj = {};
            headers.forEach((h, i) => obj[h] = row[i] ? row[i].trim() : "");
            return obj;
        });

        const params = new URLSearchParams(window.location.search);
        const titoloSelezionato = params.get("titolo");

        // -------------------------
        // PAGINA FILM
        // -------------------------
        if (titoloSelezionato) {
            const film = films.find(f => f.Titolo === titoloSelezionato);

            if (film) {

                document.getElementById("film-details").innerHTML = `
                    <p><strong>Titolo:</strong> ${film.Titolo}</p>
                    <p><strong>Regia:</strong> ${film.Regia}</p>
                    <p><strong>Uscita:</strong> ${film.Uscita}</p>
                    <p><strong>Genere:</strong> ${film.Genere}</p>
                    <p><strong>Formato:</strong> ${film.Formato}</p>
                    <p><strong>Box:</strong> ${film.Box}</p>
                    <p><strong>Casa Filmografica:</strong> ${film["Casa Filmografica"]}</p>
                    <p><strong>Edizione Video:</strong> ${film["Edizione Video"]}</p>
                    <p><strong>Note:</strong> ${film.Note}</p>

                    <img src="img/${film.Copertina}" 
                         style="width:100%; max-width:300px; border-radius:10px; display:block; margin:20px auto;">
                `;

                // --- Assegna la classe in base al genere ---
                let genere = film.Genere;
                let classeGenere = normalizza(genere).replace(/\s+/g, "");
                document.getElementById("film-details").classList.add(classeGenere);

                document.getElementById("film-details").style.display = "block";
            }

            document.getElementById("back-btn").addEventListener("click", () => {
                window.location.href = "index.html";
            });

            return;
        }

        // -------------------------
        // PAGINA INDEX (lista film)
        // -------------------------
        const lista = document.getElementById("film-list");
        const searchInput = document.getElementById("search-input");

        let filtroAttivo = "all";   
        let ricercaAttiva = "";     

        function aggiornaLista() {
            lista.innerHTML = "";

            const query = normalizza(ricercaAttiva);
            const parole = query.split(" ").filter(p => p.length > 0);

            films
                .filter(film => {

                    // FILTRO FORMATO
                    if (filtroAttivo === "bluray" && film.Formato !== "Blu-Ray") return false;
                    if (filtroAttivo === "dvd" && film.Formato !== "DVD") return false;

                    // --- RICERCA INTELLIGENTE ---
                    const campi = normalizza(
                        film.Titolo + " " +
                        film.Regia + " " +
                        film.Genere + " " +
                        film.Formato + " " +
                        film.Box + " " +
                        film["Casa Filmografica"] + " " +
                        film["Edizione Video"] + " " +
                        film.Note
                    );

                    return parole.every(p => campi.includes(p));
                })
                .forEach(film => {

                    const li = document.createElement("li");

                    // 👉 AGGIUNGIAMO LA CLASSE DEL GENERE
                    li.classList.add(normalizza(film.Genere).replace(/\s+/g, ""));

                    // Evidenziazione del titolo
                    const titoloEvidenziato = evidenzia(film.Titolo, ricercaAttiva);

                    li.innerHTML = `
                        <strong>${titoloEvidenziato}</strong><br>
                        <span style="font-size:14px; color:#555;">
                            Formato: ${film.Formato} • Box: ${film.Box}
                        </span>
                    `;

                    li.addEventListener("click", () => {
                        window.location.href = `film.html?titolo=${film.Titolo}`;
                    });

                    lista.appendChild(li);
                });
        }

        aggiornaLista();

        // -------------------------
        // FILTRI MENU
        // -------------------------
        document.querySelectorAll("#menu button").forEach(btn => {
            btn.addEventListener("click", () => {
                filtroAttivo = btn.dataset.filter;
                aggiornaLista();
            });
        });

        // -------------------------
        // RICERCA
        // -------------------------
        if (searchInput) {
            searchInput.addEventListener("input", () => {
                ricercaAttiva = searchInput.value;
                aggiornaLista();
            });
        }
    });
