# Editor Feature Roadmap

MVP後に追加するエディタ機能をまとめる。

優先度は `高 / 中 / 低` の3段階とし、同じ優先度では依存関係が解消済みのものを先に進める。

ファイル操作系の機能はUIを個別実装せず、先に共通の右クリックメニューを追加し、その中へ順次載せる。

## 終了時の未保存確認

Status: 未着手

Priority: 高

Dependencies: なし

Success criteria: 該当なし

### Work

- [ ] アプリ終了時に未保存ファイルを検知する
- [ ] 未保存ファイルがある場合に保存 / 破棄 / キャンセルを選べるようにする
- [ ] 複数ファイルが未保存の場合の扱いを決める

### Done

- 未保存内容を意図せず失う状態でアプリを終了しない

### Verification

### Progress

### Note

初期設計でMVP後の確認事項としていた機能。

## 前回ワークスペースの復元

Status: 未着手

Priority: 高

Dependencies: なし

Success criteria: 該当なし

### Work

- [ ] アプリ終了時に開いているワークスペースを保存する
- [ ] 次回起動時に前回のワークスペースを復元する
- [ ] 必要に応じて前回開いていたファイルも復元する
- [ ] 存在しなくなったパスを安全に無視できるようにする

### Done

- 通常利用で毎回同じフォルダを開き直す必要がない

### Verification

### Progress

### Note

初期設計でMVP後の確認事項としていた機能。

## 外部ファイル変更の検知

Status: 未着手

Priority: 高

Dependencies: なし

Success criteria: 該当なし

### Work

- [ ] 開いているMarkdownファイルの外部変更を検知する
- [ ] Plainmark側が未編集なら自動で再読込する
- [ ] Plainmark側にも未保存変更がある場合は Reload / Keep current を選べるようにする
- [ ] 自分自身の保存を外部変更として誤検知しないようにする

### Done

- VS CodeやAIエージェントなど別プロセスからファイルが変更されても安全に追従できる

### Verification

### Progress

### Note

複雑な競合マージは初期実装では行わない。

## ファイル / フォルダ共通の右クリックメニュー

Status: 未着手

Priority: 高

Dependencies: なし

Success criteria: 該当なし

### Work

- [ ] ワークスペース / フォルダ / Markdownファイルごとに右クリック対象を識別できる共通メニューを作る
- [ ] 対象に応じて利用可能な操作だけを表示できるようにする
- [ ] 現在の Remove Folder を共通メニューへ統合する
- [ ] 後続のファイル操作を追加しやすい構造にする

### Done

- ファイル操作系の後続機能が同じコンテキストメニューへ追加できる

### Verification

### Progress

### Note

New Markdown / New Folder / Rename / Reveal in Explorer / Copy Path の先行タスクとする。

## サイドバーからのファイル / フォルダ作成

Status: 未着手

Priority: 高

Dependencies: ファイル / フォルダ共通の右クリックメニュー

Success criteria: 該当なし

### Work

- [ ] New Markdown を右クリックメニューへ追加する
- [ ] New Folder を右クリックメニューへ追加する
- [ ] 作成先を右クリック対象から決定する
- [ ] Markdown拡張子を適切に補完する
- [ ] 重複名や不正な名前を安全に扱う
- [ ] 作成後にツリーを更新する

### Done

- サイドバーからMarkdownファイルとフォルダを作成できる

### Verification

### Progress

### Note

詳細仕様は `docs/02_open/editor-feature-extensions.md` を参照する。

## ファイル / フォルダ名の変更

Status: 未着手

Priority: 高

Dependencies: ファイル / フォルダ共通の右クリックメニュー

Success criteria: 該当なし

### Work

- [ ] Rename を右クリックメニューへ追加する
- [ ] 重複名や不正な名前を安全に扱う
- [ ] Rename後も現在開いている文書との対応を維持する
- [ ] フォルダRename時に配下のパスを更新する

### Done

- サイドバーからファイルとフォルダを安全にRenameできる

### Verification

### Progress

### Note

削除機能は事故防止のため別途必要性を判断し、このタスクには含めない。

## Explorerで表示 / パスをコピー

Status: 未着手

Priority: 中

Dependencies: ファイル / フォルダ共通の右クリックメニュー

Success criteria: 該当なし

### Work

- [ ] Reveal in Explorer を右クリックメニューへ追加する
- [ ] Copy Path を右クリックメニューへ追加する
- [ ] Windows以外でも将来置き換えやすい構造にする

### Done

- Plainmarkから対象ファイルのOS上の場所へすぐ移動できる
- 対象パスをクリップボードへコピーできる

### Verification

### Progress

### Note

Windowsを第一対象としつつ、アプリ層へWindows固有実装を直接広げない。

## Markdownへの画像貼り付け

Status: 未着手

Priority: 高

Dependencies: なし

Success criteria: 該当なし

### Work

- [ ] クリップボード画像の貼り付けに対応する
- [ ] Explorerからの画像ドラッグ&ドロップも対象にする
- [ ] Markdownファイル単位の画像保存フォルダを作成する
- [ ] 画像ファイル名の衝突を自動回避する
- [ ] Markdownには相対パスを挿入する
- [ ] WindowsでもMarkdown内のパス区切りは `/` を使う
- [ ] UndoでMarkdown参照を消しても保存済み画像ファイルは自動削除しない

### Done

- ローカル画像を貼り付けるだけでMarkdownから参照できる
- 画像ファイルがMarkdownと一緒にローカル管理できる

### Verification

### Progress

### Note

保存先は `<Markdownファイル名>.assets/` を第一候補とする。
詳細仕様は `docs/02_open/editor-feature-extensions.md` を参照する。

## Ctrl+P ファイルクイックオープン

Status: 未着手

Priority: 高

Dependencies: なし

Success criteria: 該当なし

### Work

- [ ] Ctrl+P / Cmd+P でファイル選択UIを開く
- [ ] 開いているワークスペース内のMarkdownをファイル名で絞り込む
- [ ] キーボードだけで選択して開けるようにする

### Done

- ファイルツリーを辿らず、ファイル名検索だけで目的のMarkdownを開ける

### Verification

### Progress

### Note

全文検索とは分離し、最初はファイル名だけを対象にする。

## Markdownリンクから別ファイルを開く

Status: 未着手

Priority: 高

Dependencies: なし

Success criteria: 該当なし

### Work

- [ ] 相対パスで参照されたローカルMarkdownリンクをPlainmark内で開く
- [ ] 現在のワークスペース内ファイルならサイドバーの選択状態も同期する
- [ ] 外部URLはOSの既定ブラウザで開く
- [ ] 存在しないローカルリンクを安全に扱う

### Done

- 標準Markdownリンクを使って複数のローカル文書間を移動できる

### Verification

### Progress

### Note

`[[Wiki Link]]` など独自記法は対象にせず、標準Markdown互換を維持する。

## フォントサイズ変更とショートカット

Status: 未着手

Priority: 中

Dependencies: なし

Success criteria: 該当なし

### Work

- [ ] 設定画面からエディタのフォントサイズを変更できるようにする
- [ ] Ctrl/Cmd + `+` で拡大する
- [ ] Ctrl/Cmd + `-` で縮小する
- [ ] Ctrl/Cmd + `0` で既定値へ戻す
- [ ] 設定値を永続化する

### Done

- 設定画面と一般的なキーボード操作の両方から文字サイズを変更できる

### Verification

### Progress

### Note

初期実装ではアプリ全体ではなくEditorのみを対象にする。
詳細仕様は `docs/02_open/editor-feature-extensions.md` を参照する。

## ファイル / フォルダのドラッグ&ドロップ

Status: 未着手

Priority: 中

Dependencies: なし

Success criteria: 該当なし

### Work

- [ ] OSからMarkdownファイルをドロップして開けるようにする
- [ ] OSからフォルダをドロップしてワークスペースとして開けるようにする
- [ ] 非対応ファイルを安全に無視する

### Done

- ファイルダイアログを使わず、ドラッグ&ドロップだけで編集を開始できる

### Verification

### Progress

## 見出しアウトライン

Status: 未着手

Priority: 中

Dependencies: なし

Success criteria: 該当なし

### Work

- [ ] 現在のMarkdownから見出し一覧を取得する
- [ ] 見出しを選択すると該当位置へ移動する
- [ ] 常設サイドバーを増やさず、必要なときだけ開けるUIにする

### Done

- 長いMarkdown内を見出し単位ですばやく移動できる

### Verification

### Progress

## オートセーブ

Status: 未着手

Priority: 中

Dependencies: 終了時の未保存確認

Success criteria: 該当なし

### Work

- [ ] 設定でオートセーブをON/OFFできるようにする
- [ ] デフォルトはOFFとする
- [ ] 編集後の保存タイミングを決める
- [ ] 保存失敗を通知し、未保存状態を維持する

### Done

- 利用者が明示的に有効化した場合だけ安全に自動保存される

### Verification

### Progress

## 全文検索

Status: 未着手

Priority: 低

Dependencies: Ctrl+P ファイルクイックオープン

Success criteria: 該当なし

### Work

- [ ] 開いているワークスペース内のMarkdown本文を検索する
- [ ] 検索結果から対象ファイルと該当箇所へ移動できるようにする
- [ ] 大きなワークスペースでも編集体験を阻害しない方法を選ぶ

### Done

- 複数Markdownを横断して本文を検索できる

### Verification

### Progress

### Note

軽量性を崩さないことを優先し、Ctrl+Pより後に実装する。

## Git status表示

Status: 未着手

Priority: 低

Dependencies: `docs/02_open/integrations-and-themes.md` のGit範囲決定

Success criteria: 該当なし

### Work

- [ ] Gitリポジトリ内のMarkdownへ最小限のstatus表示を追加する
- [ ] modified / untrackedなど編集に必要な状態だけを対象にする
- [ ] Git未導入環境や非Gitフォルダで通常動作を維持する

### Done

- Git管理下のMarkdownについて最低限の変更状態をPlainmark上で確認できる

### Verification

### Progress

### Note

commit / push / branch操作は初期対象にしない。
詳細方針は `docs/02_open/integrations-and-themes.md` を参照する。

## Notion連携

Status: 未着手

Priority: 低

Dependencies: `docs/02_open/integrations-and-themes.md` の同期範囲決定

Success criteria: 該当なし

### Work

- [ ] ローカルMarkdownを唯一の保存形式とする方針を崩さない連携方式を決める
- [ ] インポート / エクスポート / 一方向同期 / 双方向同期の対象範囲を決める
- [ ] 認証情報と競合時のデータ保護を設計する
- [ ] 決定した最小範囲を実装する

### Done

- 決定した範囲でNotionとの連携が行え、ローカルMarkdownを安全に維持できる

### Verification

### Progress

### Note

軽量ローカルエディタの中核から最も離れるため最後に扱う。
詳細方針は `docs/02_open/integrations-and-themes.md` を参照する。
