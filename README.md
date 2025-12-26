# vsk_portfolio
My portfolio website.

## Preview

To preview the site locally:

1. From the repository root run a simple static server, e.g.:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000/home.html in your browser.

Notes:
- The site uses a local stylesheet at `/styles.css` and placeholder pages (`cv.html`, `reflections.html`, `hobbies.html`).
- To replace the photo, add an image (for example `/images/me.jpg`) and update the `#photo` background-image in `styles.css` or replace the `<div class="photo">` with an `<img>` tag.
- The font-family includes `Aptos` as requested; if you want a web font fallback, I can add one (Google Fonts alternative or self-hosted font files).

## Embedding a CV PDF

Place your CV PDF at `files/CV_12-2025_website.pdf`. The CV page (`cv.html`) embeds this file directly using an <iframe>.

Quick steps:

1. Copy your PDF into the repository:

```bash
mkdir -p files
cp /path/to/your_cv.pdf files/CV_12-2025_website.pdf
```

2. Preview the page with a simple server (recommended):

```bash
python3 -m http.server 8000
# open http://localhost:8000/cv.html
```

If you cannot run a server and open the file via `file://`, some browsers restrict PDF embedding. In that case open `files/CV_12-2025_website.pdf` directly or use the server command above.

