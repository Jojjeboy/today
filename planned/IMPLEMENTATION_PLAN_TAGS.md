# 🏷️ Tag System Implementation Plan

## Översikt
Detta dokument beskriver den fullständiga implementeringen av det globala tagg-systemet i Today-app.

---

## ✅ Slutförda Komponenter

### 1. Typer och Datamodeller
**Fil:** `src/types/index.ts`
- Lagt till `Tag`-interface
- Uppdaterat `Item`-interface med `tags?: string[]`

### 2. Hjälpfunktioner
**Fil:** `src/utils/tags.ts`
- `extractTagNamesFromText(text: string): string[]`
- `removeTagsFromText(text: string): string`
- `generateRandomColor(): string`
- 15 fördefinierade färger från Tailwind-paletten

### 3. Custom Hook
**Fil:** `src/hooks/useTags.ts`
- `allTags: Tag[]`
- `getTagById(tagId: string): Tag | null`
- `getTagByName(name: string): Tag | null`
- `createTag(name: string): Promise<Tag | null>`
- `updateTag(tagId: string, updates: Partial<Tag>): Promise<void>`
- `deleteTag(tagId: string): Promise<void>`
- Firebase synkronisering med `useFirestoreSync<Tag>('users/{uid}/tags', user?.uid)`

### 4. AppContext Utökning
**Fil:** `src/context/AppContext.tsx`
- `allTags: Tag[]`
- `getTagById: (tagId: string) => Tag | null`
- `getTagByName: (tagId: string) => Tag | null`
- `getItemsByTag(tagId: string)` - Returnerar alla items med specifik tagg
- `addTagToItem(listId, itemId, tagName)` - Lägger till tagg till item
- `removeTagFromItem(listId, itemId, tagId)` - Tar bort tagg från item
- `updateTagColor(tagId, color)` - Uppdaterar tagg-färg

---

## 🎯 Implementerade Funktioner

### 1. Auto-Tagg-Extrahering
- Trigger: Text som innehåller `#ord` (t.ex. "Köp mjölk #mat")
- Process: Extrahera tagg-namn → Skapa/hämta taggar → Länka till item

### 2. Tagg-Autocomplete
- Trigger: Skriv `#` i input-fält
- Visa befintliga taggar som matchar
- Skapa ny tagg om den inte finns

### 3. Färgstöd
- 15 fördefinierade färger
- Beständig färg per tagg
- Anpassningsbar av användare

### 4. Routing
- URL: `/tag/:tagId`
- Visa alla items med den specifika taggen

### 5. Tagg-Moln
- Visning i sidomenyn
- Sortering efter användningsfrekvens

---

## 📁 Filer som Ändrats

### Nya Filer
- `src/utils/tags.ts`
- `src/hooks/useTags.ts`
- `src/components/Tag.tsx`
- `src/components/TagCloud.tsx`
- `src/components/TagFilterView.tsx`

### Modifierade Filer
- `src/types/index.ts`
- `src/context/AppContext.tsx`
- `src/App.tsx`
- `src/components/SortableItem.tsx`
- `src/components/InlineAutocompleteInput.tsx`
- `src/components/TodoListView.tsx`
- `src/components/ListDetail.tsx`
- `src/components/Sidebar.tsx`
- `src/locales/sv.json`
- `src/locales/en.json`

---

## 🔧 TypeScript-Fixer

### 1. Konsistent Null-Hantering
- **Före:** `Tag | undefined`
- **Efter:** `Tag | null`
- Uppdaterade funktioner:
  - `useTags.ts`: `getTagById`, `getTagByName`, `createTag`
  - `AppContext.tsx`: `getTagById`, `getTagByName`

### 2. Callback-Signaturer
- **Före:** `onToggle={async () => {}}`
- **Efter:** `onToggle={async (id: string) => {}}`
- Matchar `SortableItemProps`-interface

### 3. Oanvända Importer
- Tog bort oanvänd `Tag`-import i `TagFilterView.tsx`

---

## 🧪 Testplan

### EnhetsTester
- [ ] `useTags.ts` - Testa alla funktioner
- [x] `utils/tags.ts` - Testa hjälpfunktioner
- [ ] `Tag.tsx` - Testa rendering
- [ ] `TagCloud.tsx` - Testa rendering och interaktion

### IntegrationsTester
- [ ] Tagg-extrahering i `TodoListView`
- [ ] Tagg-extrahering i `ListDetail`
- [ ] Tagg-autocomplete i `InlineAutocompleteInput`
- [ ] Tagg-visning i `SortableItem`
- [ ] Routing till `/tag/:tagId`

### Manuell Testning
- [ ] Skapa ny tagg via `#ord`
- [ ] Navigera till tagg-sida
- [ ] Ta bort tagg från item
- [ ] Ändra tagg-färg
- [ ] Offline-funktionalitet

---

## 🚀 Deployment Checklista

- [x] Alla typer definierade
- [x] Hjälpfunktioner implementerade
- [x] Custom hooks skapade
- [x] Kontext utökad
- [x] UI-komponenter skapade
- [x] Integration med befintliga komponenter
- [x] Routing konfigurerad
- [x] i18n översättningar lagda till
- [x] TypeScript-fel fixade
- [x] Validering passerad (`npm run validate`)
- [ ] Enhetstester skrivna
- [ ] Manuell testning utförd
- [ ] Version uppdaterad

---

## 📊 Arkitektur

```
Firebase (users/{uid}/tags)
    ↓
useFirestoreSync → useTags → AppContext
    ↓
UI Components (Tag, TagCloud, TagFilterView, SortableItem)
    ↓
Integration (TodoListView, ListDetail, Sidebar)
```

---

## 🎨 Design Beslut

- **Prefix:** `#` (t.ex. `#mat`, `#arbete`)
- **Färgpaletten:** 15 Tailwind CSS färger
- **Tagg-chip:** Liten, färgad, avrundad
- **Interaktion:** Klick på tagg → Navigera till tagg-sida

---

## 📝 Versionshistorik

| Version | Beskrivning |
|---------|-------------|
| 1.0.0 | Initial tagg-implementering |

---

## 🆘 Felsökning

### Vanliga Problem
1. **Taggar visas inte** → Kontrollera `tags`-fält i `Item`-interface
2. **Tagg-färger ändras** → Kontrollera `generateRandomColor` seed
3. **Autocomplete fungerar inte** → Kontrollera `#`-trigger
4. **Routing fungerar inte** → Kontrollera `/tag/:tagId`-rutt

---

## 🎉 Status

**Status:** ✅ COMPLETE (taggar på items implementerade och validerade)

**Nästa steg:**
1. Skriva fler komponent- och hooktester för taggar
2. Utföra manuell testning av offline-synk och färgbyte
3. Uppdatera version före eventuell commit