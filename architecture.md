# Fördjupad Arkitekturöversikt - "Today" Appen

Välkommen till den kompletta tekniska guiden för "Today". Detta dokument är framtaget för att du som junior utvecklare ska kunna förstå, underhålla och vidareutveckla appen utan extern hjälp.

---

## 📑 Innehållsförteckning
1. [Övergripande Filosofi](#övergripande-filosofi)
2. [Datamodell & Typer](#datamodell--typer)
3. [Globalt Tillstånd (State management)](#globalt-tillstånd)
4. [Synkronisering & Offline-stöd](#synkronisering--offline-stöd)
5. [Komponentarkitektur](#komponentarkitektur)
6. [Särskilda Funktioner (PWA, A11y)](#särskilda-funktioner)
7. [Utvecklingsflöde & Kvalitet](#utvecklingsflöde--kvalitet)

---

## 1. Övergripande Filosofi
"Today" är byggd med en **Offline-First** mentalitet. Det betyder att användaren aldrig ska behöva vänta på nätverket för att interagera med sina uppgifter. UI uppdateras omedelbart (optimistiskt), och synkronisering sker i bakgrunden.

---

## 2. Datamodell & Typer
All data definieras i [src/types/index.ts](/src/types/index.ts).

- **Item**: Representerar en enskild uppgift (id, text, completed status). Kan ha ett valfritt `parentId`-fält som pekar på en annan items `id` – i så fall är det en *deluppgift* (subtask). Hierarkin är alltid maxtvå nivåer djup (förälder → barn).
- **List**: En samling av Items, inklusive metadata som kategori och inställningar.
- **ListDB**: Den interna representationen som lagras i Firestore. Märk väl att `items` här lagras som en `Record<string, Item>` (en Map) istället för en array.

---

## 3. Globalt Tillstånd
Vi använder React Context för att undvika "prop drilling". 

### [AppContext.tsx](src/context/AppContext.tsx)
Detta är appens hjärna. Här hanteras:
- Inläsning av listor från Firestore.
- Exponering av funktioner som `updateListItems`, `deleteItem` och `updateListName`.
- **Viktigt**: AppContext konverterar den Map-baserade datan från databasen till arrayer (`Item[]`) som UI:t förväntar sig genom hjälp-gettern `listsWithArrayItems`.

---

## 4. Synkronisering & Offline-stöd
Synkroniseringen sköts via en custom hook: [useFirestoreSync.ts](src/hooks/useFirestoreSync.ts).

### Varför Map istället för Array?
I tidiga versioner användes arrayer för todos. Om två enheter redigerade varsin todo offline och sedan synkade, skrev den som synkade sist över den andras ändringar (hela arrayen ersattes). 
Genom att använda en **Map** och **dot notation** (punkt-notation), kan vi skicka kommandon som: 
*"Uppdatera bara fältet items.abc_123"*
Detta gör att flera användare/enheter kan redigera olika todos samtidigt utan konflikter.

### Granulära uppdateringar
Se funktionen `updateListItems` i `AppContext.tsx`. Den beräknar exakt vilka rader som ändrats och skickar bara de specifika fälten till Firebase med `{ merge: true }`.

---

## 5. Komponentarkitektur
Vi använder en modulär struktur med fokus på återanvändbarhet.

- **[TodoListView.tsx](src/components/TodoListView.tsx)**: Huvudvyn för den dagliga listan. Hanterar filtrering på taggar och sortering. Filtrerar ut `parentId`-satta items ur den draggbara listan och skickar dem som `subtasks` till respektive förälder-`SortableItem`. Hanterar `handleAddSubtask` som skapar ett nytt Item med `parentId` satt.
- **[SortableItem.tsx](src/components/SortableItem.tsx)**: Representerar en rad i listan. Innehåller logik för swipe-to-delete, editering och keyboard-navigering. Renderar en inbäddad `SubtaskRow`-lista (indragen med vänsterkant) för sina barn. En `ListTree`-knapp triggar `onAddSubtask` – synlig på hover (desktop) eller alltid (mobil via Tailwind `sm:opacity-0`).
- **[InlineAutocompleteInput.tsx](src/components/InlineAutocompleteInput.tsx)**: En smart textruta som föreslår ord baserat på historik och hanterar taggar.

---

## 6. Särskilda Funktioner

### Keyboard Navigation (Accessibility)
För att göra appen snabb för "power users" har vi byggt in tangentbordsstöd i `SortableItem.tsx`:
- `ArrowUp` / `ArrowDown`: Flyttar fokus mellan rader.
- `Space`: Markerar som klar/oklar.
- `Enter`: Startar editering.

### PWA & Service Workers
Inställningarna finns i [vite.config.ts](vite.config.ts). Vi använder strategin `prompt`. Det betyder att om en ny version av appen släpps, får användaren en fråga om de vill ladda om. Detta förhindrar att de tappar data mitt i en ändring.

---

## 7. Utvecklingsflöde & Kvalitet

### Validering
Innan du pushar kod bör du köra:
```bash
npm run validate
```
Detta kör:
1. `tsc`: Typtestning.
2. `vite build`: Ser till att projektet går att bygga.
3. `eslint`: Kontrollerar kodstil och vanliga buggar.
4. `vitest`: Kör alla enhetstester.

### Enhetstester
Testerna ligger bredvid källkoden (t.ex. `AppContext.test.tsx`). Vi strävar efter hög kodtäckning för att garantera att synk-logiken inte går sönder vid refactoring.

---

*Detta dokument underhålls manuellt. Vid stora arkitektoniska ändringar, vänligen uppdatera motsvarande sektion.*
