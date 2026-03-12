# Validation Output (2026-03-12T05:23:48.666Z)

```bash

> today@1.0.0 build:only
> tsc -b && vite build

[36mvite v7.3.1 [32mbuilding client environment for production...[36m[39m
transforming...
[32m✓[39m 2468 modules transformed.
rendering chunks...
computing gzip size...
[2mdist/[22m[32mmanifest.webmanifest                        [39m[1m[2m    0.49 kB[22m[1m[22m
[2mdist/[22m[32mindex.html                                  [39m[1m[2m    0.68 kB[22m[1m[22m[2m │ gzip:   0.38 kB[22m
[2mdist/[22m[35massets/index-BOvY7uz1.css                   [39m[1m[2m   54.70 kB[22m[1m[22m[2m │ gzip:   8.95 kB[22m
[2mdist/[22m[36massets/workbox-window.prod.es5-BIl4cyR9.js  [39m[1m[2m    5.76 kB[22m[1m[22m[2m │ gzip:   2.37 kB[22m
[2mdist/[22m[36massets/index-DwOIvfx6.js                    [39m[1m[2m1,299.20 kB[22m[1m[22m[2m │ gzip: 398.05 kB[22m
[32m✓ built in 29.23s[39m

PWA v1.2.0
mode      generateSW
precache  8 entries (1328.46 KiB)
files generated
  dist/sw.js
  dist/workbox-8c29f6e4.js

> today@1.0.0 lint
> eslint .


C:\kod\today\src\context\AppContext.tsx
  213:82  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  222:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  237:59  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

✖ 3 problems (0 errors, 3 warnings)


> today@1.0.0 check-any
> eslint . --config eslint.strict.config.ts


C:\kod\today\src\context\AppContext.tsx
  213:82  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  222:43  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  237:59  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

✖ 3 problems (3 errors, 0 warnings)


```
