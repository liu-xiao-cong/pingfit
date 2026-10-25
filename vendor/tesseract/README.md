# Bundled local OCR

The app recognises images locally. It does not send photographs to an OCR server.

Pinned upstream assets:

- `tesseract.esm.min.js`, `worker.min.js`: Tesseract.js **6.0.1**, from the npm package `tesseract.js@6.0.1` (Apache-2.0).
- `core/tesseract-core-{simd-,}lstm.wasm.js`: Tesseract.js-core **6.0.0**, from npm `tesseract.js-core@6.0.0` (Apache-2.0). Each file embeds its WebAssembly binary. Both SIMD and non-SIMD versions are provided; the worker selects a supported version. Only OEM 1 (LSTM) is used.
- `lang/eng.traineddata.gz`: `@tesseract.js-data/eng@1.0.0/4.0.0_best_int/eng.traineddata.gz`, English language data for the LSTM engine (Apache-2.0).

Licences are included alongside the library/core files. Upstream source:

- https://github.com/naptha/tesseract.js/tree/v6.0.1
- https://github.com/naptha/tesseract.js-core
- https://github.com/naptha/tessdata
- https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng@1.0.0/4.0.0_best_int/eng.traineddata.gz

The app loads this directory using relative URLs, so it works under a GitHub Pages subdirectory as well as a custom HTTPS domain. A service worker should cache every asset here to enable OCR without a connection. First load downloads about 10.6 MiB (only the selected core is requested by the OCR worker).

If a Content Security Policy is added, allow same-origin module scripts/workers/fetches and WebAssembly compilation (`script-src 'self' 'wasm-unsafe-eval'`, `worker-src 'self'`, `connect-src 'self'`). Some older Safari versions require the broader `unsafe-eval` directive for WebAssembly. No external CDN is used at runtime.

Current recognition language is English/numbers. Chinese text on a screen may not be read; English labels such as TIME, DISTANCE, CALORIES, KG and REPS are best. Equipment candidates come only from recognised words, not from visual appearance. Every extracted value requires confirmation in the app before saving.
