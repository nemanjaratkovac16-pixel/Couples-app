# Couples App

Aplikacija za dvoje: jedno nacrta nešto na telefonu, drugom stiže notifikacija sa slikom.

Statična web aplikacija (bez servera i bez Apple Developer računa). Instalira se na iPhone kao web aplikacija sa početnog ekrana. Notifikacije isporučuje besplatna aplikacija [ntfy](https://ntfy.sh).

## Kako radi
1. Crtež se u pregledniku pretvori u PNG (720×720).
2. Aplikacija ga pošalje (HTTP `PUT`) na temu `cpl-<kod>-<a|b>` na `ntfy.sh`.
3. Partner ima tu temu u ntfy aplikaciji i dobije notifikaciju sa slikom.
4. Rezervna opcija: dugme "Podijeli (iMessage)" otvara iOS Share Sheet.

Bez poziva trećih strana osim `ntfy.sh`. Postavke (ime, kod, uloga) ostaju samo u pregledniku.

## Postavljanje (jednom, oboje)
1. Otvori adresu aplikacije u Safariju → Dijeli → **Dodaj na početni ekran**.
2. Instaliraj **ntfy** iz App Storea i dozvoli notifikacije.
3. U aplikaciji otvori Postavke. Osoba A generiše kod, osoba B upisuje isti kod.
4. Jedno bira ulogu A, drugo B. U ntfy dodaj temu koju aplikacija prikaže (server `ntfy.sh`).
5. "Pošalji test sebi" provjerava da notifikacije stižu.

## Objava
Repozitorij je statičan sajt. Na Vercelu: **Add New → Project → uvezi ovaj repozitorij**, bez build komande i bez output foldera. Svaki push na `main` se objavljuje automatski.

## Poznata ograničenja (nisu potvrđena na stvarnom uređaju)
- Da li ntfy iOS aplikacija prikazuje sliku direktno u oblačiću na zaključanom ekranu zavisi od verzije aplikacije.
- Obrazac vibracije se ne može zadati; vrijedi postavka notifikacija na telefonu.
- Imena tema na javnom `ntfy.sh` su jedina zaštita. Kod mora ostati tajan. Moguć je prelazak na vlastiti ntfy server.
- Prilozi na javnom serveru imaju rok trajanja i ograničenja veličine.

## Lokalni razvoj
```
python3 -m http.server 8000
```
Otvori `http://localhost:8000`.
