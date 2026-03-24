// URL del tuo Google Sheet in formato CSV
const CSV_URL = "QUI_METTI_IL_TUO_LINK_CSV";

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
                    <img src="img/${film.Copertina}" 
                         style="width:100%; max-width:300px; border-radius:10px; display:block; margin:20px auto;">

                    <p><strong>Regia:</strong> ${film.Regia}</p>
                    <p><strong>Genere:</strong> ${film.Genere}</p>
                    <p><strong>Box:</strong> ${film.Box}</p>
                    <p><strong>Casa Filmografica:</strong> ${film["Casa Filmografica"]}</p>
                    <p><strong>Edizione Video:</strong> ${film["Edizione Video"]}</p>
                    <p><strong>Note:</strong> ${film.Note}</p>
                `;
            }

            document.getElementById("back-btn").addEventListener("click", () => {
                window.location.href = "index.html";
            });

            return;
        }

        // -------------------------
        // PAGINA INDEX
        // -------------------------
        const lista = document.getElementById("film-list");

        films.forEach(film => {
            const li = document.createElement("li");
            li.textContent = film.Titolo;
            li.addEventListener("click", () => {
                window.location.href = `film.html?titolo=${film.Titolo}`;
            });
            lista.appendChild(li);
        });
    });
