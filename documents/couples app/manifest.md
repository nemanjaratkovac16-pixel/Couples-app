# Couples App: manifest

## Svrha
Dvoje ljudi, svako sa iPhoneom. Jedno nacrta nešto (npr. srce), drugom stiže notifikacija sa slikom.
Aplikacija je za internu upotrebu, ne objavljuje se na App Storeu.

## Stanje
- Verzija: prva radna verzija (statična web aplikacija).
- Hosting: Vercel (uvoz iz ovog repozitorija, objava na svaki push na `main`).
- Notifikacije: besplatna aplikacija ntfy (server `ntfy.sh`), bez Apple Developer računa.

## Arhitektura
Nema vlastitog servera. Stranica u pregledniku:
1. nacrta crtež na `<canvas>` (720×720),
2. pretvori ga u PNG,
3. pošalje HTTP `PUT` na `https://ntfy.sh/cpl-<kod>-<a|b>`,
4. partner ima tu temu u ntfy aplikaciji.

Rezervni put: iOS Share Sheet (`navigator.share` sa fajlom).

## Struktura repozitorija
| Fajl | Namjena |
|---|---|
| `index.html`, `style.css`, `app.js` | cijela aplikacija |
| `manifest.webmanifest`, `icon.svg`, `apple-touch-icon.png` | web aplikacija na početnom ekranu |
| `vercel.json` | zaglavlja i čisti URL-ovi |
| `documents/couples app/` | projektna dokumentacija (ovaj folder) |

## Odluke
- Bez frameworka i build koraka: statični fajlovi.
- Bez zumiranja prstima: `viewport` ograničenje, `touch-action: manipulation` i hvatanje `gesture*` događaja (iOS Safari ignoriše `user-scalable=no`). Tekst i polja su najmanje 16 px.
- Ime teme na ntfy.sh je jedina zaštita, pa je kod nasumičan (20 znakova) i tajan.

## Nepotvrđeno (provjeriti na stvarnim telefonima)
- Da ntfy.sh prihvata slanje iz preglednika (CORS, prilagođena zaglavlja).
- Da ntfy iOS aplikacija prikazuje sliku u oblačiću na zaključanom ekranu.
- Da Share Sheet nudi iMessage.
- Obrazac vibracije se ne može zadati.

## Moguća dalja nadogradnja
- Vlastiti ntfy server (privatnost, duži rok čuvanja priloga).
- Prikaz primljenih crteža unutar aplikacije.
