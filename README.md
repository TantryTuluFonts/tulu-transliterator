# Tuḷu Transliterator

**Live: <https://tantrytulufonts.github.io/tulu-transliterator/>**

Converts Tuḷu text between **AccTantra** (the Mallige font encoding) and **IAST**, **Devanāgarī**, **Kannaḍa** or **Malayāḷam**, in both directions. Part of the [Tantry Tulu Font Foundry](https://tantrytulufonts.github.io/), by Prahlad Prasad Tantry.

## Using it

- Pick a script, then type or paste. The direction shows beside the Swap button; Swap reverses it and carries the result across.
- **Share link** copies a link that opens the page with your text and direction already set.
- **Options** turn the Mallige font display on or off, keep non-joining virāmas (ZWNJ), and keep anusvāra as ṃ.
- The **Quick reference** below the tool lists every key with its real glyph, and can be filtered.

AccTantra is the typing standard used by the ASCII Tuḷu fonts. Its key map is documented in the [AccTantra repository](https://github.com/TantryTuluFonts/AccTantra), and the standard it serves is set out in the book [*Tuḷu Varṇāmr̥ta*](https://tantrytulufonts.github.io/tulu-varnamruta/).

## What is in this repository

| Path | What it is |
|---|---|
| `index.html` | The finished page (generated; see below) |
| `tulu.ttf` | The Mallige font, used to show AccTantra text as Tuḷu script |
| `tools/` | The source the page is built from |

## Changing the page

`index.html` is assembled from the files in `tools/`:

- `engine.js` holds the conversion rules. Change it only when you mean to change what the tool converts.
- `ui.js` is the interface script, `template.html` the layout and styles, and `refcards.html` the quick reference tables.

Rebuild from the repository root (Python 3, no packages needed):

```bash
python tools/assemble.py
```

Commit the regenerated `index.html`. GitHub Pages publishes it.

## Credit

Created by Prahlad Prasad Tantry.
