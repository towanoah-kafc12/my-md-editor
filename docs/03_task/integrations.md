# Integration Tasks

外部サービスやGitとの連携候補をまとめる。

現時点ではPlainmarkの中核機能より優先度を下げ、`docs/02_open/integrations-and-themes.md` で必要性と範囲が決まってから実装する。

## Git status表示

Status: 未着手

Priority: 低

Dependencies: `docs/02_open/integrations-and-themes.md` のGit範囲決定

Success criteria: 該当なし

### Work

- [ ] 実装前にこのタスクの内容を確認し、未確定事項 / 実装範囲 / 受入条件を必要な粒度まで詰める
- [ ] Gitリポジトリ内のMarkdownへ最小限のstatus表示を追加する
- [ ] modified / untrackedなど編集に必要な状態だけを対象にする
- [ ] Git未導入環境や非Gitフォルダで通常動作を維持する

### Done

- Git管理下のMarkdownについて最低限の変更状態をPlainmark上で確認できる

### Verification

### Progress

### Note

commit / push / branch操作は初期対象にしない。詳細方針は `docs/02_open/integrations-and-themes.md` を参照する。

## Notion連携

Status: 未着手

Priority: 低

Dependencies: `docs/02_open/integrations-and-themes.md` の同期範囲決定

Success criteria: 該当なし

### Work

- [ ] 実装前にこのタスクの内容を確認し、未確定事項 / 実装範囲 / 受入条件を必要な粒度まで詰める
- [ ] ローカルMarkdownを唯一の保存形式とする方針を崩さない連携方式を決める
- [ ] インポート / エクスポート / 一方向同期 / 双方向同期の対象範囲を決める
- [ ] 認証情報と競合時のデータ保護を設計する
- [ ] 決定した最小範囲を実装する

### Done

- 決定した範囲でNotionとの連携が行え、ローカルMarkdownを安全に維持できる

### Verification

### Progress

### Note

軽量ローカルエディタの中核から最も離れるため最後に扱う。詳細方針は `docs/02_open/integrations-and-themes.md` を参照する。
