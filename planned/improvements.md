# Förbättringsbacklogg för Today

Detta dokument skiljer på funktionalitet som redan finns och idéer som fortfarande kan utvecklas.

## Implementerat

- Offline-first-synkronisering med Firebase och granulära item-uppdateringar.
- PWA med service worker och uppdateringsprompt.
- En aktiv lista med sektioner, drag-and-drop och deluppgifter.
- Prioriteter, datumigenkänning med Chrono och snooze-stöd.
- Taggar med `#namn`, autocomplete, färger, filtrering och global redigering.
- Historik, aktivitetslogg, statistik och import/export av data.
- Mörkt/ljust tema och svenska/engelska översättningar.
- Tester med Vitest och Testing Library samt obligatorisk `npm run validate`.

## Prioriterade förbättringar

### 1. Firestore-migrering för single-list
Den publika appmodellen använder `currentList`, men äldre data ligger fortfarande i `users/{uid}/lists`. Planera en säker, idempotent migrering till ett enda dokument eller behåll collection-formatet dokumenterat som kompatibilitetslager.

### 2. Bättre testtäckning
- Lägg till tester för `useTags` CRUD och offlinefel.
- Testa sektioner, deluppgifter, import/export och drag-and-drop.
- Minska befintliga `act(...)`-varningar i komponenttesterna.

### 3. Daglig planering
- Snooze till nästa dag med tydlig återkomst.
- Kvällsgenomgång för klara och kvarvarande items.
- Veckoöversikt över slutförda, uppskjutna och borttagna items.

### 4. Fokusläge
Visa endast aktuell toppuppgift och lägg till en enkel fokustimer utan att störa standardvyn.

### 5. Tillgänglighet
- Kontrollera tangentbordsflöden i alla modaler och menyer.
- Förbättra skärmläsartexter för drag-and-drop och statusändringar.
- Lägg till automatiserade tillgänglighetstester.

### 6. Prestanda och drift
- Dela upp den stora produktionsbundlen med lazy routes.
- Lägg till felrapportering för synkproblem utan att exponera användardata.
- Följ upp Firebase-läsningar och skrivningar för att hålla kvoten låg.

## Beroenden

- Uppdatera kompatibla patch- och minor-versioner regelbundet med `npm update`.
- Majoruppgraderingar av Vite, ESLint, Tailwind, Vitest och TypeScript ska göras separat med egna migrationskontroller.
- Kör alltid `npm run validate` efter dependency-uppdateringar.
