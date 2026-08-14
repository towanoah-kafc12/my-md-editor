# Editor MVP

## デスクトップ基盤と編集体験

Status: ブロック

Priority: 高

Dependencies: なし

Success criteria: SC-01, SC-03, SC-05

### Work

- [x] Tauri 2 + Svelte の最小構成を作る
- [x] Crepe を単一編集面として統合し不要機能を無効化する
- [ ] Windows 上で Tauri 開発起動を確認する

### Done

- アプリがビルドでき、基本 Markdown を単一画面で直接編集できる。

### Verification

`npm run check` はエラー 0。`npm test` は 5 件成功（Crepe の 200ms 遅延初期通知の抑止と初期化中破棄の回帰テストを含む）。`npm run build` は成功。実ブラウザを Playwright で起動し、初期化後の表示が `Saved locally`、dirty 要素が 0 件であることを DOM assertion とローカルスクリーンショットで確認した。検証用スクリーンショットは `artifacts/` に出力できるが Git には含めない。`cargo check --manifest-path src-tauri/Cargo.toml` は実行環境に Linux の GLib 開発パッケージがなく停止した（Rust ソース起因のエラーには到達していない）。

### Progress

フロントエンドと Tauri 構成は実装済み。Windows 環境で `npm run tauri dev` を実行し、ネイティブ起動とダイアログを受入確認する。配布バイナリは Windows 上で `npm run tauri build` によりローカル生成し、Git にはコミットしない。

## ローカルファイルワークフロー

Status: ブロック

Priority: 高

Dependencies: デスクトップ基盤と編集体験

Success criteria: SC-02, SC-04, SC-05

### Work

- [x] 複数 `.md` の選択と読み込みを実装する
- [x] サイドバー切替、dirty 状態、保存を実装する
- [x] 純粋ロジックのテストを追加する
- [ ] Windows 上で複数ファイルの読み書きを確認する

### Done

- 複数ファイルを切り替えて編集状態を保持し、選択中の元ファイルへ明示保存できる。

### Verification

文書状態の Vitest 3 件（Windows/POSIX ファイル名、dirty/save 遷移、重複オープン時の下書き保持）が成功。ネイティブファイル I/O は Windows 実機確認待ち。

### Progress

実装と自動テストは完了。Windows 環境で複数選択、切替、編集、`Ctrl+S`、再読込後の内容を受入確認する。
