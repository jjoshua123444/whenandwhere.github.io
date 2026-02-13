# whenandwhere.github.io

A simple aesthetic website where friends can share weekly availability, a meetup time, place, and quick notes.

## Use on GitHub Pages

Because this repo is named `whenandwhere.github.io`, GitHub serves it automatically at:

- `https://whenandwhere.github.io`

Just push to your default branch and refresh the site.

## How friends can use it

- Add availability directly in the form.
- Click **Copy share link** to generate a URL containing the current plan.
- Send that URL to friends so they can open/import the same plan in their browser.

> Note: data is stored in each browser's localStorage unless shared via the generated link.

## Local preview

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.
