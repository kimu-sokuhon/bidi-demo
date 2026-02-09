# ADK Samples ドキュメントインデックス

## 📚 コアドキュメント

### プロジェクト全体
- [**CLAUDE.md**](/CLAUDE.md) - Claudeプロジェクトガイド
- [**README.md**](/README.md) - プロジェクト概要
- [**プロジェクト開発ガイドライン**](/.claude/project.md) - 開発規約と標準

### ADK実装ガイド
- [**ADKエージェント実装ガイド（日本語）**](/docs/ADK_Agent_Implementation_Guide_JP.md) - 詳細な実装手順

## 🤖 エージェント別ドキュメント

### Python エージェント

#### Academic Research Agent
- **場所**: `/python/agents/academic-research/`
- [README.md](/python/agents/academic-research/README.md)
- **主要ファイル**:
  - [agent.py](/python/agents/academic-research/academic_research/agent.py)
  - [prompt.py](/python/agents/academic-research/academic_research/prompt.py)
- **サブエージェント**:
  - [academic_websearch](/python/agents/academic-research/academic_research/sub_agents/academic_websearch/)
  - [academic_newresearch](/python/agents/academic-research/academic_research/sub_agents/academic_newresearch/)

#### Blog Writer Agent
- **場所**: `/python/agents/blog-writer/`
- [README.md](/python/agents/blog-writer/README.md)
- **主要ファイル**:
  - [agent.py](/python/agents/blog-writer/blogger_agent/agent.py)
  - [tools.py](/python/agents/blog-writer/blogger_agent/tools.py)
- **サブエージェント**:
  - blog_planner
  - blog_writer
  - blog_editor
  - social_media_writer

## 🛠 カスタムスラッシュコマンド

### 調査・分析
- [**/investigate**](/.claude/commands/investigate.md) - コードベースの調査と分析

### 計画・設計
- [**/plan**](/.claude/commands/plan.md) - 実装計画の策定

### 実装
- [**/implement**](/.claude/commands/implement.md) - コードの実装

### テスト
- [**/test**](/.claude/commands/test.md) - テストの作成と実行

## 🔧 設定ファイルテンプレート

### Python エージェント用

#### pyproject.toml テンプレート
```toml
[project]
name = "agent-name"
version = "0.1.0"
dependencies = [
    "google-cloud-aiplatform[adk,agent-engines]>=1.93.0",
    "google-genai>=1.9.0",
    "pydantic>=2.10.6",
    "python-dotenv>=1.0.1",
    "google-adk>=1.0.0",
]
```

#### .env.example テンプレート
```bash
GOOGLE_GENAI_USE_VERTEXAI=1
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_CLOUD_STORAGE_BUCKET=your-bucket
```

## 📖 外部リソース

### ADK公式ドキュメント
- [ADK Documentation](https://google.github.io/adk-docs/)
- [ADK Python GitHub](https://github.com/google/adk-python)
- [ADK Go GitHub](https://github.com/google/adk-go)
- [ADK Java GitHub](https://github.com/google/adk-java)

### Google Cloud関連
- [Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
- [Agent Engine Documentation](https://cloud.google.com/vertex-ai/docs/agent-engine)
- [Gemini API Documentation](https://ai.google.dev/gemini-api/docs)

## 🚀 クイックリファレンス

### よく使うコマンド

#### エージェント実行
```bash
# CLIモード
uv run adk run agent_name

# Webインターフェース
uv run adk web

# 別ポート指定
uv run adk web --port 8001
```

#### 依存関係管理
```bash
# インストール
uv sync

# 開発用依存関係込み
uv sync --dev

# デプロイメント用
uv sync --group deployment
```

#### デプロイメント
```bash
# Vertex AIへデプロイ
uv run deployment/deploy.py --create

# エージェントリスト表示
uv run deployment/deploy.py --list

# エージェント削除
uv run deployment/deploy.py --delete --resource_id=ID
```

### よく使うインポート

```python
# ADKコアクラス
from google.adk.agents import LlmAgent, Agent
from google.adk.tools import FunctionTool
from google.adk.tools.agent_tool import AgentTool

# 組み込みツール
from google.adk.tools import google_search

# Vertex AI
import vertexai
from vertexai import agent_engines
from vertexai.preview.reasoning_engines import AdkApp
```

## 📝 トラブルシューティング

### よくある問題と解決策

| 問題 | 解決策 |
|------|--------|
| インポートエラー | `uv sync` で依存関係を再インストール |
| 認証エラー | `gcloud auth application-default login` |
| デプロイエラー | プロジェクトIDとバケット権限を確認 |
| モデルエラー | Geminiモデル名とバージョンを確認 |

---
*このインデックスは、ADKプロジェクトの全ドキュメントへの参照を提供します。*
*最終更新: 2025年12月*