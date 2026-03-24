// Carica il CSV da Google Sheets
fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vQ8Yp0p0xQe0l8x0p0p0p0p0p0p0p0p0p0p0p0p0p0p0p0p0p0p0p0/pub?output=csv')
    .then(response => response.text())
    .then(data => {
        const rows = data.split('\n').map(r => r.split(','));

        const headers = rows[0];
        const films = rows.slice(1).map(row => {
            let obj = {};
            headers.forEach((h, i) => obj[h.trim()] = row[i] ? row[i].trim() : "");
            return obj;
        });

        // Controlla se siamo nella pagina film.html
        const params = new URLSearchParams(window.location.search);
        const titoloSelezionato = params.get("titolo");

        if (titoloSelezionato) {
            // Siamo nella scheda film
            const film = films.find(f => f.Titolo === titoloSelezionato);

            if (film) {
                document.getElementById("film-title").textContent = film.Titolo;

                // Inserisce copertina + dettagli nello spazio grigio
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

            // Pulsante "Torna indietro"
            document.getElementById("back-btn").addEventListener("click", () => {
                window.location.href = "index.html";
            });

        } else {
            // Siamo nella pagina index.html → lista film
            const lista = document.getElementById("film-list");

            films.forEach(film => {
                const li = document.createElement("li");
                li.textContent = film.Titolo;
                li.addEventListener("click", () => {
                    window.location.href = `film.html?titolo=${film.Titolo}`;
                });
                lista.appendChild(li);
            });
        }
    });
