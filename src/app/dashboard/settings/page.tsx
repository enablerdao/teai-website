'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import { Loader2, Info, Eye, EyeOff, ExternalLink, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// --- 型定義 --- 
// Removed AwsCredentials

// Base Setting Definition for OpenHands
interface BaseSettingDefinition {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'enum' | 'list' | 'dict';
  description?: string;
  sensitive?: boolean;
  defaultValue?: any;
  dependsOn?: { key: string; value: string | string[] };
}

interface StringSetting extends BaseSettingDefinition { type: 'string'; }
interface NumberSetting extends BaseSettingDefinition { type: 'number'; }
interface BooleanSetting extends BaseSettingDefinition { type: 'boolean'; }
interface EnumSetting extends BaseSettingDefinition { type: 'enum'; options: string[]; }
interface ListSetting extends BaseSettingDefinition { type: 'list'; }
interface DictSetting extends BaseSettingDefinition { type: 'dict'; }

type OpenHandsSettingDefinition = StringSetting | NumberSetting | BooleanSetting | EnumSetting | ListSetting | DictSetting;

interface SectionContent {
  [key: string]: OpenHandsSettingDefinition[];
}
interface ConfigStructure {
  [key: string]: OpenHandsSettingDefinition[] | SectionContent;
}

// --- 設定定義 --- 
const LANGUAGES = [
  { value: 'ja', label: '日本語' },
  { value: 'en', label: 'English' },
];

// --- OpenHands設定定義 (日本語説明付き) ---
const openHandsSettingsConfig: ConfigStructure = {
  core: [
    { key: 'e2b_api_key', label: 'E2B APIキー', type: 'string', description: 'E2Bサンドボックスを利用する場合のAPIキーです。E2Bはクラウドベースの安全な実行環境を提供します。', sensitive: true },
    { key: 'modal_api_token_id', label: 'Modal APIトークンID', type: 'string', description: 'Modalを利用する場合のAPIトークンIDです。Modalはスケーラブルなクラウドコンピューティングプラットフォームです。', sensitive: true },
    { key: 'modal_api_token_secret', label: 'Modal APIトークンシークレット', type: 'string', description: 'Modalを利用する場合のAPIトークンシークレットです。', sensitive: true },
    { key: 'daytona_api_key', label: 'Daytona APIキー', type: 'string', description: 'Daytonaを利用する場合のAPIキーです。Daytonaは開発環境管理ツールです。', sensitive: true },
    { key: 'daytona_target', label: 'Daytonaターゲット', type: 'string', description: 'Daytonaで利用するターゲットを指定します。', defaultValue: "" },
    { key: 'workspace_base', label: 'ワークスペース ベースパス', type: 'string', description: 'OpenHandsがファイル操作を行う際の基準となるローカルディレクトリパスです。', defaultValue: './workspace' },
    { key: 'cache_dir', label: 'キャッシュディレクトリパス', type: 'string', description: '一時的なキャッシュファイルを保存するディレクトリのパスです。', defaultValue: '/tmp/cache' },
    { key: 'reasoning_effort', label: '推論の精度 (o1モデル)', type: 'enum', options: ['low', 'medium', 'high', 'not set'], description: 'o1モデル使用時の推論精度レベルを選択します。精度が高いほどコストが増加する可能性があります。', defaultValue: 'medium' },
    { key: 'debug', label: 'デバッグモード有効化', type: 'boolean', description: '有効にすると、詳細なデバッグ情報がログに出力されます。', defaultValue: false },
    { key: 'disable_color', label: 'ターミナル出力の色を無効化', type: 'boolean', description: '有効にすると、ターミナル出力の色表示が無効になります。', defaultValue: false },
    { key: 'save_trajectory_path', label: '軌跡の保存パス', type: 'string', description: 'エージェントの動作履歴（軌跡）を保存するパスです。フォルダまたはファイル名を指定できます。', defaultValue: './trajectories' },
    { key: 'save_screenshots_in_trajectory', label: '軌跡にスクリーンショットを保存', type: 'boolean', description: '有効にすると、軌跡JSONファイル内にスクリーンショットがエンコードされて保存されます。ファイルサイズが非常に大きくなる可能性があります。', defaultValue: false },
    { key: 'replay_trajectory_path', label: '軌跡のリプレイパス', type: 'string', description: '指定された軌跡ファイルを読み込み、エージェントの動作を再現します。ファイルパスを指定する必要があります。', defaultValue: "" },
    { key: 'file_store_path', label: 'ファイルストアパス', type: 'string', description: 'エージェントが利用するファイルストアのパスです。', defaultValue: '/tmp/file_store' },
    { key: 'file_store', label: 'ファイルストアタイプ', type: 'enum', options: ['memory', 'file'], description: 'ファイルストアの種類を選択します。\'memory\'はメモリ上、\'file\'はディスク上に保存します。', defaultValue: 'memory' },
    { key: 'file_uploads_max_file_size_mb', label: '最大アップロードファイルサイズ (MB)', type: 'number', description: 'ユーザーがアップロードできるファイルの最大サイズ（メガバイト単位）です。', defaultValue: 0 },
    { key: 'max_budget_per_task', label: 'タスクごとの最大予算', type: 'number', description: '1つのタスクで消費できる最大予算（USDなど）です。0.0は無制限を意味します。', defaultValue: 0.0 },
    { key: 'max_iterations', label: '最大イテレーション数', type: 'number', description: '1つのタスクにおけるエージェントの最大思考回数（反復回数）です。', defaultValue: 250 },
    { key: 'workspace_mount_path_in_sandbox', label: 'ワークスペースマウントパス (サンドボックス内)', type: 'string', description: 'サンドボックス（Dockerコンテナなど）内でワークスペースをマウントするパスです。', defaultValue: '/workspace' },
    { key: 'workspace_mount_path', label: 'ワークスペースマウントパス (ホスト)', type: 'string', description: 'ホストマシン上でワークスペースとしてマウントするディレクトリのパスです。', defaultValue: "" },
    { key: 'workspace_mount_rewrite', label: 'ワークスペースマウントパスの書き換え', type: 'string', description: 'サンドボックス内のマウントパスを、ホスト上の別のパスに書き換えます。', defaultValue: "" },
    { key: 'run_as_openhands', label: 'OpenHandsとして実行', type: 'boolean', description: 'サンドボックス内でOpenHandsユーザーとしてプロセスを実行します。', defaultValue: true },
    { key: 'runtime', label: 'ランタイム環境', type: 'enum', options: ['docker', 'e2b'], description: 'コード実行に使用するサンドボックス環境を選択します。\'docker\'はローカル、\'e2b\'はクラウド環境です。', defaultValue: 'docker' },
    { key: 'default_agent', label: 'デフォルトエージェント', type: 'string', description: 'デフォルトで使用するエージェントのクラス名です。', defaultValue: 'CodeActAgent' },
    { key: 'jwt_secret', label: 'JWTシークレット', type: 'string', description: 'WebSocket接続などの認証に使用するJWT（JSON Web Token）のシークレットキーです。', sensitive: true },
    { key: 'file_uploads_restrict_file_types', label: 'アップロードファイルの種類を制限', type: 'boolean', description: '有効にすると、指定された拡張子のファイルのみアップロードを許可します。', defaultValue: false },
    { key: 'file_uploads_allowed_extensions', label: '許可するアップロード拡張子', type: 'list', description: 'アップロードを許可するファイルの拡張子リストです。正規表現も使用可能です。', defaultValue: ['.*'] },
    { key: 'enable_default_condenser', label: 'デフォルトLLM要約Condenserを有効化', type: 'boolean', description: 'Condenserが指定されていない場合に、デフォルトでLLMによる会話履歴の要約機能（LLMSummarizingCondenser）を使用するかどうか。Falseの場合は要約しません（NoOpCondenser）。', defaultValue: true },
    { key: 'max_concurrent_conversations', label: '最大同時会話数', type: 'number', description: '1ユーザーあたりの同時にアクティブにできる会話の最大数です。', defaultValue: 3 },
    { key: 'conversation_max_age_seconds', label: '会話の最大保持期間 (秒)', type: 'number', description: '会話が自動的にクローズされるまでの最大時間（秒単位）です。', defaultValue: 864000 },
  ],
  llm: {
    default: [
      { key: 'aws_access_key_id', label: 'AWS アクセスキーID', type: 'string', description: 'BedrockなどAWS上のLLMを利用する場合のアクセスキーIDです。', sensitive: true },
      { key: 'aws_region_name', label: 'AWS リージョン名', type: 'string', description: 'BedrockなどAWS上のLLMを利用する際のリージョン名です。', defaultValue: "" },
      { key: 'aws_secret_access_key', label: 'AWS シークレットアクセスキー', type: 'string', description: 'BedrockなどAWS上のLLMを利用する場合のシークレットアクセスキーです。', sensitive: true },
      { key: 'api_key', label: 'APIキー (CLI/ヘッドレス)', type: 'string', description: 'デフォルトで使用するLLM APIキーです。Web UIではセッションごとに上書きされます。', sensitive: true },
      { key: 'base_url', label: 'APIベースURL (CLI/ヘッドレス)', type: 'string', description: 'デフォルトで使用するLLM APIのベースURLです。Web UIではセッションごとに上書きされます。', defaultValue: "" },
      { key: 'api_version', label: 'APIバージョン', type: 'string', description: '使用するLLM APIのバージョンを指定します（Azure OpenAIなどで利用）。', defaultValue: "" },
      { key: 'input_cost_per_token', label: '入力トークン単価', type: 'number', description: 'LLMの入力トークンあたりのコストです（コスト計算用）。', defaultValue: 0.0 },
      { key: 'output_cost_per_token', label: '出力トークン単価', type: 'number', description: 'LLMの出力トークンあたりのコストです（コスト計算用）。', defaultValue: 0.0 },
      { key: 'custom_llm_provider', label: 'カスタムLLMプロバイダー', type: 'string', description: 'LiteLLMでサポートされていないカスタムプロバイダーを使用する場合に指定します。', defaultValue: "" },
      { key: 'max_message_chars', label: '最大メッセージ文字数', type: 'number', description: '観測(Observation)の内容コンテンツにおける最大文字数です。', defaultValue: 10000 },
      { key: 'max_input_tokens', label: '最大入力トークン数', type: 'number', description: 'LLMへの入力として許容される最大のトークン数です。0はモデルのデフォルト値を使用します。', defaultValue: 0 },
      { key: 'max_output_tokens', label: '最大出力トークン数', type: 'number', description: 'LLMからの出力として許容される最大のトークン数です。0はモデルのデフォルト値を使用します。', defaultValue: 0 },
      { key: 'model', label: 'モデル名 (CLI/ヘッドレス)', type: 'string', description: 'デフォルトで使用するLLMモデル名です。Web UIではセッションごとに上書きされます。', defaultValue: 'gpt-4o' },
      { key: 'num_retries', label: 'リトライ回数', type: 'number', description: 'LLM API呼び出しが失敗した場合に再試行する最大回数です。', defaultValue: 8 },
      { key: 'retry_max_wait', label: 'リトライ最大待機時間 (秒)', type: 'number', description: 'リトライ間の最大待機時間（秒）です。指数バックオフの上限を設定します。', defaultValue: 120 },
      { key: 'retry_min_wait', label: 'リトライ最小待機時間 (秒)', type: 'number', description: '最初のリトライまでの最小待機時間（秒）です。', defaultValue: 15 },
      { key: 'retry_multiplier', label: 'リトライ乗数', type: 'number', description: '指数バックオフの乗数です。失敗ごとに待機時間がこの倍率で増加します。', defaultValue: 2.0 },
      { key: 'drop_params', label: '未マップパラメータを無視', type: 'boolean', description: 'LiteLLMがサポートしていないパラメータをエラーとせずに無視します。', defaultValue: false },
      { key: 'modify_params', label: 'パラメータを修正 (LiteLLM)', type: 'boolean', description: 'LiteLLMによるパラメータ変換（空メッセージへのデフォルト追加など）を有効にします。注意：グローバル設定です。', defaultValue: true },
      { key: 'caching_prompt', label: 'プロンプトキャッシュ有効化', type: 'boolean', description: 'LLMプロバイダーがサポートしている場合、プロンプトキャッシュ機能を使用します。', defaultValue: true },
      { key: 'ollama_base_url', label: 'Ollama ベースURL', type: 'string', description: 'ローカルでOllamaを実行している場合のAPIベースURLです。', defaultValue: "" },
      { key: 'temperature', label: 'Temperature', type: 'number', description: 'LLMの応答のランダム性を制御します。値が高いほど多様な応答になります。', defaultValue: 0.0 },
      { key: 'timeout', label: 'タイムアウト (秒)', type: 'number', description: 'LLM API呼び出しのタイムアウト時間（秒）です。', defaultValue: 0 },
      { key: 'top_p', label: 'Top P', type: 'number', description: 'Temperatureと同様に、応答の多様性を制御するパラメータです（Nucleus Sampling）。', defaultValue: 1.0 },
      { key: 'disable_vision', label: '画像処理を無効化', type: 'boolean', description: 'モデルが画像入力に対応している場合でも、画像処理を無効にします（コスト削減などに有効）。', defaultValue: true },
      { key: 'custom_tokenizer', label: 'カスタムトークナイザー', type: 'string', description: 'トークン数計算に使用するカスタムトークナイザーを指定します。', defaultValue: "" },
      { key: 'native_tool_calling', label: 'ネイティブツール呼び出し', type: 'enum', options: ['true', 'false', 'None'], description: 'モデルがネイティブツール呼び出し（Function Calling）に対応している場合、それを使用するかどうか。Noneはモデルのデフォルト動作に従います。注意：有効にすると性能が低下する場合があります。', defaultValue: 'None' },
    ],
    'gpt4o-mini': [
      { key: 'api_key', label: 'GPT-4o Mini APIキー', type: 'string', description: 'GPT-4o Miniモデル専用のAPIキーです。', sensitive: true },
      { key: 'model', label: 'GPT-4o Mini モデル名', type: 'string', description: 'GPT-4o Miniとして使用するモデル名を指定します。', defaultValue: 'gpt-4o' },
    ],
    condenser: [
      { key: 'model', label: 'Condenser LLMモデル', type: 'string', description: '会話履歴の要約（Condenser）に使用するLLMモデル名を指定します。', defaultValue: 'gpt-4o' },
      { key: 'temperature', label: 'Condenser LLM Temperature', type: 'number', description: 'Condenser用LLMのTemperatureです。', defaultValue: 0.1 },
      { key: 'max_tokens', label: 'Condenser LLM 最大トークン数', type: 'number', description: 'Condenser用LLMの最大出力トークン数です。', defaultValue: 1024 },
    ],
  },
  agent: {
    default: [
      { key: 'codeact_enable_browsing', label: 'ブラウジング有効化 (CodeAct)', type: 'boolean', description: 'CodeActAgentでウェブブラウジングツールを有効にするかどうか。', defaultValue: true },
      { key: 'codeact_enable_llm_editor', label: 'LLMエディタ有効化 (CodeAct)', type: 'boolean', description: 'CodeActAgentでLLMによるコード編集支援機能を有効にするかどうか。', defaultValue: false },
      { key: 'codeact_enable_jupyter', label: 'Jupyter有効化 (CodeAct)', type: 'boolean', description: 'CodeActAgentでIPython (Jupyter) ツールを有効にするかどうか。', defaultValue: true },
      { key: 'llm_config', label: 'LLM設定グループ', type: 'string', description: 'このエージェントが使用するLLM設定のグループ名を指定します（例: \'gpt4o-mini\'）。未指定の場合はデフォルトLLMを使用します。', defaultValue: "" },
      { key: 'enable_prompt_extensions', label: 'プロンプト拡張有効化', type: 'boolean', description: 'マイクロエージェントやリポジトリ/ランタイム情報などのプロンプト拡張機能を使用するかどうか。', defaultValue: true },
      { key: 'disabled_microagents', label: '無効化するマイクロエージェント', type: 'list', description: '使用しないマイクロエージェントのリストを指定します。', defaultValue: [] },
      { key: 'enable_history_truncation', label: '履歴切り捨て有効化', type: 'boolean', description: 'LLMのコンテキスト長制限に達した場合に、古い履歴を切り捨ててセッションを続行するかどうか。', defaultValue: true },
    ],
    RepoExplorerAgent: [
      { key: 'llm_config', label: 'RepoExplorer LLM設定', type: 'string', description: 'RepoExplorerAgentが使用するLLM設定グループ名です（例: \'gpt3\'）。コスト削減のために低価格モデルを指定するのに役立ちます。', defaultValue: 'gpt3' },
    ],
  },
  sandbox: [
    { key: 'timeout', label: 'タイムアウト (秒)', type: 'number', description: 'サンドボックスの操作タイムアウト時間（秒）です。', defaultValue: 120 },
    { key: 'user_id', label: 'ユーザーID', type: 'number', description: 'サンドボックス内で使用されるユーザーIDです。', defaultValue: 1000 },
    { key: 'base_container_image', label: 'ベースコンテナイメージ', type: 'string', description: 'サンドボックス構築の基となるDockerイメージ名です。', defaultValue: 'nikolaik/python-nodejs:python3.12-nodejs22' },
    { key: 'use_host_network', label: 'ホストネットワークを使用', type: 'boolean', description: 'サンドボックスでホストマシンのネットワークを使用するかどうか。', defaultValue: false },
    { key: 'runtime_extra_build_args', label: 'ランタイム追加ビルド引数', type: 'list', description: 'Dockerイメージビルド時に追加する引数のリストです。', defaultValue: ["--network=host", "--add-host=host.docker.internal:host-gateway"] },
    { key: 'enable_auto_lint', label: '自動Lint有効化', type: 'boolean', description: 'コード編集後に自動的にLintを実行するかどうか。', defaultValue: false },
    { key: 'initialize_plugins', label: 'プラグイン初期化', type: 'boolean', description: 'サンドボックス起動時にプラグインを初期化するかどうか。', defaultValue: true },
    { key: 'runtime_extra_deps', label: 'ランタイム追加依存関係', type: 'string', description: 'ランタイムイメージに追加でインストールする依存パッケージ（例: \'ffmpeg\'）。', defaultValue: "" },
    { key: 'runtime_startup_env_vars', label: 'ランタイム起動時環境変数', type: 'dict', description: 'ランタイム起動時に設定する環境変数をJSON形式で指定します。', defaultValue: {} },
    { key: 'browsergym_eval_env', label: 'BrowserGym評価環境', type: 'string', description: '評価に使用するBrowserGym環境名を指定します。', defaultValue: "" },
    { key: 'platform', label: 'プラットフォーム', type: 'string', description: 'ランタイムイメージをビルドするプラットフォームを指定します（例: "linux/amd64"）。', defaultValue: "" },
    { key: 'force_rebuild_runtime', label: 'ランタイム強制再ビルド', type: 'boolean', description: '既存のランタイムイメージがあっても強制的に再ビルドします。', defaultValue: false },
    { key: 'runtime_container_image', label: 'ランタイムコンテナイメージ', type: 'string', description: '使用するランタイムコンテナイメージ名。未指定の場合はベースイメージからビルドされます。', defaultValue: "" },
    { key: 'keep_runtime_alive', label: 'ランタイム維持', type: 'boolean', description: 'セッション終了後もランタイムを維持（停止しない）するかどうか。', defaultValue: false },
    { key: 'pause_closed_runtimes', label: '閉じたランタイムを一時停止', type: 'boolean', description: '閉じたランタイムを停止する代わりに一時停止状態にするかどうか。', defaultValue: false },
    { key: 'close_delay', label: '閉じるまでの遅延 (秒)', type: 'number', description: 'アイドル状態のランタイムを閉じるまでの遅延時間（秒）です。', defaultValue: 300 },
    { key: 'rm_all_containers', label: '全コンテナ削除', type: 'boolean', description: 'ランタイム停止時に関連する全てのコンテナを削除するかどうか。', defaultValue: false },
    { key: 'enable_gpu', label: 'GPUサポート有効化', type: 'boolean', description: 'ランタイムでGPUサポートを有効にするかどうか。', defaultValue: false },
    { key: 'docker_runtime_kwargs', label: '追加Dockerランタイム引数', type: 'dict', description: 'Dockerランタイム起動時に追加するキーワード引数をJSON形式で指定します。', defaultValue: {} },
  ],
  security: [
    { key: 'confirmation_mode', label: '確認モード (CLI/ヘッドレス)', type: 'boolean', description: 'エージェントが危険な操作（コマンド実行など）を行う前にユーザーに確認を求めるモードを有効にします。Web UIではセッションごとに上書きされます。', defaultValue: false },
    { key: 'security_analyzer', label: 'セキュリティアナライザー (CLI/ヘッドレス)', type: 'string', description: '使用するセキュリティアナライザーを指定します。Web UIではセッションごとに上書きされます。', defaultValue: "" },
    { key: 'enable_security_analyzer', label: 'セキュリティアナライザー有効化', type: 'boolean', description: 'セキュリティアナライザーによるチェックを有効にするかどうか。', defaultValue: false },
  ],
  condenser: [
    { key: 'type', label: 'Condenserタイプ', type: 'enum', options: ['noop', 'observation_masking', 'recent', 'llm', 'amortized', 'llm_attention'], description: '会話履歴の管理・圧縮方法を選択します。\'noop\'は圧縮なし、\'llm\'はLLMで要約、など。', defaultValue: 'noop' },
    { key: 'attention_window', label: '注意ウィンドウ (Observation Masking)', type: 'number', description: 'Observation Masking使用時、最新のいくつのイベントの観測内容をマスクせずに保持するか。', dependsOn: { key: 'condenser.type', value: 'observation_masking' }, defaultValue: 100 },
    { key: 'keep_first', label: '先頭保持イベント数', type: 'number', description: '常に履歴の先頭に保持するイベント数（通常はタスク説明など）。\'recent\' \'llm\' \'amortized\' \'llm_attention\' で使用。', dependsOn: { key: 'condenser.type', value: ['recent', 'llm', 'amortized', 'llm_attention'] }, defaultValue: 1 },
    { key: 'max_events', label: '最大イベント数 (Recent)', type: 'number', description: 'Recent Condenser使用時に保持する最大イベント数。', dependsOn: { key: 'condenser.type', value: 'recent' }, defaultValue: 100 },
    { key: 'llm_config', label: 'LLM設定 (LLM Condensers)', type: 'string', description: 'LLMベースのCondenser (llm, llm_attention) が使用するLLM設定グループ名。', dependsOn: { key: 'condenser.type', value: ['llm', 'llm_attention'] }, defaultValue: 'condenser' },
    { key: 'max_size', label: '最大サイズ (圧縮前)', type: 'number', description: '履歴圧縮がトリガーされる前の最大サイズ（イベント数など）。\'llm\' \'amortized\' \'llm_attention\' で使用。', dependsOn: { key: 'condenser.type', value: ['llm', 'amortized', 'llm_attention'] }, defaultValue: 100 },
  ],
  eval: [
  ],
};

// --- ヘルパー関数（OpenHands設定用） ---
const flattenOpenHandsConfig = (config: ConfigStructure): Record<string, OpenHandsSettingDefinition> => {
  const flat: Record<string, OpenHandsSettingDefinition> = {};
  Object.entries(config).forEach(([sectionKey, sectionContent]) => {
    if (Array.isArray(sectionContent)) {
      sectionContent.forEach(setting => {
        flat[`${sectionKey}.${setting.key}`] = setting as OpenHandsSettingDefinition;
      });
    } else { // Nested section
      Object.entries(sectionContent).forEach(([subSectionKey, settingsArray]) => {
        settingsArray.forEach(setting => {
          flat[`${sectionKey}.${subSectionKey}.${setting.key}`] = setting as OpenHandsSettingDefinition;
        });
      });
    }
  });
  return flat;
};

const flattenedOpenHandsConfig = flattenOpenHandsConfig(openHandsSettingsConfig);

const getOpenHandsDefaultValues = () => {
  const defaults: Record<string, any> = {};
  Object.entries(flattenedOpenHandsConfig).forEach(([keyPath, setting]) => {
    if (setting.defaultValue !== undefined) {
      defaults[keyPath] = setting.defaultValue;
    }
  });
  return defaults;
};

export default function SettingsPage() {
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // State for General Settings
  const [language, setLanguage] = useState('ja');
  // Removed state for API Keys, SSH, AWS from this component

  // State for OpenHands Settings
  const [openHandsSettings, setOpenHandsSettings] = useState<Record<string, any>>(getOpenHandsDefaultValues());

  // --- データ取得 --- 
  useEffect(() => {
    const fetchAllSettings = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not found.");

        // Fetch user_settings (language)
        const { data: userSettings, error: userSettingsError } = await supabase
          .from('user_settings')
          .select('language') // Only fetch language here
          .eq('user_id', user.id)
          .single();
        
        if (userSettingsError && userSettingsError.code !== 'PGRST116') throw userSettingsError;

        setLanguage(userSettings?.language || 'ja');

        // Removed fetching logic for SSH, AWS, other env vars

        // TODO: Fetch actual OpenHands settings
        setOpenHandsSettings(getOpenHandsDefaultValues());

      } catch (error: any) {
        toast.error('設定の読み込みに失敗しました。');
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllSettings();
  }, [supabase]);

  // --- UIハンドラー --- 
  // Removed toggleVisibility

  const handleOpenHandsSettingChange = (keyPath: string, value: any) => {
    setOpenHandsSettings(prev => ({
      ...prev,
      [keyPath]: value,
    }));
  };

  // --- 保存処理 --- 
  const handleSave = async () => {
    setSaving(true);
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not found.");

        // Update user_settings (language only)
        const { error: userSettingsError } = await supabase
            .from('user_settings')
            .upsert({ 
                user_id: user.id,
                language: language,
                // Removed ssh_public_key
            }, { onConflict: 'user_id' });
        if (userSettingsError) throw userSettingsError;

        // Removed AWS credential saving logic

        // Convert flat OpenHands state back to nested TOML-like structure for saving
        const openHandsSettingsToSave = {};
        Object.entries(openHandsSettings).forEach(([keyPath, value]) => {
            const parts = keyPath.split('.');
            let currentLevel: any = openHandsSettingsToSave;
            for (let i = 0; i < parts.length - 1; i++) {
                const part = parts[i];
                if (!currentLevel[part]) currentLevel[part] = {};
                currentLevel = currentLevel[part];
            }
            const settingDef = flattenedOpenHandsConfig[keyPath];
            let finalValue = value;
            if (settingDef) {
                if (settingDef.type === 'number') {
                    finalValue = Number(value);
                    if (isNaN(finalValue)) finalValue = settingDef.defaultValue ?? 0;
                } else if (settingDef.type === 'boolean') {
                    finalValue = Boolean(value);
                } else if (settingDef.type === 'list') {
                    finalValue = Array.isArray(value) ? value.map(String) : (String(value).split('\n').filter(s => s.trim() !== '') ?? []);
                } else if (settingDef.type === 'dict') {
                    if (typeof value === 'string') {
                        try { finalValue = JSON.parse(value); } catch (e) { finalValue = settingDef.defaultValue ?? {}; }
                    } else if (typeof value !== 'object' || value === null) {
                         finalValue = settingDef.defaultValue ?? {};
                    }
                } else {
                     finalValue = String(value);
                }
            }
            currentLevel[parts[parts.length - 1]] = finalValue;
        });
        // TODO: Implement API call to save `openHandsSettingsToSave`
        console.log("Saving OpenHands settings (nested)... (mock)", openHandsSettingsToSave);

        toast.success('設定が保存されました！');

    } catch (error: any) {
        toast.error(`設定の保存に失敗しました: ${error.message}`);
        console.error('Error saving settings:', error);
    } finally {
        setSaving(false);
    }
  };

  // --- OpenHands設定のレンダリング --- 
  const renderOpenHandsSettingInput = (keyPath: string, setting: OpenHandsSettingDefinition) => {
    const currentValue = openHandsSettings[keyPath] ?? setting.defaultValue ?? '';

    if (setting.dependsOn) {
      const dependencyKey = setting.dependsOn.key;
      const dependencyValue = openHandsSettings[dependencyKey] ?? flattenedOpenHandsConfig[dependencyKey]?.defaultValue;
      const expectedValue = setting.dependsOn.value;
      const shouldRender = Array.isArray(expectedValue)
        ? expectedValue.includes(dependencyValue)
        : dependencyValue === expectedValue;
      if (!shouldRender) return null;
    }

    const inputProps = {
      id: keyPath,
      value: currentValue,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleOpenHandsSettingChange(keyPath, e.target.value),
      defaultValue: setting.defaultValue,
    };

    switch (setting.type) {
      case 'string':
        return <Input {...inputProps} type={setting.sensitive ? 'password' : 'text'} />;
      case 'number':
        return <Input {...inputProps} type="number" value={currentValue} onChange={(e) => handleOpenHandsSettingChange(keyPath, parseFloat(e.target.value) || 0)} />;
      case 'boolean':
        return <Checkbox id={keyPath} checked={!!currentValue} onCheckedChange={(checked: boolean | 'indeterminate') => handleOpenHandsSettingChange(keyPath, !!checked)} defaultChecked={setting.defaultValue} />;
      case 'enum':
        return (
          <Select onValueChange={(value: string) => handleOpenHandsSettingChange(keyPath, value)} value={currentValue || undefined} defaultValue={setting.defaultValue}>
            <SelectTrigger><SelectValue placeholder={`Select ${setting.label}`} /></SelectTrigger>
            <SelectContent>{(setting as EnumSetting).options.map((option: string) => (<SelectItem key={option} value={option}>{option}</SelectItem>))}</SelectContent>
          </Select>
        );
      case 'list':
        return <Textarea id={keyPath} value={Array.isArray(currentValue) ? currentValue.join('\n') : ''} onChange={(e) => handleOpenHandsSettingChange(keyPath, e.target.value.split('\n').filter(line => line.trim() !== ''))} placeholder="改行区切りで入力" defaultValue={Array.isArray(setting.defaultValue) ? setting.defaultValue.join('\n') : ''} />;
      case 'dict':
        {
          let displayValue = '';
          try { displayValue = typeof currentValue === 'object' && currentValue !== null ? JSON.stringify(currentValue, null, 2) : String(currentValue); } catch (e) { displayValue = String(currentValue); }
          return <Textarea id={keyPath} value={displayValue} onChange={(e) => { try { handleOpenHandsSettingChange(keyPath, JSON.parse(e.target.value)); } catch (err) { handleOpenHandsSettingChange(keyPath, e.target.value); } }} placeholder='JSON形式で入力' rows={5} defaultValue={typeof setting.defaultValue === 'object' && setting.defaultValue !== null ? JSON.stringify(setting.defaultValue, null, 2) : ''} />;
        }
      default:
        const _exhaustiveCheck: never = setting;
        console.warn(`Unhandled setting type: ${(_exhaustiveCheck as any).type}`);
        return null;
    }
  };

  // --- ローディング表示 --- 
  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  // --- メインUI --- 
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">設定</h1>

      {/* 一般設定セクション */}
      <Card>
        <CardHeader>
          <CardTitle>一般設定</CardTitle>
          <CardDescription>基本的なアプリケーション設定</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 言語設定 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <Label htmlFor="language">言語</Label>
            <div className="md:col-span-2">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language">
                  <SelectValue placeholder="言語を選択" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map(lang => (
                    <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Removed SSH and AWS sections from General */}
        </CardContent>
      </Card>

      {/* OpenHands設定セクション */}
      <Card>
        <CardHeader>
          <CardTitle>OpenHands 設定</CardTitle>
          <CardDescription>OpenHandsエージェントの動作を詳細に設定します。</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(openHandsSettingsConfig).map(([sectionKey, sectionContent]) => {
              const isNested = !Array.isArray(sectionContent);
              return (
                <Card key={sectionKey} className="shadow-none border">
                  <CardHeader className="bg-muted/50">
                    <CardTitle className="capitalize text-base">{sectionKey.replace(/_/g, ' ')}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    {isNested ? (
                      Object.entries(sectionContent as SectionContent).map(([subSectionKey, settingsArray]) => (
                        <div key={`${sectionKey}-${subSectionKey}`}>
                          <h4 className="font-semibold mb-2 capitalize text-sm">{subSectionKey.replace(/_/g, ' ')}</h4>
                          <div className="pl-4 border-l space-y-4">
                            {settingsArray.map((setting) => {
                              const keyPath = `${sectionKey}.${subSectionKey}.${setting.key}`;
                              const renderedInput = renderOpenHandsSettingInput(keyPath, setting);
                              return renderedInput ? (
                                <div key={keyPath} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                                  <Label htmlFor={keyPath} className="text-sm md:text-right md:pt-1.5">{setting.label}</Label>
                                  <div className="md:col-span-2 space-y-1">
                                    {renderedInput}
                                    {setting.description && <p className="text-xs text-muted-foreground">{setting.description}</p>}
                                  </div>
                                </div>
                              ) : null;
                            })}
                          </div>
                        </div>
                      ))
                    ) : (
                      (sectionContent as OpenHandsSettingDefinition[]).map((setting) => {
                        const keyPath = `${sectionKey}.${setting.key}`;
                        const renderedInput = renderOpenHandsSettingInput(keyPath, setting);
                        return renderedInput ? (
                          <div key={keyPath} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                            <Label htmlFor={keyPath} className="text-sm md:text-right md:pt-1.5">{setting.label}</Label>
                            <div className="md:col-span-2 space-y-1">
                              {renderedInput}
                              {setting.description && <p className="text-xs text-muted-foreground">{setting.description}</p>}
                            </div>
                          </div>
                        ) : null;
                      })
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 保存ボタン */}
      <div className="flex justify-end mt-6">
        <Button onClick={handleSave} disabled={saving || loading}>
          {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 保存中...</> : '設定を保存'}
        </Button>
      </div>
    </div>
  );
} 