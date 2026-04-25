# CMMS System — Changelog

## Session: 2026-04-25 — Phase 1 Security Sprint

### Pregled
Neovisna arhitektonska procjena i implementacija kritičnih sigurnosnih poboljšanja.

### Promjene

#### 1. Helmet middleware (app.ts)
- Dodан `helmet` middleware kao prvi middleware u lancu
- Dodaje sigurnosne HTTP headere na sve odgovore
- Štiti od XSS, clickjacking i drugih web napada

#### 2. Rate limiting na auth rutama (app.ts)
- Dodан `express-rate-limit` na `/api/auth/*` rute
- Max 20 zahtjeva u 15 minuta po IP adresi
- Štiti od brute-force napada na login

#### 3. Demo endpoint zaštita (app.ts)
- `/api/demo/delete-all-tickets` sada vraća 404 u produkciji
- Samo dostupno u development okruženju
- Spriječava brisanje podataka od neautoriziranih korisnika

#### 4. Redis session store (session-manager.ts)
- Zamijenjen in-memory Map s Redis store (ioredis)
- Sessioni preživljavaju restart backend servisa
- Redis servis dodan na Railway
- REDIS_URL environment varijabla dodana u backend servis
- Async/await dodan u auth.middleware.ts i auth-service.ts

#### 5. Company scope filter (ticket i work-order servisi)
- `listTickets` sada uvijek filtrira po `companyId` iz sessije
- `listWorkOrders` sada uvijek filtrira po `companyId` iz sessije
- Firma A ne može vidjeti podatke Firme B
- Preduvjet za multi-tenant SaaS model

#### 6. CSRF zaštita (client.ts i client.js)
- Dodан `x-requested-with: XMLHttpRequest` header na sve API zahtjeve
- Štiti od Cross-Site Request Forgery napada
- Kompatibilno s iOS/Safari cross-site cookie handling

#### 7. Gate autentikacija aktivirana
- GATE_USERNAME i GATE_PASSWORD postavljeni na Railway
- Gate login ekran prikazuje se prije demo logina
- Neautorizirani pristup blokiran

### Novi paketi
- `helmet` ^8.1.0
- `express-rate-limit` ^8.4.1
- `ioredis` ^5.10.1

### Environment varijable dodane na Railway
- `REDIS_URL` — linked iz Redis servisa
- `GATE_USERNAME` — gate korisničko ime
- `GATE_PASSWORD` — gate lozinka

### Poznati TODO (sljedeća sesija)
- [ ] CSRF middleware na backendu (validacija x-requested-with headera)
- [ ] SESSION_SECRET provjera pri startu aplikacije
- [ ] Attachment upload MIME type validacija
- [ ] Sentry error tracking
- [ ] Email notifikacije (Resend)
- [ ] Cookie hardening kad se postavi custom domena (sameSite: strict)
- [ ] Obrisati stari phase-1-security branch na GitHubu

### Arhitektonske odluke
- Redis odabran umjesto express-session zbog jednostavnosti i direktne kontrole
- CSRF zaštita kroz custom header umjesto sameSite:strict zbog iOS/Safari kompatibilnosti
- Gate auth aktiviran kroz environment varijable — nema code promjena
- Company scope filter dodan samo na list endpointe — get by ID još nije pokriven

### Tehnički dug identificiran
- TS i JS duplikati u frontend stablu (client.ts i client.js, EntryScreen.tsx i .js)
- Hardcoded company name uklonjen iz users/internal endpointa
- Demo endpoint još postoji u kodu ali je zaštićen environment checkom
