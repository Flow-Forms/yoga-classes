# Yoga classes

Public, phone-friendly static player for personal yoga class recordings.

Live site: https://flow-forms.github.io/yoga-classes/

## Edit metadata

Open [`classes.json`](./classes.json). Each class looks like:

```json
{
  "id": "class-01",
  "title": "Class 1",
  "audio": "audio/class-01.m4a",
  "durationSec": 4003,
  "difficulty": "",
  "poses": [],
  "notes": ""
}
```

Fill in:

- `title` — display name
- `difficulty` — one of `Beginner`, `Intermediate`, `Advanced` (or leave empty)
- `poses` — array of strings, e.g. `["Down dog", "Warrior II"]`
- `notes` — optional free text (also searchable)

Keep `id`, `audio`, and `durationSec` unless you replace the audio file.

## Local preview

Serve the folder over HTTP (needed for `fetch` of `classes.json`):

```bash
cd /path/to/yoga-player
python3 -m http.server 8080
```

Open http://localhost:8080

## Deploy

This repo is served by GitHub Pages from the `main` branch root.

```bash
git add classes.json
git commit -m "Update class metadata"
git push origin main
```

Pages usually updates within a minute or two.

## Audio files

Cleaned class audio lives in `audio/class-01.m4a` … `audio/class-16.m4a`.
Each file is under GitHub’s 100MB limit; no LFS required.
