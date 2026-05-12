# Whisk-It client

React UI built with [Vite](https://vite.dev/). For repository-wide setup, running the API and client together, and environment notes, see the [root README](../README.md).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server (default: [http://localhost:5173](http://localhost:5173)) |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | ESLint |

## Install note

If `npm install` fails with a peer dependency error on ESLint, use:

```bash
npm install --legacy-peer-deps
```
