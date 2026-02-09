# セットアップガイド - Shareholder Portal Login

## 環境構築

### 1. 仮想環境のセットアップ

```bash
# 仮想環境の作成（初回のみ）
python3 -m venv venv

# 仮想環境の有効化
source venv/bin/activate

# 依存パッケージのインストール
pip install firebase-admin pyjwt
pip install google-adk fastapi python-dotenv "uvicorn[standard]"
```

### 2. Firebase設定

#### Firebase Console設定
1. [Firebase Console](https://console.firebase.google.com) にアクセス
2. プロジェクト `dsk-agentspace-trial` を選択
3. Authentication > Sign-in method > メール/パスワード を有効化
4. テストユーザーを作成

#### Firebase Admin SDK設定（バックエンド用）

以下のいずれかの方法で設定：

**方法1: サービスアカウントキー使用**
1. Firebase Console > プロジェクトの設定 > サービスアカウント
2. 「新しい秘密鍵の生成」をクリック
3. ダウンロードしたJSONファイルを `app/` ディレクトリに保存
4. 環境変数を設定：
```bash
export FIREBASE_SERVICE_ACCOUNT_PATH="app/firebase-admin-key.json"
```

**方法2: 環境変数で直接設定**
```bash
export FIREBASE_ADMIN_CREDENTIALS='{"type":"service_account","project_id":"..."}'
```

**方法3: Application Default Credentials（開発環境）**
```bash
gcloud auth application-default login
```

### 3. アプリケーション起動

```bash
# 仮想環境を有効化
source venv/bin/activate

# アプリケーション起動
cd app
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 4. アクセス

1. ブラウザで http://localhost:8000 にアクセス
2. 自動的にログインページ（/login）にリダイレクト
3. Firebase Consoleで作成したテストユーザーでログイン

## トラブルシューティング

### Firebase Admin SDK初期化エラー
- 環境変数が正しく設定されているか確認
- サービスアカウントキーファイルのパスが正しいか確認

### ログインできない
- Firebase Consoleでメール/パスワード認証が有効か確認
- ユーザーが作成されているか確認
- ブラウザのコンソールでエラーを確認

### WebSocket接続エラー
- トークンが正しくsessionStorageに保存されているか確認
- ブラウザの開発者ツールでネットワークタブを確認

## セキュリティ注意事項

- Firebase認証情報は絶対にGitにコミットしない
- 本番環境では必ずHTTPS（WSS）を使用
- 環境変数は安全に管理する

## 開発モード無効化

認証を必須にする場合、`app/main.py` の以下の行を変更：

```python
# 認証を必須にする
require_auth_for_main = True  # False から True に変更
```

## 依存パッケージ一覧

### Python パッケージ
- firebase-admin
- pyjwt
- google-adk
- fastapi
- python-dotenv
- uvicorn[standard]

### JavaScript ライブラリ（CDN）
- Firebase JS SDK v10.7.1