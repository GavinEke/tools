# Tools Website

A collection of pure HTML + JavaScript tools, hosted on GitHub Pages.

## Directory Structure

```
/ (repo root)
├── index.html              # Main page with tool list and search
├── assets/                 # Shared CSS/JS/images
│   ├── css/styles.css
│   ├── js/main.js
│   └── img/
├── data/                   # Data storage
│   └── tools.json          # Tool metadata
└── README.md
```

## Adding New Tools

1. Create your tool as `<tool-name>/index.html`
2. Add entry to `data/tools.json`:
   ```json
   {
     "id": "tool-name",
     "name": "Tool Name",
     "description": "Brief description",
     "path": "<tool-name>/index.html",
     "tags": ["tag1", "tag2"]
   }
   ```

## Running Locally

Due to browser security restrictions (CORS), you must serve files via a web server:

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080 in your browser.

## Deployment

Push to GitHub and enable GitHub Pages (Settings → Pages → main branch → /).
