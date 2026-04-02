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

                let genere = film.Genere;
                let classeGenere = normalizza(genere).replace(/\s+/g, "");
                document.getElementById("film-details").classList.add(classeGenere);

                document.getElementById("film-details").style.display = "block";
            }

            // TORNA INDIETRO
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
            let parole = query.split(" ").filter(p => p.length > 0);

            films
                .filter(film => {

                    // FILTRO FORMATO
                    if (filtroAttivo === "bluray" && film.Formato !== "Blu-Ray") return false;
                    if (filtroAttivo === "dvd" && film.Formato !== "DVD") return false;

                    // -------------------------
                    // 🔥 RICERCA INTELLIGENTE UNIVERSALE
                    // -------------------------
                    let campi = normalizza(
                        film.Titolo + " " +
                        film.Regia + " " +
                        film.Genere + " " +
                        film.Formato + " " +
                        film.Box + " " +
                        film["Casa Filmografica"] + " " +
                        film["Edizione Video"] + " " +
                        film.Note
                    );

                    campi += " " + normalizza(film.Titolo).split(" ").join(" ");
                    campi += " " + normalizza(film.Titolo.replace(/^(il|lo|la|i|gli|le|the)\s+/i, ""));
                    campi += " " + normalizza(film.Titolo.replace(/[^a-zA-Z0-9 ]/g, ""));
                    campi += " " + normalizza(film.Titolo.split(" ").reverse().join(" "));

                    return parole.every(p => campi.includes(p));
                })
                .forEach(film => {

                    const li = document.createElement("li");

                    if (film.Genere && film.Genere.trim() !== "") {
                        const classeGenere = normalizza(film.Genere).replace(/\s+/g, "");
                        li.classList.add(classeGenere);
                    }

                    const titoloEvidenziato = evidenzia(film.Titolo, ricercaAttiva);

                    // -------------------------
                    // ⭐ SOLO ICONA (soluzione B)
                    // -------------------------
                    let iconaFormato = "";

                    if (film.Formato === "DVD") {
                        iconaFormato = `<img src="img/icons/dvd.png" class="icon-formato" alt="DVD">`;
                    } else if (film.Formato === "Blu-Ray" || film.Formato === "Blu-ray") {
                        iconaFormato = `<img src="img/icons/bluray.png" class="icon-formato" alt="Blu-ray">`;
                    }

                    li.innerHTML = `
                        <strong>${titoloEvidenziato}</strong><br>
                        <span style="font-size:14px; color:#555; display:flex; align-items:center; gap:6px;">
                            ${iconaFormato}
                            • Box: ${film.Box}
                        </span>
                    `;

                    // SALVA POSIZIONE SCROLL PRIMA DI APRIRE IL FILM
                    li.addEventListener("click", () => {
                        localStorage.setItem("scrollPos", window.scrollY);
                        window.location.href = `film.html?titolo=${film.Titolo}`;
                    });

                    lista.appendChild(li);
                });
        }

        aggiornaLista();

        // RIPRISTINA POSIZIONE SCROLL
        const savedScroll = localStorage.getItem("scrollPos");
        if (savedScroll !== null) {
            window.scrollTo(0, parseInt(savedScroll));
            localStorage.removeItem("scrollPos");
        }

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

        // -------------------------
        // PULSANTE TORNA SU
        // -------------------------
        const backToTop = document.getElementById("back-to-top");

        window.addEventListener("scroll", () => {
            if (window.scrollY > 1) {
                backToTop.style.opacity = "1";
                backToTop.style.pointerEvents = "auto";
            } else {
                backToTop.style.opacity = "0";
                backToTop.style.pointerEvents = "none";
            }
        });

        backToTop.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });

    });
