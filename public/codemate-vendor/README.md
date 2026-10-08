# Vendored classroom resources

These local resources support generated interactive classroom content without relying on a runtime CDN request. Keep the JavaScript, stylesheets and fonts together. Classroom HTML may reference them even though the application source does not import them directly.

| Resource | Verified version | Copyright and license |
| --- | --- | --- |
| `tailwindcss.js` | Tailwind CSS 3.4.17, identified by the bundle's `dh="3.4.17"` version constant | Copyright (c) Tailwind Labs, Inc.; [MIT license](LICENSE-tailwindcss.txt) |
| `katex/` | KaTeX 0.16.38; all 83 vendored files match the installed package's `dist/` files byte for byte | Copyright (c) 2013-2020 Khan Academy and other contributors; [MIT license](katex/LICENSE) |

`LICENSE-tailwindcss.txt` is copied unchanged from the official [Tailwind CSS v3.4.17 LICENSE](https://github.com/tailwindlabs/tailwindcss/blob/v3.4.17/LICENSE). `katex/LICENSE` is copied unchanged from the installed `katex@0.16.38` package. Existing third-party copyright notices embedded in the Tailwind browser bundle are preserved.

The Tailwind browser bundle is version 3.4.17; the application's Tailwind 4.2.1 build dependency is a separate resource. Do not replace this browser bundle's license or version attribution with that build dependency's metadata.
