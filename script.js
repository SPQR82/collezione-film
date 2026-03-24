// URL del tuo Google Sheet in formato CSV
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQvDWnpCmYlgbTD7v1qwrI1WyPbRt5Kbbg3S0ZAQzVRmpaQMgO2lfYJ7vlfmWy4HnOgSthCtHBVbTIR/pub?gid=1209283805&single=true&output=csv";

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
                document.getElementById("film-title").textContent = film.Titolo;

                document.getElementById("film-details").innerHTML = `
                    <p><strong>Regia:</strong> ${film.Regia}</p>
                    <p><strong>Genere:</strong> ${film.Genere}</p>
                    <p><strong>Box:</strong> ${film.Box}</p>
                    <p><strong>Casa Filmografica:</strong> ${film["Casa Filmografica"]}</p>
                    <p><strong>Edizione Video:</strong> ${film["Edizione Video"]}</p>
                    <p><strong>Note:</strong> ${film.Note}</p>

                    <img src="img/${film.Copertina}" 
                         style="width:100%; max-width:300px; border-radius:10px; display:block; margin:20px auto;">
                `;
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

        function mostraLista(filtro = "all") {
            lista.innerHTML = "";

            films
                .filter(film => {
                    if (filtro === "all") return true;
                    if (filtro === "bluray") return film.Formato === "Blu-Ray";
                    if (filtro === "dvd") return film.Formato === "DVD";
                })
                .forEach(film => {
                    const li = document.createElement("li");
                    li.innerHTML =
                        <strong>${film.Titolo}</strong><br>
                        <span style="font-size:14px; color:#555;">
                             Uscita: ${film.Uscita} • Box: ${film.Box}
                        </span>
                ';
                    li.addEventListener("click", () => {
                        window.location.href = `film.html?titolo=${film.Titolo}`;
                    });
                    lista.appendChild(li);
                });
        }

        // Mostra tutti i film all'inizio
        mostraLista("all");

        // -------------------------
        // FILTRI MENU
        // -------------------------
        document.querySelectorAll("#menu button").forEach(btn => {
            btn.addEventListener("click", () => {
                const filtro = btn.dataset.filter;
                mostraLista(filtro);
            });
        });

        // -------------------------
        // RICERCA PER TITOLO / REGIA / GENERE
        // -------------------------
        const searchInput = document.getElementById("search-input");

        if (searchInput) {
            searchInput.addEventListener("input", () => {
                const query = searchInput.value.toLowerCase();

                lista.innerHTML = "";

                films
                    .filter(film =>
                        film.Titolo.toLowerCase().includes(query) ||
                        film.Regia.toLowerCase().includes(query) ||
                        film.Genere.toLowerCase().includes(query)
                    )
                    .forEach(film => {
                        const li = document.createElement("li");
                        li.textContent = film.Titolo;
                        li.addEventListener("click", () => {
                            window.location.href = `film.html?titolo=${film.Titolo}`;
                        });
                        lista.appendChild(li);
                    });
            });
        }
    });
