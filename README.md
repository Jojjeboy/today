# Today

En snabb, offline-first "progressive web application" (PWA) för uppgiftshantering, designad med fokus på enkelhet och flow.

## Funktioner

- **PWA (Installationsbar)**: Kan installeras på Android, iOS och datorer för en plattformsoberoende och app-liknande upplevelse. Hanterar offline-lägen fullt ut via Service Workers.
- **Offline First**: Alla uppgifter synkas lokalt först och i bakgrunden mot Firebase när en nätverksuppkoppling finns, vilket garanterar att appen alltid fungerar oavsett täckning.
- **Dra och Släpp (Drag & Drop)**: Sortera och prioritera dina uppgifter enkelt genom att dra dem dit du vill ha dem.
- **Deluppgifter (Subtasks)**: Klicka på deluppgiftsknappen på valfritt listobjekt för att skapa hierarkiska underuppgifter. Stöds på både mobil och desktop.
- **Aktivitetslogg & Statistik**: Håll koll på vad du har åstadkommit över tid och få insikter i din produktivitet.
- **Dark/Light Mode**: Ett visuellt tilltalande gränssnitt byggt med Tailwind CSS som automatiskt respekterar ditt systems färginställningar.
- **Flerspråkigt (i18n)**: Stöd för flera språk direkt samt enkelt att skala upp med fler språk.
- **Import/Export av Data**: Säkerhetskopiera eller återställ dina uppgifter utan problem via JSON-filer.

## Kom Igång

Följ dessa steg för att sätta upp utvecklingsmiljön:

### Förkrav

- [Node.js](https://nodejs.org/) (v18 eller nyare rekommenderas)
- `npm` (installeras automatiskt tillsammans med Node.js)
- Ett Firebase-projekt inställt för databashantering och autentisering

### Installation

1. Installera alla beroenden:
   ```bash
   npm install
   ```

2. Miljövariabler (Environment Variables):
   Kopiera `.env.example` (eller motsvarande mall) till en fil som heter `.env` och fyll i dina Firebase API-nycklar.

### Tillgängliga Scripts

- `npm run dev`: Startar Vites lokala utvecklingsserver.
- `npm run build`: Typtestar (TypeScript) koden och bygger en produktionsoptimerad bundle i mappen `dist/`.
- `npm run preview`: Startar en lokal webbserver för att testa produktionsbygget från `dist/`.
- `npm run test`: Kör enhetstester med Vitest och genererar en täckningsrapport.
- `npm run lint`: Kör ESLint för att hitta syntax- och formateringsproblem.
- `npm run validate`: En samlingskontroll som säkerställer att kod, byggen och tester godkänns innan ev. push/commit.

---

## Uppdatera ikoner och logotyp

Appen har inbyggd logik för att snabbt kunna byta ut all branding (Favicon, Apple Touch Icon och PWA-ikoner) med ett enda kommando ifall du vill byta utseende framöver.

1. Ta din nya högupplösta logotyp (gärna 1024x1024 pixlar med transparent bakgrund) och spara den som:
   `public/logo-source.png`
   *(Om filen inte finns, spara helt enkelt din nya logo över det befintliga namnet)*

2. Kör kodgeneratorn i din terminal:
   ```bash
   npm run generate-assets
   ```

Skriptet (som använder bildbehandlingsbiblioteket `sharp`) kommer automatiskt att generera och skriva över alla ikoner (`favicon.png`, `icon-192.png`, `icon-512.png` och `apple-touch-icon.png`) i rätt format och med anpassad bakgrund för till exempel iOS. När bygget (`npm run build`) sedan görs tar VitePWA över och sköter resten.

---

## Arkitektur & Dokumentation

För en djupare genomgång av hur appen är uppbyggd tekniskt, se vår **[Arkitekturöversikt (Svenska)](file:///c:/kod/today/architecture.md)**. Denna guide är särskilt framtagen för att hjälpa nya utvecklare att snabbt förstå systemets hjärna och dataflöden.

## Teknisk Stack

Detta projekt använder moderna webbstandarder och verktyg:
- **React 19** tillsammans med TypeScript
- **Vite** för blixtsnabb bundling och utvecklingsmiljö
- **Tailwind CSS** för lättskriven och flexibel responsiv design
- **Firebase** för backend, synkning och användarautentisering
- **Zustand / Context** för lätthanterlig och effektiv state management
- **Vite-Plugin-PWA** för auto-generering av Service Workers och PWA-manifest
- **Vitest** för testning

## Bidra

Vänligen se till att körningarna för typtestning, linter och tester passerar grönt innan kod commits laddas upp:
```bash
npm run validate
```

## Licens

MIT License.
