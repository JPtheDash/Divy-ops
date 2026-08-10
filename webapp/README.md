# The learning app

A single-page, static web app that presents the DevOps + AWS curriculum with
sidebar navigation, progress tracking, copy-able commands, syntax highlighting,
and an interactive CIDR subnet calculator.

## Files
- `index.html` — the whole app (HTML + CSS + JS in one file)
- `content.js` — the curriculum, bundled from the repo's markdown. **Commit this.**
- `build-content.js` — regenerates `content.js` from the `.md` files (needs Node)
- `start.sh` / `start.command` / `start.bat` — launchers for Linux-mac / macOS / Windows

## Run it
```bash
./start.sh        # or start.command (macOS), start.bat (Windows)
# → http://localhost:8778
```
No Node needed to *run* it (content.js is committed). Node is only needed to
*rebuild* content after editing a lab.

## After editing a lab
```bash
node build-content.js   # re-bundle
# commit content.js along with your markdown change
```

## Notes
- Progress is stored per-browser in `localStorage` — every user gets their own.
- The markdown renderer and highlighter load from a CDN, so first load needs
  internet. For an offline build, vendor `marked` and `highlight.js` locally.
- Responsive: on screens ≤900px the sidebar becomes a ☰ drawer.

See `../RUNNING.md` for hosting on GitHub Pages and using it from a tablet.
