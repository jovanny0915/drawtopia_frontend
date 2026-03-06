# Favicon & App Icons – Implementation Summary

Implementation follows the **Favicon & App Icons - Implementation Guide** (Feb 7, 2026).

## What’s in place

- **`static/favicon.svg`** – Gear-flower icon (theme `#3B82F6`). Replace with the Figma export if you have a final asset.
- **`static/favicon.ico`** – Multi-resolution (16×16, 32×32, 48×48), generated from the SVG.
- **PNG set** – All required sizes in `static/`:
  - `favicon-16x16.webp`, `favicon-32x32.webp`, `favicon-48x48.webp`, `favicon-96x96.webp`
  - `favicon-192x192.webp`, `favicon-512x512.webp`
  - `apple-touch-icon.webp`, `apple-touch-icon-precomposed.webp` (180×180)
- **`src/app.html`** – Favicon and app icon `<link>` tags (SVG first, then PNGs, shortcut icon, Apple touch, Android, manifest).
- **`static/site.webmanifest`** – PWA manifest with name, icons (192, 512), `theme_color` `#3B82F6`, `background_color` `#FFFFFF`, `display` `standalone`.

## Regenerating from the SVG

From the frontend root:

```bash
npm run generate-favicons
```

This script (using `sharp` and `png-to-ico`) reads `static/favicon.svg` and writes all PNGs plus `favicon.ico` into `static/`.

## Using Figma exports

If you replace the icon with assets from Figma:

1. Export from Figma at the sizes in the guide (e.g. 16, 32, 48, 96, 180, 192, 512).
2. Replace **`static/favicon.svg`** with the vector export (and optionally run `npm run generate-favicons` to refresh PNGs/ICO), **or** replace the PNGs and `favicon.ico` directly in `static/`.
3. For **favicon.ico** only:  
   `convert static/favicon-16x16.webp static/favicon-32x32.webp static/favicon-48x48.webp static/favicon.ico` (ImageMagick), or use an online favicon generator.

## Testing

- **Desktop:** Chrome, Firefox, Safari, Edge – tab icon and shortcut icon.
- **Mobile:** iOS Safari and Android Chrome – “Add to Home Screen” icon.
- **Cache:** Hard refresh (e.g. Ctrl+Shift+R / Cmd+Shift+R) or clear cache to see updates.
