# Plainmark

Tauri 2、Svelte、Crepe で作る、ローカルファイルを直接扱う軽量な Markdown エディタです。Windows を第一対象にし、将来的な macOS 対応も想定しています。

## 動作環境

- Windows（第一対象）
- Node.js と npm
- Rust stable / Cargo
- Tauri が要求する Microsoft C++ Build Tools、Windows SDK、WebView2

Windows の詳しい要件は、[Tauri の Windows prerequisites](https://v2.tauri.app/start/prerequisites/#windows) を確認してください。

## 初回セットアップ

### Rust / Cargo の導入

Tauri の開発・ビルドには Rust と Cargo が必要です。未導入の場合は PowerShell で Rustup をインストールします。

```powershell
winget install Rustlang.Rustup
```

インストール後はターミナルを開き直し、stable toolchain を有効にして確認します。

```powershell
rustup default stable
rustc --version
cargo --version
```

`cargo` が見つからない場合は、`%USERPROFILE%\.cargo\bin` が PATH に含まれていることを確認してください。現在の PowerShell セッションだけで一時的に確認する場合は、次を実行できます。

```powershell
$env:Path += ";$HOME\.cargo\bin"
cargo --version
```

### 依存パッケージの導入

```sh
npm install
```

## 開発

### ブラウザで UI を確認する

```sh
npm run dev
```

ブラウザ開発モードではサンプル文書を開きます。ネイティブのファイル選択・読み書きは利用できません。

### Windows の Tauri アプリを起動する

```sh
npm run tauri dev
```

ネイティブのファイルを開く・保存する操作は、こちらの Tauri アプリで確認します。初回起動時は Rust の依存パッケージの取得・ビルドに時間がかかることがあります。

## Windows でのビルド

動作環境と [Tauri の Windows prerequisites](https://v2.tauri.app/start/prerequisites/#windows) を満たした Windows 環境で実行します。

```powershell
npm install
npm run tauri build
```

実行ファイルとインストーラは `src-tauri/target/release/bundle/` に生成されます。これらのビルド成果物と検証用スクリーンショットはローカルで扱い、Git にはコミットしません。リリースを導入する場合は、署名済みインストーラをリリースアセットとして公開します。

## 品質チェック

```sh
npm test
npm run check
npm run build
cargo check --manifest-path src-tauri/Cargo.toml
```

- `npm test`: フロントエンドのテストを実行します。
- `npm run check`: Svelte / TypeScript の型・静的チェックを実行します。
- `npm run build`: ブラウザ向けプロダクションビルドを実行します。
- `cargo check --manifest-path src-tauri/Cargo.toml`: Rust / Tauri ホストのコンパイル可否を確認します。

## ネイティブ動作の確認

Windows では、`npm run tauri dev` で起動したアプリにおいて、複数の `.md` ファイルの選択、ファイル切替、編集、未保存状態、`Ctrl+S` による保存、再読込後の内容を確認してください。これらのネイティブ受入確認は、実施環境ごとに行う必要があります。

## MVP のショートカット

- `Ctrl+O` / `Cmd+O`: 1つ以上の Markdown ファイルを開く
- `Ctrl+S` / `Cmd+S`: 選択中のファイルを保存する
