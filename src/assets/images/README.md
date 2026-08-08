# src/assets/images/

Image files bundled into the app.

## Required: `logo.png`

The Syandrix Infotech logo is **not yet in this folder**. Until it is added,
`src/components/common/BrandMark.jsx` renders a typographic placeholder — the
"Syandrix / INFOTECH" wordmark styled in the brand colours.

### To add it

1. Save the logo here as `logo.png`.
   - **Transparent background** (PNG with alpha), so it sits correctly on both
     the white login screen and any future dark surface.
   - **At least ~900px wide.** It displays at roughly 300px, and phone screens
     are 2x-3x density — a smaller source will look visibly soft.

2. Open `src/components/common/BrandMark.jsx` and:
   - uncomment the `logoSource` require
   - set `USE_IMAGE_LOGO` to `true`

That is the entire change. No other file references the logo.

> **Why the require is commented out rather than guarded by the flag:**
> Metro resolves `require()` paths at build time, not runtime. A require
> pointing at a missing file breaks the whole bundle and the app will not
> start — a runtime condition does not prevent that.

## Also worth adding later

Expo currently falls back to defaults for these. They are referenced from
`app.json` and are not needed for development:

| File | Purpose | Suggested size |
|---|---|---|
| `icon.png` | Home screen app icon | 1024x1024 |
| `splash-icon.png` | Launch screen | 1284x2778 |
| `adaptive-icon.png` | Android adaptive icon foreground | 1024x1024 |

A **dark-background variant** of the logo will also be needed if dark mode is
added, since a dark wordmark on a dark surface disappears.
