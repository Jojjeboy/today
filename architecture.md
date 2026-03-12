# Arkitekturöversikt - "Today" Appen

Välkommen! Denna guide är skriven för att hjälpa dig som junior utvecklare att snabbt komma in i kodbasen och förstå hur allting hänger ihop utan att behöva externa hjälpmedel.

## 1. Teknisk Stack
- **React (Vite)**: Frontend-ramverket.
- **TypeScript**: För typsäkerhet (viktigt! Kolla alltid `src/types/index.ts`).
- **Tailwind CSS**: För styling.
- **Firebase/Firestore**: För databas och realtidssynkronisering.
- **Vitest**: För enhetstester.

## 2. Projektstruktur
- `src/components/`: Alla UI-komponenter.
- `src/context/`: Globalt tillstånd (Hjärtat i appen).
- `src/hooks/`: Återanvändbar logik (t.ex. synkronisering med databasen).
- `src/types/`: Definitioner av objekt som `List` och `Item`.
- `src/utils/`: Hjälpfunktioner för t.ex. taggar.

## 3. Hur data flödar (State Management)
Vi använder **React Context** (`AppContext.tsx`) för att hantera appens tillstånd.
- All data om listor och todos hämtas och sparas via `AppContext`.
- Komponenter använder `useApp()`-hooken för att komma åt data och funktioner som `updateListItems`.

## 4. Synkronisering med Firestore (Viktigt!)
Appen är byggd för att fungera offline och synka när man får internet.
- **Map-baserad lagring**: Förut sparades alla todos i en array. Nu sparar vi dem i ett objekt (Map) i Firestore (`Record<string, Item>`). Detta för att förhindra att data skrivs över om två personer ändrar olika saker samtidigt offline.
- **Punkt-notation (Dot notation)**: När vi uppdaterar en todo skickar vi bara den specifika ändringen till Firestore (t.ex. `items.item_id_123: { text: "ny text" }`). Detta gör synken mycket stabilare.

## 5. UI & UX Funktioner
- **Taggar**: Vi extraherar taggar automatiskt från texten (t.ex. `#mat`). Se `src/utils/tags.ts`.
- **Keyboard Navigation**: Man kan navigera i listan med pil-tangenter och växla status med mellanslag.
- **PWA (Progressive Web App)**: Appen kan installeras på mobilen. När en ny version finns visas en ruta som frågar om man vill uppdatera. Detta styrs i `vite.config.ts`.

## 6. Bra att veta när du utvecklar
- **Validering**: Köra `npm run validate` ofta. Det kör både tester, linting (felkoll) och bygger projektet.
- **Längdbegränsning**: Alla todos har en maxgräns på 200 tecken. Detta kontrolleras både i UI-komponenter och defensivt i `AppContext`.
- **Auto-resizing**: Textrutorna växer automatiskt nedåt när man skriver mycket.

---
Lycka till! Om du fastnar, börja med att titta i `src/context/AppContext.tsx` – det är där de flesta stora besluten tas.
