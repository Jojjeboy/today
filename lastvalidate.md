# Validation Output (2026-03-12T05:47:58.666Z)

```bash

> today@1.0.0 build:only
> tsc -b && vite build

[36mvite v7.3.1 [32mbuilding client environment for production...[36m[39m
transforming...
[32m✓[39m 2469 modules transformed.
rendering chunks...
computing gzip size...
[2mdist/[22m[32mmanifest.webmanifest                        [39m[1m[2m    0.49 kB[22m[1m[22m
[2mdist/[22m[32mindex.html                                  [39m[1m[2m    0.68 kB[22m[1m[22m[2m │ gzip:   0.38 kB[22m
[2mdist/[22m[35massets/index-8NDt_5wi.css                   [39m[1m[2m   55.39 kB[22m[1m[22m[2m │ gzip:   9.04 kB[22m
[2mdist/[22m[36massets/workbox-window.prod.es5-BIl4cyR9.js  [39m[1m[2m    5.76 kB[22m[1m[22m[2m │ gzip:   2.37 kB[22m
[2mdist/[22m[36massets/index-lMN6uqRQ.js                    [39m[1m[33m1,301.32 kB[39m[22m[2m │ gzip: 398.73 kB[22m
[33m
(!) Some chunks are larger than 1300 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.[39m
[32m✓ built in 9.87s[39m

PWA v1.2.0
mode      generateSW
precache  8 entries (1331.19 KiB)
files generated
  dist/sw.js
  dist/workbox-1ef09536.js

> today@1.0.0 lint
> eslint .


> today@1.0.0 check-any
> eslint . --config eslint.strict.config.ts


> today@1.0.0 check-any
> eslint . --config eslint.strict.config.ts


> today@1.0.0 test
> vitest run --coverage


> today@1.0.0 test
> vitest run --coverage


[1m[46m RUN [49m[22m [36mv4.0.18 [39m[90mC:/kod/today[39m
      [2mCoverage enabled with [22m[33mv8[39m


[1m[46m RUN [49m[22m [36mv4.0.18 [39m[90mC:/kod/today[39m
      [2mCoverage enabled with [22m[33mv8[39m

 [32m✓[39m src/utils/tags.test.ts [2m([22m[2m8 tests[22m[2m)[22m[32m 6[2mms[22m[39m
 [32m✓[39m src/utils/tags.test.ts [2m([22m[2m8 tests[22m[2m)[22m[32m 6[2mms[22m[39m
[90mstderr[2m | src/hooks/useFirestoreSync.test.ts[2m > [22m[2museFirestoreSync[2m > [22m[2mshould handle snapshot errors
[22m[39mFirestore sync error for users/test-user-id/test-collection: Error: Firestore error
    at C:/kod/today/src/hooks/useFirestoreSync.test.ts:102:27
    at [90mfile:///C:/kod/today/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:145:11
    at [90mfile:///C:/kod/today/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:915:26
    at [90mfile:///C:/kod/today/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:1243:20
    at new Promise (<anonymous>)
    at runWithTimeout [90m(file:///C:/kod/today/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:1209:10[90m)[39m
    at [90mfile:///C:/kod/today/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:1653:37
    at Traces.$ [90m(file:///C:/kod/today/[39mnode_modules/[4mvitest[24m/dist/chunks/traces.CCmnQaNT.js:142:27[90m)[39m
    at trace [90m(file:///C:/kod/today/[39mnode_modules/[4mvitest[24m/dist/chunks/test.B8ej_ZHS.js:239:21[90m)[39m
    at runTest [90m(file:///C:/kod/today/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:1653:12[90m)[39m

[90mstderr[2m | src/hooks/useFirestoreSync.test.ts[2m > [22m[2museFirestoreSync[2m > [22m[2mshould handle snapshot errors
[22m[39mFirestore sync error for users/test-user-id/test-collection: Error: Firestore error
    at C:/kod/today/src/hooks/useFirestoreSync.test.ts:102:27
    at [90mfile:///C:/kod/today/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:145:11
    at [90mfile:///C:/kod/today/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:915:26
    at [90mfile:///C:/kod/today/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:1243:20
    at new Promise (<anonymous>)
    at runWithTimeout [90m(file:///C:/kod/today/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:1209:10[90m)[39m
    at [90mfile:///C:/kod/today/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:1653:37
    at Traces.$ [90m(file:///C:/kod/today/[39mnode_modules/[4mvitest[24m/dist/chunks/traces.CCmnQaNT.js:142:27[90m)[39m
    at trace [90m(file:///C:/kod/today/[39mnode_modules/[4mvitest[24m/dist/chunks/test.B8ej_ZHS.js:239:21[90m)[39m
    at runTest [90m(file:///C:/kod/today/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:1653:12[90m)[39m

[90mstderr[2m | src/hooks/useFirestoreSync.test.ts[2m > [22m[2museFirestoreSync[2m > [22m[2mshould add item successfully
[22m[39mFirestore sync error for users/test-user-id/test-collection: Error: Firestore error
    at C:/kod/today/src/hooks/useFirestoreSync.test.ts:102:27
    at [90mfile:///C:/kod/today/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:145:11
    at [90mfile:///C:/kod/today/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:915:26
    at [90mfile:///C:/kod/today/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:1243:20
    at new Promise (<anonymous>)
    at runWithTimeout [90m(file:///C:/kod/today/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:1209:10[90m)[39m
    at [90mfile:///C:/kod/today/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:1653:37
    at Traces.$ [90m(file:///C:/kod/today/[39mnode_modules/[4mvitest[24m/dist/chunks/traces.CCmnQaNT.js:142:27[90m)[39m
    at trace [90m(file:///C:/kod/today/[39mnode_modules/[4mvitest[24m/dist/chunks/test.B8ej_ZHS.js:239:21[90m)[39m
    at runTest [90m(file:///C:/kod/today/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:1653:12[90m)[39m

[90mstderr[2m | src/hooks/useFirestoreSync.test.ts[2m > [22m[2museFirestoreSync[2m > [22m[2mshould update item successfully
[22m[39mFirestore sync error for users/test-user-id/test-collection: Error: Firestore error
    at C:/kod/today/src/hooks/useFirestoreSync.test.ts:102:27
    at [90mfile:///C:/kod/today/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:145:11
    at [90mfile:///C:/kod/today/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:915:26
    at [90mfile:///C:/kod/today/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:1243:20
    at new Promise (<anonymous>)
    at runWithTimeout [90m(file:///C:/kod/today/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:1209:10[90m)[39m
    at [90mfile:///C:/kod/today/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:1653:37
    at Traces.$ [90m(file:///C:/kod/today/[39mnode_modules/[4mvitest[24m/dist/chunks/traces.CCmnQaNT.js:142:27[90m)[39m
    at trace [90m(file:///C:/kod/today/[39mnode_modules/[4mvitest[24m/dist/chunks/test.B8ej_ZHS.js:239:21[90m)[39m
    at runTest [90m(file:///C:/kod/today/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:1653:12[90m)[39m

[90mstderr[2m | src/hooks/useFirestoreSync.test.ts[2m > [22m[2museFirestoreSync[2m > [22m[2mshould delete item successfully
[22m[39mFirestore sync error for users/test-user-id/test-collection: Error: Firestore error
    at C:/kod/today/src/hooks/useFirestoreSync.test.ts:102:27
    at [90mfile:///C:/kod/today/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:145:11
    at [90mfile:///C:/kod/today/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:915:26
    at [90mfile:///C:/kod/today/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:1243:20
    at new Promise (<anonymous>)
    at runWithTimeout [90m(file:///C:/kod/today/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:1209:10[90m)[39m
    at [90mfile:///C:/kod/today/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:1653:37
    at Traces.$ [90m(file:///C:/kod/today/[39mnode_modules/[4mvitest[24m/dist/chunks/traces.CCmnQaNT.js:142:27[90m)[39m
    at trace [90m(file:///C:/kod/today/[39mnode_modules/[4mvitest[24m/dist/chunks/test.B8ej_ZHS.js:239:21[90m)[39m
    at runTest [90m(file:///C:/kod/today/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:1653:12[90m)[39m

[90mstderr[2m | src/hooks/useFirestoreSync.test.ts[2m > [22m[2museFirestoreSync[2m > [22m[2mshould add item successfully
[22m[39mFirestore sync error for users/test-user-id/test-collection: Error: Firestore error
    at C:/kod/today/src/hooks/useFirestoreSync.test.ts:102:27
    at [90mfile:///C:/kod/today/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:145:11
    at [90mfile:///C:/kod/today/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:915:26
    at [90mfile:///C:/kod/today/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:1243:20
    at new Promise (<anonymous>)
    at runWithTimeout [90m(file:///C:/kod/today/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:1209:10[90m)[39m
    at [90mfile:///C:/kod/today/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:1653:37
    at Traces.$ [90m(file:///C:/kod/today/[39mnode_modules/[4mvitest[24m/dist/chunks/traces.CCmnQaNT.js:142:27[90m)[39m
    at trace [90m(file:///C:/kod/today/[39mnode_modules/[4mvitest[24m/dist/chunks/test.B8ej_ZHS.js:239:21[90m)[39m
    at runTest [90m(file:///C:/kod/today/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:1653:12[90m)[39m

[90mstderr[2m | src/hooks/useFirestoreSync.test.ts[2m > [22m[2museFirestoreSync[2m > [22m[2mshould update item successfully
[22m[39mFirestore sync error for users/test-user-id/test-collection: Error: Firestore error
    at C:/kod/today/src/hooks/useFirestoreSync.test.ts:102:27
    at [90mfile:///C:/kod/today/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:145:11
    at [90mfile:///C:/kod/today/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:915:26
    at [90mfile:///C:/kod/today/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:1243:20
    at new Promise (<anonymous>)
    at runWithTimeout [90m(file:///C:/kod/today/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:1209:10[90m)[39m
    at [90mfile:///C:/kod/today/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:1653:37
    at Traces.$ [90m(file:///C:/kod/today/[39mnode_modules/[4mvitest[24m/dist/chunks/traces.CCmnQaNT.js:142:27[90m)[39m
    at trace [90m(file:///C:/kod/today/[39mnode_modules/[4mvitest[24m/dist/chunks/test.B8ej_ZHS.js:239:21[90m)[39m
    at runTest [90m(file:///C:/kod/today/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:1653:12[90m)[39m

[90mstderr[2m | src/hooks/useFirestoreSync.test.ts[2m > [22m[2museFirestoreSync[2m > [22m[2mshould delete item successfully
[22m[39mFirestore sync error for users/test-user-id/test-collection: Error: Firestore error
    at C:/kod/today/src/hooks/useFirestoreSync.test.ts:102:27
    at [90mfile:///C:/kod/today/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:145:11
    at [90mfile:///C:/kod/today/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:915:26
    at [90mfile:///C:/kod/today/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:1243:20
    at new Promise (<anonymous>)
    at runWithTimeout [90m(file:///C:/kod/today/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:1209:10[90m)[39m
    at [90mfile:///C:/kod/today/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:1653:37
    at Traces.$ [90m(file:///C:/kod/today/[39mnode_modules/[4mvitest[24m/dist/chunks/traces.CCmnQaNT.js:142:27[90m)[39m
    at trace [90m(file:///C:/kod/today/[39mnode_modules/[4mvitest[24m/dist/chunks/test.B8ej_ZHS.js:239:21[90m)[39m
    at runTest [90m(file:///C:/kod/today/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:1653:12[90m)[39m

 [32m✓[39m src/context/AuthContext.test.tsx [2m([22m[2m4 tests[22m[2m)[22m[32m 55[2mms[22m[39m
 [32m✓[39m src/context/AuthContext.test.tsx [2m([22m[2m4 tests[22m[2m)[22m[32m 67[2mms[22m[39m
 [32m✓[39m src/hooks/useFirestoreSync.test.ts [2m([22m[2m10 tests[22m[2m)[22m[32m 79[2mms[22m[39m
 [32m✓[39m src/hooks/useFirestoreSync.test.ts [2m([22m[2m10 tests[22m[2m)[22m[32m 90[2mms[22m[39m
 [32m✓[39m src/components/Modal.test.tsx [2m([22m[2m6 tests[22m[2m)[22m[32m 157[2mms[22m[39m
 [32m✓[39m src/components/Modal.test.tsx [2m([22m[2m6 tests[22m[2m)[22m[32m 160[2mms[22m[39m
[90mstderr[2m | src/context/ToastContext.test.tsx[2m > [22m[2mToastContext[2m > [22m[2mshowToast adds a toast
[22m[39mAn update to ToastProvider inside a test was not wrapped in act(...).

When testing, code that causes React state updates should be wrapped into act(...):

act(() => {
  /* fire events that update state */
});
/* assert on the output */

This ensures that you're testing the behavior the user would see in the browser. Learn more at https://react.dev/link/wrap-tests-with-act

[90mstderr[2m | src/context/ToastContext.test.tsx[2m > [22m[2mToastContext[2m > [22m[2mremoveToast removes a toast by id
[22m[39mAn update to ToastProvider inside a test was not wrapped in act(...).

When testing, code that causes React state updates should be wrapped into act(...):

act(() => {
  /* fire events that update state */
});
/* assert on the output */

This ensures that you're testing the behavior the user would see in the browser. Learn more at https://react.dev/link/wrap-tests-with-act

[90mstderr[2m | src/context/ToastContext.test.tsx[2m > [22m[2mToastContext[2m > [22m[2mshowToast adds a toast
[22m[39mAn update to ToastProvider inside a test was not wrapped in act(...).

When testing, code that causes React state updates should be wrapped into act(...):

act(() => {
  /* fire events that update state */
});
/* assert on the output */

This ensures that you're testing the behavior the user would see in the browser. Learn more at https://react.dev/link/wrap-tests-with-act

[90mstderr[2m | src/context/ToastContext.test.tsx[2m > [22m[2mToastContext[2m > [22m[2mremoveToast removes a toast by id
[22m[39mAn update to ToastProvider inside a test was not wrapped in act(...).

When testing, code that causes React state updates should be wrapped into act(...):

act(() => {
  /* fire events that update state */
});
/* assert on the output */

This ensures that you're testing the behavior the user would see in the browser. Learn more at https://react.dev/link/wrap-tests-with-act

 [32m✓[39m src/context/ToastContext.test.tsx [2m([22m[2m3 tests[22m[2m)[22m[32m 39[2mms[22m[39m
 [32m✓[39m src/context/ToastContext.test.tsx [2m([22m[2m3 tests[22m[2m)[22m[32m 46[2mms[22m[39m
 [32m✓[39m src/components/SearchResults.test.tsx [2m([22m[2m5 tests[22m[2m)[22m[32m 82[2mms[22m[39m
 [32m✓[39m src/components/SearchResults.test.tsx [2m([22m[2m5 tests[22m[2m)[22m[32m 89[2mms[22m[39m
 [32m✓[39m src/context/AppContext.test.tsx [2m([22m[2m5 tests[22m[2m)[22m[32m 86[2mms[22m[39m
 [32m✓[39m src/context/AppContext.test.tsx [2m([22m[2m5 tests[22m[2m)[22m[32m 92[2mms[22m[39m
[90mstderr[2m | src/components/ListDetail.test.tsx[2m > [22m[2mListDetail[2m > [22m[2madds a new item
[22m[39mAn update to ListDetail2 inside a test was not wrapped in act(...).

When testing, code that causes React state updates should be wrapped into act(...):

act(() => {
  /* fire events that update state */
});
/* assert on the output */

This ensures that you're testing the behavior the user would see in the browser. Learn more at https://react.dev/link/wrap-tests-with-act
An update to ListDetail2 inside a test was not wrapped in act(...).

When testing, code that causes React state updates should be wrapped into act(...):

act(() => {
  /* fire events that update state */
});
/* assert on the output */

This ensures that you're testing the behavior the user would see in the browser. Learn more at https://react.dev/link/wrap-tests-with-act
An update to ListDetail2 inside a test was not wrapped in act(...).

When testing, code that causes React state updates should be wrapped into act(...):

act(() => {
  /* fire events that update state */
});
/* assert on the output */

This ensures that you're testing the behavior the user would see in the browser. Learn more at https://react.dev/link/wrap-tests-with-act

[90mstderr[2m | src/components/ListDetail.test.tsx[2m > [22m[2mListDetail[2m > [22m[2madds a new item
[22m[39mAn update to ListDetail2 inside a test was not wrapped in act(...).

When testing, code that causes React state updates should be wrapped into act(...):

act(() => {
  /* fire events that update state */
});
/* assert on the output */

This ensures that you're testing the behavior the user would see in the browser. Learn more at https://react.dev/link/wrap-tests-with-act
An update to ListDetail2 inside a test was not wrapped in act(...).

When testing, code that causes React state updates should be wrapped into act(...):

act(() => {
  /* fire events that update state */
});
/* assert on the output */

This ensures that you're testing the behavior the user would see in the browser. Learn more at https://react.dev/link/wrap-tests-with-act
An update to ListDetail2 inside a test was not wrapped in act(...).

When testing, code that causes React state updates should be wrapped into act(...):

act(() => {
  /* fire events that update state */
});
/* assert on the output */

This ensures that you're testing the behavior the user would see in the browser. Learn more at https://react.dev/link/wrap-tests-with-act

 [32m✓[39m src/components/ListDetail.test.tsx [2m([22m[2m4 tests[22m[2m)[22m[32m 184[2mms[22m[39m
 [32m✓[39m src/components/ListDetail.test.tsx [2m([22m[2m4 tests[22m[2m)[22m[32m 197[2mms[22m[39m

[2m Test Files [22m [1m[32m8 passed[39m[22m[90m (8)[39m
[2m      Tests [22m [1m[32m45 passed[39m[22m[90m (45)[39m
[2m   Start at [22m 06:48:31
[2m   Duration [22m 27.83s[2m (transform 2.94s, setup 34.76s, import 20.19s, tests 724ms, environment 149.70s)[22m


[2m Test Files [22m [1m[32m8 passed[39m[22m[90m (8)[39m
[2m      Tests [22m [1m[32m45 passed[39m[22m[90m (45)[39m
[2m   Start at [22m 06:48:31
[2m   Duration [22m 28.06s[2m (transform 3.02s, setup 34.81s, import 20.14s, tests 712ms, environment 149.68s)[22m

JUNIT report written to C:/kod/today/dist/test-results.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
JUNIT report written to C:/kod/today/dist/test-results.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   52.18 |    36.28 |   41.81 |   53.92 |                   
 src               |     100 |      100 |     100 |     100 |                   
  constants.ts     |     100 |      100 |     100 |     100 |                   
  firebase.ts      |     100 |      100 |     100 |     100 |                   
 src/components    |    48.1 |    38.04 |   37.03 |   49.75 |                   
  ...rBoundary.tsx |   31.25 |    16.66 |   42.85 |   31.25 | 22-30,35-40,48-80 
  ...leteInput.tsx |   48.38 |    38.46 |   44.44 |   51.72 | ...57,64-66,72-74 
All files          |   52.18 |    36.28 |   41.81 |   53.92 |                   
  ListDetail.tsx   |   43.49 |       31 |   28.57 |   45.25 | ...0-855,872-1124 
  Modal.tsx        |    91.3 |    88.23 |   85.71 |   90.47 | 35-36             
  ...chResults.tsx |     100 |    77.77 |     100 |     100 | 61-69,94-102      
 src/context       |   50.22 |    27.38 |   40.84 |    52.7 |                   
  AppContext.tsx   |   41.43 |    24.35 |      25 |   44.78 | ...03,407-410,458 
 src               |     100 |      100 |     100 |     100 |                   
  constants.ts     |     100 |      100 |     100 |     100 |                   
  firebase.ts      |     100 |      100 |     100 |     100 |                   
  AuthContext.tsx  |      80 |       75 |     100 |   79.16 | 38-39,47-48,62    
 src/components    |    48.1 |    38.04 |   37.03 |   49.75 |                   
  ...rBoundary.tsx |   31.25 |    16.66 |   42.85 |   31.25 | 22-30,35-40,48-80 
  ...leteInput.tsx |   48.38 |    38.46 |   44.44 |   51.72 | ...57,64-66,72-74 
  ToastContext.tsx |   94.73 |       50 |     100 |   93.75 | 49                
 src/hooks         |   82.45 |    36.66 |     100 |   81.13 |                   
  ...estoreSync.ts |   82.45 |    36.66 |     100 |   81.13 | ...01-104,115-118 
 src/utils         |   68.42 |      100 |      80 |   70.58 |                   
  tags.ts          |   68.42 |      100 |      80 |   70.58 | 29-34             
-------------------|---------|----------|---------|---------|-------------------
  ListDetail.tsx   |   43.49 |       31 |   28.57 |   45.25 | ...0-855,872-1124 
  Modal.tsx        |    91.3 |    88.23 |   85.71 |   90.47 | 35-36             
  ...chResults.tsx |     100 |    77.77 |     100 |     100 | 61-69,94-102      
 src/context       |   50.22 |    27.38 |   40.84 |    52.7 |                   
  AppContext.tsx   |   41.43 |    24.35 |      25 |   44.78 | ...03,407-410,458 
  AuthContext.tsx  |      80 |       75 |     100 |   79.16 | 38-39,47-48,62    
  ToastContext.tsx |   94.73 |       50 |     100 |   93.75 | 49                
 src/hooks         |   82.45 |    36.66 |     100 |   81.13 |                   
  ...estoreSync.ts |   82.45 |    36.66 |     100 |   81.13 | ...01-104,115-118 
 src/utils         |   68.42 |      100 |      80 |   70.58 |                   
  tags.ts          |   68.42 |      100 |      80 |   70.58 | 29-34             
-------------------|---------|----------|---------|---------|-------------------

```

```
