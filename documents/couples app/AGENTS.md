# AGENTS.md: pravila za agente u projektu Couples App

## Komunikacija
- Piši na bosanskom, strogo profesionalno, bez izvinjavanja i hvalospjeva.
- Prije tvrdnje o stanju (kod, uređaj, servis) provjeri. Ne pretpostavljaj.
- Šta je provjereno i šta nije, navedi odvojeno.

## Projekat
- Statična web aplikacija: `index.html`, `style.css`, `app.js`. Bez frameworka i bez build koraka.
- Jedini vanjski servis u kodu je `https://ntfy.sh`. Ne dodaj druge pozive trećih strana bez odluke vlasnika.
- Cilj je iPhone (Safari, aplikacija sa početnog ekrana). Provjeri promjene na širini oko 390 px.
- Zumiranje prstima mora ostati isključeno. Tekst i polja najmanje 16 px.

## Privatnost i sigurnost
- Ne upisuj u repozitorij stvarne kodove tema, tokene ni lične podatke.
- Zajednički kod se generiše u pregledniku i ostaje u `localStorage`.
- Ne dodaj praćenje, analitiku ni oglase.

## Radni tok
1. Promjena u `/home/user/couples-app` (ili u lokalnoj kopiji).
2. `node --check app.js`, pa kratki test u Chromiumu (Playwright) sa simuliranim `ntfy.sh`.
3. Commit na `main` sa jasnom porukom. Push pokreće objavu na Vercelu.
4. Ne stvaraj grane ni pull requestove osim na izričit zahtjev vlasnika.

## Granice
- Ne mijenjaj `vercel.json` i `manifest.webmanifest` bez razloga koji navedeš u commit poruci.
- Ako provjera na stvarnom iPhoneu nije moguća, to napiši, ne tvrdi da radi.
