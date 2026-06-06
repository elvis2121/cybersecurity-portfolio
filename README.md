# Elvis Njau Cybersecurity Portfolio

A responsive static portfolio for SOC analyst and junior cybersecurity engineering roles.

## Local development

```powershell
npm run build
npm run serve
```

Open `http://localhost:4173`.

## Add a project

1. Add `content/projects/<repository-name>/README.md`.
2. Put screenshots in `content/projects/<repository-name>/assets/`.
3. Add the project to `src/projects.json`.
4. Run `npm run build`.

Only add projects that are already published under
[`elvis2121`](https://github.com/elvis2121).

## GitHub Pages

The build output is committed in `docs/`. Configure GitHub Pages to deploy
from the `main` branch and `/docs` folder.
