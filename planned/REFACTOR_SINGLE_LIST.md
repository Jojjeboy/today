# Plan: Refaktorera till Enkel Lista-App

## Mal
Appen ska ha ett tydligt single-list-kontrakt och behalla stod for items, sektioner, taggar, import och kalender.

## Genomforda andringar

### Context och datamodell
- `AppContext` exponerar `currentList: List | null` som primar listmodell.
- `defaultListId` och den publika `lists`-ytan ar borttagna fran context-kontraktet.
- List-, kategori-, arkiverings- och atkomstoperationer som hor till flerlistestod ar borttagna.
- Sektioner och taggoperationer anvander den aktuella listan utan `listId`-parametrar.

### Komponenter och routing
- `TodoListView`, `SettingsView`, `SearchResults`, `StatisticsView` och `TagFilterView` anvander `currentList`.
- Taggfiltervyn grupperar inte langre items per lista.
- Oanvanda `ListDetail`- och `SortableListCard`-komponenter samt deras gamla test har tagits bort.

### Firestore
- Den befintliga `users/{uid}/lists`-collectionen behalls for bakatkompatibilitet.
- Context valjer den forsta posten som `currentList`.
- En separat migrering till `users/{uid}/list` bor goras som ett eget dataflyttsarbete for att undvika dataforlust.

### Tester och validering
- Context- och komponenttester ar uppdaterade for `currentList`.
- `npm run validate` passerar med 47 tester.

## Kvarstaende arbete
- Manuell kontroll av befintliga anvandares data efter deploy.
- Eventuell separat Firestore-migrering fran collection till ett enda dokument.
