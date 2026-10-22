# Export runtime dependencies

These browser distributions are served locally by GitHub Pages. They are loaded only when an export needs them. No character content is sent to an external document-generation service.

| Distribution | Version | Upstream license |
| --- | --- | --- |
| pdf-lib | 1.17.1 | MIT |
| docx | 9.6.1 | MIT |
| JSZip | 3.10.1 | MIT or GPLv3 |
| @pdf-lib/fontkit | 1.1.1 | MIT |
| DejaVu Sans regular and bold | 2.37 | See fonts/LICENSE |

`package-lock.json` pins the matching development packages. The fontkit distribution is the upstream `dist/fontkit.umd.min.js`, pdf-lib uses `dist/pdf-lib.min.js`, docx uses `dist/index.iife.js`, and JSZip uses `dist/jszip.min.js`.

Fontkit is the pdf-lib fork of Devon Govett's fontkit, maintained by Andrew Dillon. Its upstream package README and MIT license notice are retained here. Fontkit is used solely to embed the local Unicode fonts in generated PDFs.
