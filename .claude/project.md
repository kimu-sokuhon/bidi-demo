# ADK プロジェクト開発ガイドライン

## 開発規約

### ADKエージェント実装標準

#### 1. エージェントタイプの選択基準

| タイプ | 使用場面 | モデル推奨 |
|--------|----------|------------|
| `LlmAgent` | Gemini専用、シンプルなタスク | gemini-2.5-pro/flash |
| `Agent` | 汎用、複雑なワークフロー | 任意のモデル |

#### 2. ファイル命名規則

```
エージェント名_用途.py
例: academic_research_agent.py
    blog_writer_sub_agent.py
```

#### 3. プロンプト設計パターン

```python
# prompt.py
AGENT_PROMPT = """
## 役割
{役割の明確な定義}

## 入力
- {期待される入力形式}

## 処理手順
1. {ステップ1}
2. {ステップ2}
...

## 出力形式
{構造化された出力形式}

## 制約
- {制約1}
- {制約2}
"""
```

### コーディングスタイル

#### Python規約
```python
# 型ヒントを必ず使用
def process_data(input_data: str) -> dict:
    """
    関数の説明（Google Style Docstring）

    Args:
        input_data: 入力データの説明

    Returns:
        処理結果の辞書

    Raises:
        ValueError: 入力が不正な場合
    """
    pass
```

#### インポート順序
1. 標準ライブラリ
2. サードパーティライブラリ
3. Google ADK関連
4. プロジェクト内部モジュール

```python
# 正しいインポート順
import os
import json
from datetime import datetime

import pandas as pd
from pydantic import BaseModel

from google.adk.agents import LlmAgent
from google.adk.tools import google_search

from .prompt import MAIN_PROMPT
from .tools import custom_tool
```

### サブエージェント設計

#### 階層構造
```
main_agent (オーケストレーター)
├── research_agent (情報収集)
├── analysis_agent (分析)
└── output_agent (出力整形)
```

#### 責任分離原則
- 各エージェントは単一の責任を持つ
- エージェント間の依存を最小限に
- 明確なインターフェース定義

### ツール実装

#### カスタムツール標準
```python
from typing import Dict, Any

def custom_tool(
    param1: str,
    param2: int = 10,
    **kwargs: Any
) -> Dict[str, Any]:
    """
    ツールの説明

    Args:
        param1: 必須パラメータ
        param2: オプションパラメータ（デフォルト: 10）
        **kwargs: 追加パラメータ

    Returns:
        結果を含む辞書
    """
    try:
        # 処理ロジック
        result = process(param1, param2)
        return {
            "status": "success",
            "data": result
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }
```

### テスト方針

#### テストカバレッジ目標
- ユニットテスト: 80%以上
- 統合テスト: 主要フロー100%
- E2Eテスト: クリティカルパス100%

#### テストファイル構造
```
tests/
├── unit/
│   ├── test_agent.py
│   └── test_tools.py
├── integration/
│   └── test_workflow.py
└── e2e/
    └── test_full_flow.py
```

#### テスト命名規則
```python
def test_機能_条件_期待結果():
    """
    例: test_agent_with_valid_input_returns_success
    """
    pass
```

### デプロイメント

#### 環境別設定
```python
# config.py
import os
from enum import Enum

class Environment(Enum):
    LOCAL = "local"
    STAGING = "staging"
    PRODUCTION = "production"

ENV = Environment(os.getenv("ENVIRONMENT", "local"))

CONFIG = {
    Environment.LOCAL: {
        "model": "gemini-2.5-flash",
        "timeout": 30
    },
    Environment.STAGING: {
        "model": "gemini-2.5-pro",
        "timeout": 60
    },
    Environment.PRODUCTION: {
        "model": "gemini-2.5-pro",
        "timeout": 120
    }
}[ENV]
```

#### デプロイチェックリスト
- [ ] 環境変数の確認
- [ ] 依存関係のバージョン固定
- [ ] テスト全パス
- [ ] ログ設定の確認
- [ ] エラーハンドリングの実装
- [ ] ドキュメント更新

### パフォーマンス最適化

#### モデル選択ガイド
- **gemini-2.5-flash**: レスポンス速度重視、簡単なタスク
- **gemini-2.5-pro**: 精度重視、複雑な推論

#### キャッシング戦略
```python
from functools import lru_cache

@lru_cache(maxsize=128)
def expensive_operation(input_data: str) -> str:
    """キャッシュ可能な処理"""
    pass
```

### セキュリティ

#### 環境変数管理
- 絶対に秘密情報をコードにハードコードしない
- `.env`ファイルは`.gitignore`に追加
- `.env.example`で必要な変数を文書化

#### 入力検証
```python
from pydantic import BaseModel, validator

class InputModel(BaseModel):
    text: str

    @validator('text')
    def validate_text(cls, v):
        if len(v) > 10000:
            raise ValueError('Text too long')
        return v
```

### ログとモニタリング

#### ログレベル
```python
import logging

logger = logging.getLogger(__name__)

# 使用例
logger.debug("詳細なデバッグ情報")
logger.info("通常の情報")
logger.warning("警告メッセージ")
logger.error("エラー情報")
logger.critical("致命的なエラー")
```

#### メトリクス収集
- レスポンス時間
- エラー率
- トークン使用量
- API呼び出し回数

### ドキュメンテーション

#### 必須ドキュメント
1. README.md - プロジェクト概要と使用方法
2. ARCHITECTURE.md - システム設計
3. API.md - APIリファレンス
4. CHANGELOG.md - 変更履歴

#### コメント規約
```python
# TODO: 実装予定の機能
# FIXME: 修正が必要な箇所
# HACK: 一時的な回避策
# NOTE: 重要な注意事項
```

---
*このドキュメントは、ADKプロジェクトの開発標準を定義しています。*
*全ての開発者はこれらのガイドラインに従ってください。*