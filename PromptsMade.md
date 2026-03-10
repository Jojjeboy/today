# Prompts Made

Here is a sequential history of the prompts made during the development of this application.

## 1. Initial Project Request

**Date:** 2025-11-21

> Jag vill bygga en progressive web app som jag ska kunna spara ner till min telefon, den behöver vara mobile first. Lagring kan ske i localstorage. Den har till syfte att skapa listor som jag återanvänder. Det skulle kunna vara en lista för att komma ihåg vad jag ska ta med till jobbet. Det skulle också kunna vara en lista för att komma ihåg vad jag ska packa när jag går till gymmet eller vad jag ska fixa inför en långrunda när jag går ut och springer osv osv. Viktig funktion på varje lista är att jag ska kunna: 1. Lägga till och ta bort nya punkter, bocka av varje punkt, redigera befintliga punkter, dra och släppa varje punkt upp och ner. Också viktigt att kunna via en knapp kunna avbocka alla så att alla punkter i listan nollställs. Listor ska grupperas in i kategorier så som Jobb, Privat, Resor osv osv. Man ska kunna ta bort och lägga till kategorier. Tar man bort en kategori, tas även listan/listorna i kategorin bort. Listor ska kunna flyttas mellan kategorier. Listor ska också kunna kopieras och få samma namn men med (kopia) tillagt i namnet. Jag vill ha ett modernt utseende och helst använda tailwind CSS. Det Lightmode ska vara default men man ska även kunna toggla till Darkmode. Jag vill att utssendet liknar utseendet i denna demon https://www.youtube.com/watch?v=L8wEC6A5HQY
> Sen vill jag också att applikationen dokumenteras i en markdownfil, så om jag behöver justera någonstans vet vart de olika delarna har till syfte. Spara denna prompt i markdown dokumentationen också

## 2. Fix Dark Mode

**Date:** 2025-11-21

> Fixing Dark Mode Theme (The user wants the dark mode to correctly apply to the UI when toggled, and vice versa for light mode.)

## 3. Branding & Titles

**Date:** 2025-11-21

> I want a new colorful favicon that that represent a checkbox that is checked, also update the Page title to 'BuyMilk' and on a specific Category page, print 'BuyMilk - <category>' And on List page print out 'BuyMilk <List>'

## 4. Header Update

**Date:** 2025-11-21

> Change the <h1> where it now says ListApp to match the page title, but keep the style of the text

## 5. Logo in Header

**Date:** 2025-11-21

> Add the favicon as an logo that preceeds the <h1> title in the header

## 6. Clickable Header

**Date:** 2025-11-21

> And make the logo and the h1 is clickable so when clicked it takes the user back to first default route/page

## 7. Smart Copy Logic

**Date:** 2025-11-21

> Update a small thing, when the user copies a list, lets say it's called List, have it say List kopia 1. If the user copies the original list or the "List kopia 1" call the next version "List kopia 2" and so forth, do you understand?

## 8. Custom Modal

**Date:** 2025-11-21

> When a confirmation is prompted to the user in the app, lets build something more refined than a normal javascript confirm. Is the a component in tailwind css we can use. Like the one found here - https://tailwindcss.com/plus/ui-blocks/application-ui/overlays/modal-dialogs

## 9. Prompt History

**Date:** 2025-11-21

> Lägg till en PromptsMade.md och lägg till alla promptar jag har gjort sekventiellt så att det finns en historik på vad jag har promptat.

## 10. Auto Theme Request

**Date:** 2025-11-21

> Om det är möjligt vill jag att du först gör research på när solen går upp och ner där användaren är när applikationen startar, webbläsaren får kanske fråga om tillåtelse för att använda platsdata. Om användaren svarar ja på den frågan så applicera light mode om det är när solen är uppe och om det är efter solens ned gång men innna solens uppgång så applicera darkmode

## 11. Git Init

**Date:** 2025-11-21

> initial a git repo in the project folder

## 12. Git Remote

**Date:** 2025-11-21

> add following remote for the git repo: https://github.com/Jojjeboy/buymilk.git

## 13. Git Status

**Date:** 2025-11-21

> Är allt comittat?

## 14. Git Push

**Date:** 2025-11-21

> Run: git push -u origin

## 15. Roadmap Feature

**Date:** 2025-11-21

> Lägg till en sida i applikationen där jag kan lägga in anteckningar på funktionalitet jag vill lägga till i denna applikationen. Anteckningarna ska först listas under routen /route. Lista i en accordion och när man fäller ut den så kan man läsa innehållet och sen kan man klicka in på varje anteckning och redigera om man vill. Man ska kunna ta bort anteckningen om man vill. Fortsätt med sparningen i local storage

## 16. Timestamps & Commit

**Date:** 2025-11-21

> När du är klar med det, uppdatera PromptsMade.md med datum och tidsstämpel för varje prompt som är gjord och lägg alltid in det i framtiden. När du är klar lägg en comit och pusha koden.

## 17. Git Status

**Date:** 2025-11-21

> git status

## 18. Commit and Push

**Date:** 2025-11-21

> Commit and push all code

## 19. Publish Inquiry

**Date:** 2025-11-21

> Can i publish this app somewhere?

## 20. Move Roadmap Link

**Date:** 2025-11-21

> Lägg roadmap länken i footer istället

## 21. Last Updated Footer

**Date:** 2025-11-21

> Add a small text in the footer where it says, 'Senast uppdaterad:' followed by a time and date for the last time the code was updated

## 22. Footer Styling

**Date:** 2025-11-21

> Put it under the Roadmap & Notes link, make the text small but visible

## 23. Persist Theme

**Date:** 2025-11-21

> Save current Light/Dark mode in localstorage so if you update the webpage its remains the same

## 24. Rename to Notes

**Date:** 2025-11-21

## 26. Feature Suggestions

**Date:** 2025-11-21

> Is there any ideas or suggestions you can provide that would make the app more usefull and better based upon similar apps?

## 27. Implement Suggestions

**Date:** 2025-11-21

> Perfect implement all of the above. Step by step, make a git commit after each suggested functionality and continue to the next functionality, let me know after each step

## 28. Build and Fix

**Date:** 2025-11-22

> Try to build the code and fix it if is broken
