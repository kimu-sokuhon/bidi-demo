## 📁 Claudeの設定

```
├── .claude/                    # Claude設定とカスタムコマンド
│   └── commands/              # カスタムスラッシュコマンド
│       ├── investigate.md    # /investigate - 調査フェーズ
│       ├── plan.md           # /plan - 計画フェーズ
│       ├── implement.md      # /implement - 実装フェーズ
│       └── test.md           # /test - テストフェーズ

```

## 🛠 開発ワークフロー

### カスタムスラッシュコマンド

Claudeは以下のスラッシュコマンドを使用して効率的な開発をサポートします：

1. **`/investigate [タスク]`** - コードベースの調査と分析
2. **`/plan [実装内容]`** - 実装計画の策定
3. **`/implement [機能]`** - コードの実装
4. **`/test [対象]`** - テストの作成と実行

### 標準的な開発フロー

```mermaid
graph LR
    A[要件定義] --> B[/investigate]
    B --> C[/plan]
    C --> D[/implement]
    D --> E[/test]
    E --> F[デプロイ]
```

1. プロジェクト概要 (Project Overview)
プロダクト名: Kuroko Realtime (仮称: AI参謀 / Shadow Advisor) 目的: 株主総会や記者会見において、登壇者（役員）が回答に詰まることを防ぐためのリアルタイム回答支援システム。 