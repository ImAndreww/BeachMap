# 🌊 BeachMap

Aplicație web pentru explorarea plajelor lumii, cu hartă Google Maps și certificări Blue Flag.

## Structura aplicației

```
Regiuni mondiale (Europa, Asia, ...)
  └── Țări (România, Grecia, ...)
        └── Regiuni / Județe (Dobrogea, ...)
              └── Orașe / Stațiuni (Mamaia, Constanța, ...)
                    └── Plaje (Plaja Modern, ...) [Blue Flag ✓/✗]
```

---

## Setup pas cu pas

### 1. Supabase (baza de date)
1. Mergi la [supabase.com](https://supabase.com) și creează un cont gratuit
2. Creează un proiect nou
3. Din meniu → **SQL Editor** → **New Query**
4. Copiază tot conținutul din `supabase-schema.sql` și rulează
5. Din **Project Settings → API** copiază:
   - `Project URL`
   - `anon public key`

### 2. Google Maps API
1. Mergi la [console.cloud.google.com](https://console.cloud.google.com)
2. Creează un proiect nou
3. Activează **Maps JavaScript API**
4. Creează o cheie API (din **Credentials**)
5. Restricționeaz-o la domeniul tău (opțional dar recomandat)

### 3. Configurare locală
```bash
# Clonează repo-ul
git clone https://github.com/USER/beachmap.git
cd beachmap

# Instalează dependențele
npm install

# Creează fișierul de configurare
cp .env.local.example .env.local
# Editează .env.local cu cheile tale

# Pornește serverul de dezvoltare
npm run dev
```

Deschide [http://localhost:3000](http://localhost:3000)

### 4. Creează contul de admin în Supabase
1. Din Supabase → **Authentication → Users → Add User**
2. Introdu emailul și parola ta
3. Accesează `/login` pe site și autentifică-te

### 5. Deploy pe Vercel
1. Mergi la [vercel.com](https://vercel.com) și conectează contul GitHub
2. Importă repository-ul `beachmap`
3. În **Environment Variables** adaugă:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
4. Apasă **Deploy** — gata! 🎉

---

## Pagini

| URL | Descriere |
|-----|-----------|
| `/` | Pagina principală cu regiunile mondiale |
| `/explore/europa` | Țările din Europa |
| `/explore/europa/romania` | Regiunile din România |
| `/explore/europa/romania/dobrogea` | Orașele din Dobrogea |
| `/explore/europa/romania/dobrogea/mamaia` | Plajele din Mamaia cu hartă |
| `/login` | Autentificare admin |
| `/admin` | Panou de administrare (doar tu) |

---

## Tech stack

- **Next.js 14** — framework React
- **Supabase** — bază de date PostgreSQL + autentificare
- **Google Maps JavaScript API** — hartă interactivă
- **Tailwind CSS** — stilizare
- **Vercel** — hosting
