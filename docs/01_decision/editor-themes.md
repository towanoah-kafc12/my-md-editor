# エディタテーマ

## CSS トークンと Crepe CodeMirror を採用する

### Decision

テーマは `App.svelte` の設定として `localStorage` に保存し、`data-theme` と CSS custom properties で適用する。テーマ候補はアプリ固有の Dark、Light、Midnight とする。

コードブロックの編集とシンタックスハイライトには、Crepe に同梱される CodeMirror feature を有効化する。追加のテーマ配布物や VS Code テーマの移植は行わない。

### Reason

CodeMirror feature は Crepe の公式 API で、コードブロックの編集・言語選択・syntax highlighting を一体で提供する。現在の依存グラフには CodeMirror が Crepe の間接依存として既に存在し、新規の実行時依存やライセンス確認対象を増やさずに利用できる。

VS Code 系テーマをそのまま採用すると、テーマごとのライセンス、配色の変換、Milkdown / ProseMirror との整合を継続して管理する必要がある。今回の要件には semantic token による独自配色の方が小さく、通常本文・リスト・選択・inline code・code block を同じ境界で切り替えられる。
