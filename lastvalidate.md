# Validation Output (2026-03-10T09:48:27.772Z)

```bash

> today@1.0.0 build:only
> tsc -b && vite build

[36mvite v7.3.1 [32mbuilding client environment for production...[36m[39m
transforming...
[32m✓[39m 2467 modules transformed.
rendering chunks...
computing gzip size...
[2mdist/[22m[32mmanifest.webmanifest                        [39m[1m[2m    0.45 kB[22m[1m[22m
[2mdist/[22m[32mindex.html                                  [39m[1m[2m    0.73 kB[22m[1m[22m[2m │ gzip:   0.39 kB[22m
[2mdist/[22m[35massets/index-CeTStSdh.css                   [39m[1m[2m   50.62 kB[22m[1m[22m[2m │ gzip:   8.46 kB[22m
[2mdist/[22m[36massets/workbox-window.prod.es5-BIl4cyR9.js  [39m[1m[2m    5.76 kB[22m[1m[22m[2m │ gzip:   2.37 kB[22m
[2mdist/[22m[36massets/index-BJXWfqD3.js                    [39m[1m[2m1,293.07 kB[22m[1m[22m[2m │ gzip: 395.78 kB[22m
[32m✓ built in 7.72s[39m

PWA v1.2.0
mode      generateSW
precache  9 entries (1318.54 KiB)
files generated
  dist/sw.js
  dist/workbox-8c29f6e4.js

> today@1.0.0 lint
> eslint .


> today@1.0.0 check-any
> eslint . --config eslint.strict.config.ts


> today@1.0.0 test
> vitest run --coverage


[1m[46m RUN [49m[22m [36mv4.0.18 [39m[90mC:/kod/today[39m
      [2mCoverage enabled with [22m[33mv8[39m

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

 [32m✓[39m src/context/ToastContext.test.tsx [2m([22m[2m3 tests[22m[2m)[22m[32m 36[2mms[22m[39m
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

 [32m✓[39m src/context/AuthContext.test.tsx [2m([22m[2m4 tests[22m[2m)[22m[32m 56[2mms[22m[39m
 [32m✓[39m src/hooks/useFirestoreSync.test.ts [2m([22m[2m10 tests[22m[2m)[22m[32m 70[2mms[22m[39m
 [32m✓[39m src/components/SearchResults.test.tsx [2m([22m[2m5 tests[22m[2m)[22m[32m 79[2mms[22m[39m
 [32m✓[39m src/components/Modal.test.tsx [2m([22m[2m6 tests[22m[2m)[22m[32m 135[2mms[22m[39m
 [32m✓[39m src/context/AppContext.test.tsx [2m([22m[2m5 tests[22m[2m)[22m[32m 57[2mms[22m[39m
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

 [32m✓[39m src/components/ListDetail.test.tsx [2m([22m[2m4 tests[22m[2m)[22m[32m 118[2mms[22m[39m

[2m Test Files [22m [1m[32m7 passed[39m[22m[90m (7)[39m
[2m      Tests [22m [1m[32m37 passed[39m[22m[90m (37)[39m
[2m   Start at [22m 10:48:47
[2m   Duration [22m 1.84s[2m (transform 793ms, setup 1.36s, import 2.06s, tests 550ms, environment 4.98s)[22m

JUNIT report written to C:/kod/today/dist/test-results.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   53.13 |    36.16 |   41.91 |   54.57 |                   
 src               |     100 |      100 |     100 |     100 |                   
  firebase.ts      |     100 |      100 |     100 |     100 |                   
 src/components    |   47.86 |    37.74 |   36.15 |   49.47 |                   
  ...rBoundary.tsx |   31.25 |    16.66 |   42.85 |   31.25 | 22-30,35-40,48-80 
  ListDetail.tsx   |   43.28 |    30.76 |   28.44 |   45.15 | ...2-847,864-1116 
  Modal.tsx        |    91.3 |    88.23 |   85.71 |   90.47 | 35-36             
  ...chResults.tsx |     100 |    77.77 |     100 |     100 | 61-69,94-102      
 src/context       |   55.08 |    29.16 |   45.76 |   56.72 |                   
  AppContext.tsx   |   45.45 |    25.75 |   27.27 |   48.09 | ...26,330-333,381 
  AuthContext.tsx  |      80 |       75 |     100 |   79.16 | 38-39,47-48,62    
  ToastContext.tsx |   94.73 |       50 |     100 |   93.75 | 49                
 src/hooks         |   82.45 |    36.66 |     100 |   81.13 |                   
  ...estoreSync.ts |   82.45 |    36.66 |     100 |   81.13 | ...00-103,114-117 
-------------------|---------|----------|---------|---------|-------------------

```
