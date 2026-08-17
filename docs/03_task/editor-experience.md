# エディタ体験の拡張

## ワークスペース Tree View の表示・応答性改善

Status: 実機確認待ち

Priority: 高

Dependencies: 実行中の Plainmark デスクトップアプリを操作できること

Success criteria: 該当なし

### Work

- [x] Carbon Components Svelte の `TreeView` に置き換え、再帰的なフォルダ・Markdown ツリーを実装する。
- [x] ルートフォルダの右クリックから、ディスクを変更せずサイドバーだけから除去する `Remove Folder` を実装する。
- [x] Tauri Dialog の `recursive: true` と `@tauri-apps/api/path` の `join()` を使い、子フォルダの scope と OS 固有のパス結合を既存 API へ委譲する。
- [x] 回帰テストとビルドを再実行する。
- [x] Markdown leaf の不要な `#` を除去し、長い名前を一行の省略表示にする。
- [x] `.git`、`node_modules`、代表的な生成物・キャッシュを再帰走査対象から除外し、Carbon `TreeView` の仮想化を有効にする。
- [x] フォルダ走査を一度に統合し、Markdown本文を選択時まで遅延読込にする。
- [ ] 実機でプロジェクトルートを選択し、初回表示時間・任意の子フォルダの展開/折りたたみ・Markdown leaf の切替・`Remove Folder` の応答性を受入確認する。

### Done

- `＋` から選んだワークスペースがコンパクトなツリーとして表示される。
- Markdown leaf はファイル名だけを表示し、長い名前も改行せずに省略表示される。
- `.git`、`node_modules`、生成物・キャッシュはワークスペースツリーに含めず、再帰走査もしない。
- フォルダ選択時はツリーmetadataだけを一度走査し、Markdown本文は選択した文書だけを読む。
- 任意の子フォルダをマウスとキーボードで開閉できる。
- Markdown leaf を選択すると該当文書を編集できる。
- root の右クリックから `Remove Folder` を選んでもディスク上のファイルは消えない。

### Verification

- `npm run check`: 成功（0 errors / 0 warnings）。
- `npm test`: 成功（4 files / 22 tests）。
- `npm run build`: 成功。既存の大きな bundle に対する Vite warning のみ。
- `cargo check --manifest-path src-tauri/Cargo.toml`: 成功。
- `npm run tauri dev`: 起動し、空状態の画面を確認済み。自動マウス操作は実行権限が拒否されたため、フォルダ選択後の受入確認は未実施。
- Tauri Dialog の型定義で、`recursive: true` が子ディレクトリを scope に許可する設定であることを確認した。スクリーンショットの「フォルダは出るが Markdown がない」症状に対応するため、フォルダ選択へ適用した。
- プロジェクトルート選択時の遅延は、`.git`・`node_modules`等を `folderPathsIn()` と `markdownFilesIn()` が二重に全再帰走査し、通常描画のTreeViewも全ノードをDOMへ作成することが原因だった。非編集ディレクトリの明示除外とCarbonの仮想化で対処した。
- なお全量走査後に全Markdown本文を一括でTauri経由に読む処理も初回表示をブロックしていたため、走査を1回に統合し、本文は選択時に個別読込する方式へ変更した。

### Progress

Markdown leafの表示は実機で確認済み。不要な `#`、長い名前の折返し、巨大ツリー起因の遅延を修正し、さらに初期表示クリティカルパスから全Markdown本文の読込を除外した。次はプロジェクトルートを開き直して初回表示時間と文書切替の応答性を手動確認する。
