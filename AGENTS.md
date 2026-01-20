# AGENTS.md

## Purpose

This repository hosts multiple small, self-contained web utilities written by AI agents.  
Each tool is implemented using **HTML + JavaScript**, styled consistently using **Bootstrap 5** and a **shared global CSS file**.

This document defines **mandatory rules and conventions** that all AI agents must follow when adding or modifying utilities.

---

## High-Level Principles

- Each tool is **independent and self-contained**
- Shared styling and behavior must remain **consistent across all utilities**
- No build tools, frameworks, or server-side code
- Everything must work via **static hosting**

---

## Required Technologies

All utilities **must** use:

- **HTML5**
- **Vanilla JavaScript (ES6+)**
- **Bootstrap 5 (CSS + JS)**
- **Shared global CSS**

No React, Vue, Svelte, jQuery, or other frameworks are allowed.

---

## Folder Structure (MANDATORY)

Each tool must live in its **own folder** at the repository root.

/ (repo root)
├── _data/
│   └── tools.json        # Tools registry (auto-loaded by index page)
├── AGENTS.md             # Global instructions for the entire repository
├── assets/
│   ├── css/
│   │   └── styles.css    # Shared global CSS (used by ALL tools)
│   └── js/
│       └── main.js       # Shared global JS (optional usage)
├── <tool-name>/
│   └── index.html        # Tool UI
│   └── script.js         # Tool logic

### Rules

- `<tool-name>` must be **lowercase** and **kebab-case**
  - ✅ `json-formatter`
  - ❌ `JsonFormatter`, `json_formatter`
- No tool may place files outside its own folder
- No tool may modify files belonging to another tool

---

## HTML Rules

Each tool’s `index.html` must use the following layout:

```html
<html lang="en" data-bs-theme="light">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{{INSERT TOOL NAME}} - tools.gavin.cloud</title>
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.8/css/bootstrap.min.css"
      integrity="sha512-2bBQCjcnw658Lho4nlXJcc6WkV/UxpE/sAokbXPxQNGqmNdQrWqtw26Ns9kFF/yG792pKR1Sx8/Y1Lf1XN4GKA=="
      crossorigin="anonymous"
      referrerpolicy="no-referrer"
    />
    <link rel="stylesheet" href="/assets/css/styles.css" />
    <script>
      try {
        const theme = JSON.parse(
          localStorage.getItem("site-theme") || "{}",
        ).theme;
        if (theme) document.documentElement.dataset.bsTheme = theme;
      } catch (e) {}
    </script>
  </head>

  <body>
    <nav class="navbar navbar-expand-sm navbar-dark bg-primary">
      <div class="container">
        <a class="navbar-brand fw-bold" href="/">
          <img
            src="/assets/svg/logo.svg"
            width="30"
            height="30"
            class="bi bi-tools me-2"
          />
          tools.gavin.cloud
        </a>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav ms-auto mb-2 mb-sm-0">
            <li class="nav-item">
              <button type="button" class="nav-link me-2" id="theme-toggle">
                <img
                  src="/assets/svg/theme-light-dark.svg"
                  width="18"
                  height="18"
                  class="me-1"
                />
                Theme
              </button>
            </li>
            <li class="nav-item">
              <a
                class="nav-link"
                href="https://github.com/GavinEke/tools"
                target="_blank"
                rel="noopener"
              >
                <img
                  src="/assets/svg/GitHub.svg"
                  width="18"
                  height="18"
                  class="me-1"
                />
                GitHub
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
    <main class="container py-5">
...
    </main>

    <footer class="py-4 mt-auto">
      <div class="container">
        <div class="text-center">
          <span class="text-body-secondary small"
            >Made with AI & ❤️ by
            <a href="https://gavineke.com" target="_blank" rel="noopener"
              >Gavin Eke</a
            ></span
          >
        </div>
      </div>
    </footer>

    <script
      src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.8/js/bootstrap.min.js"
      integrity="sha512-nKXmKvJyiGQy343jatQlzDprflyB5c+tKCzGP3Uq67v+lmzfnZUi/ZT+fc6ITZfSC5HhaBKUIvr/nTLCV+7F+Q=="
      crossorigin="anonymous"
      referrerpolicy="no-referrer"
    ></script>
    <script src="script.js"></script>
  </body>
</html>
```

---

## CSS Rules

- **DO NOT create tool-specific CSS files**
- All styling must be done using:
  - Bootstrap tool classes
  - Existing selectors in `assets/css/styles.css`
- If new styles are required:
  - They must be generic and reusable
  - They must be added to `styles.css`
  - They must not be tool-specific in name or behavior

### Naming Convention for Shared Styles

Use generic, purpose-based names:
- ✅ `.tool-container`
- ✅ `.tool-header`
- ❌ `.json-formatter-title`
- ❌ `.password-tool-wrapper`

---

## JavaScript Rules

- Each tool’s JS must live in:
  `<tool-name>/script.js`
- No inline JavaScript in HTML
- No global variable pollution
- Wrap logic in an IIFE or module-style pattern

### Example Pattern

```js
(() => {
  function init() {
    // setup logic
  }

  document.addEventListener("DOMContentLoaded", init);
})();
```

---

## Index Page Responsibilities (/index.html)

The root `index.html` acts as a directory of utilities.
- Each tool must be linked clearly
- Include:
  - Tool name
  - Short description
- Do not embed utilities directly on the index page

---

## Tools Registry (data/tools.json)

All tools are registered in `_data/tools.json`. This file is fetched by the index page to dynamically generate tool cards.

### Schema

```json
[
  {
    "name": "Tool Name",
    "href": "tool-folder/",
    "dateAdded": "YYYY-MM-DD",
    "dateUpdated": "",
    "category": "Category",
    "icon": "<svg>...</svg>",
    "description": "Short description of the tool."
  }
]
```

### Field Definitions

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Display name of the tool |
| `href` | Yes | Relative path to the tool's folder (must end with `/`) |
| `dateAdded` | Yes | Date the tool was first added (YYYY-MM-DD format) |
| `dateUpdated` | Yes | Date the tool was last updated (YYYY-MM-DD format), or empty string `""` if never updated |
| `category` | Yes | Single category for the tool (e.g., "Network", "Security", "System", "Development") |
| `icon` | Yes | SVG icon as a string (Bootstrap Icons recommended) |
| `description` | Yes | Short description shown on the tool card |

### Adding a New Tool

1. Create the tool folder and files following the folder structure rules
2. Add the tool entry to `data/tools.json` with:
   - Use today's date for `dateAdded`
   - Leave `dateUpdated` as an empty string `""`
   - Choose the most appropriate existing category, or add a new one if needed
   - Use a Bootstrap Icon SVG for the icon
3. The tool will automatically appear on the index page after the page is refreshed

### Updating an Existing Tool

When updating a tool:
- Set `dateUpdated` to the current date (YYYY-MM-DD format)
- Update other fields as needed (name, description, icon, etc.)
- `dateAdded` remains unchanged to preserve the original addition date

---

## Accessibility & UX Requirements

All utilities must:
- Use semantic HTML
- Include `<label>` elements for inputs
- Be usable with keyboard navigation
- Avoid color-only indicators for meaning
- Be responsive on mobile and desktop

---

## Performance Constraints

- No external dependencies beyond Bootstrap
- No large libraries
- No unnecessary DOM reflows
- No background polling unless essential

---

## What NOT to Do

❌ Add frameworks or build tools
❌ Duplicate CSS across utilities
❌ Hardcode styles inline
❌ Modify other utilities
❌ Assume server-side processing

---

## AI Agent Responsibility

When generating a new tool, an AI agent must:

1. Create a new tool folder
2. Follow all structure and naming rules
3. Use the required HTML layout with script.js for JavaScript
4. Use Bootstrap and shared styles correctly
5. Ensure the tool works when opened directly in a browser
6. Keep code readable and commented

Failure to follow these rules means the tool should be rejected.

---

## Summary

Consistency, simplicity, and isolation are the core goals of this repository.
Every tool should feel like part of the same site while remaining fully independent.

Follow this document strictly.