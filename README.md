# Plainmark

A focused, local-first Markdown editor built with Tauri 2, Svelte, and Crepe.

## Development

```sh
npm install
npm run tauri dev
```

Use `npm run dev` to inspect the interface in a browser. Browser development mode opens a sample document; native file open/save is available in the Tauri app.

## Windows build

Install the [Tauri prerequisites for Windows](https://v2.tauri.app/start/prerequisites/#windows), then build on a Windows machine:

```powershell
npm install
npm run tauri build
```

Tauri writes the executable and installer bundles below `src-tauri/target/release/bundle/`. Build outputs are local deliverables: do not commit executables, installers, or verification screenshots to Git. This keeps pull requests source-only and avoids depending on binary-file support in the review system. When releases are introduced, publish signed installers as release assets instead of adding them to the repository.

## Quality checks

```sh
npm test
npm run check
npm run build
cargo check --manifest-path src-tauri/Cargo.toml
```

## MVP shortcuts

- `Ctrl+O` / `Cmd+O`: open one or more Markdown files
- `Ctrl+S` / `Cmd+S`: save the active file
