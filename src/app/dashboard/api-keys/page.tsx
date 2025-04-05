'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import { Loader2, Info, Eye, EyeOff, ExternalLink, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// --- 型定義 ---
interface AwsCredentials {
  aws_access_key_id: string;
  aws_secret_access_key: string;
}

interface DedicatedKeyDefinition {
  key: string;
  label: string;
  placeholder: string;
  link: string;
  maskable: boolean;
}

// --- 設定定義 ---
const DEDICATED_KEYS_CONFIG: DedicatedKeyDefinition[] = [
  { key: 'OPENAI_API_KEY', label: 'OpenAI API Key', placeholder: 'sk-...', link: 'https://platform.openai.com/api-keys', maskable: true },
  { key: 'ANTHROPIC_API_KEY', label: 'Anthropic API Key', placeholder: 'sk-ant-api03-...', link: 'https://console.anthropic.com/settings/keys', maskable: true },
  { key: 'STRIPE_SECRET_KEY', label: 'Stripe Secret Key', placeholder: 'sk_live_... or sk_test_...', link: 'https://dashboard.stripe.com/apikeys', maskable: true },
];

export default function ApiKeysPage() {
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // State for API Keys
  const [dedicatedKeys, setDedicatedKeys] = useState<Record<string, string>>({});
  const [otherEnvVars, setOtherEnvVars] = useState('');
  const [sshPublicKey, setSshPublicKey] = useState('');
  const [awsCredentials, setAwsCredentials] = useState<AwsCredentials | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});

  // --- データ取得 --- 
  useEffect(() => {
    const fetchKeys = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not found.");

        // Fetch user_settings (env vars, ssh key)
        const { data: userSettings, error: userSettingsError } = await supabase
          .from('user_settings')
          .select('environment_variables, ssh_public_key')
          .eq('user_id', user.id)
          .single();
        
        if (userSettingsError && userSettingsError.code !== 'PGRST116') throw userSettingsError; 

        const envVars = userSettings?.environment_variables || {};
        const initialDedicatedKeys: Record<string, string> = {};
        const initialOtherVars: Record<string, string> = {};
        const initialVisible: Record<string, boolean> = {};

        Object.entries(envVars).forEach(([key, value]) => {
            const dedicatedKeyConf = DEDICATED_KEYS_CONFIG.find(conf => conf.key === key);
            if (dedicatedKeyConf) {
                initialDedicatedKeys[key] = value as string;
                if (dedicatedKeyConf.maskable) initialVisible[key] = false; 
            } else if (key !== 'SSH_PUBLIC_KEY') { 
                initialOtherVars[key] = value as string;
            }
        });
        setDedicatedKeys(initialDedicatedKeys);
        setOtherEnvVars(Object.entries(initialOtherVars).map(([k, v]) => `${k}=${v}`).join('\n'));
        setSshPublicKey(userSettings?.ssh_public_key || envVars['SSH_PUBLIC_KEY'] || '');
        setVisibleKeys(initialVisible);

        // Fetch AWS credentials
        const { data: awsData, error: awsError } = await supabase
          .from('aws_credentials')
          .select('aws_access_key_id, aws_secret_access_key')
          .eq('user_id', user.id)
          .single();
        if (awsError && awsError.code !== 'PGRST116') throw awsError;
        setAwsCredentials(awsData ? { aws_access_key_id: awsData.aws_access_key_id, aws_secret_access_key: awsData.aws_secret_access_key } : null);
        if (awsData) {
            setVisibleKeys(prev => ({ ...prev, AWS_ACCESS_KEY_ID: false, AWS_SECRET_ACCESS_KEY: false })); // Mask AWS keys
        }

      } catch (error: any) {
        toast.error('APIキーの読み込みに失敗しました。');
        console.error('Error fetching API keys:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchKeys();
  }, [supabase]);

  // --- UIハンドラー --- 
  const toggleVisibility = (key: string) => {
    setVisibleKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleOtherEnvVarsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setOtherEnvVars(e.target.value);
  };

  // --- 保存処理 --- 
  const handleSave = async () => {
    setSaving(true);
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not found.");

        const finalEnvVars: Record<string, string> = { ...dedicatedKeys };
        otherEnvVars.split('\n').forEach(line => {
            const [key, ...valueParts] = line.split('=');
            const value = valueParts.join('=');
            if (key && value && !DEDICATED_KEYS_CONFIG.find(conf => conf.key === key.trim()) && key.trim() !== 'SSH_PUBLIC_KEY') {
                finalEnvVars[key.trim()] = value.trim();
            }
        });
        // Add SSH key to env vars if present
        if (sshPublicKey.trim()) {
            finalEnvVars['SSH_PUBLIC_KEY'] = sshPublicKey.trim();
        }

        // Update user_settings (env vars, ssh key)
        const { error: userSettingsError } = await supabase
            .from('user_settings')
            .upsert({ 
                user_id: user.id,
                environment_variables: finalEnvVars,
                ssh_public_key: sshPublicKey.trim(),
            }, { onConflict: 'user_id' });
        if (userSettingsError) throw userSettingsError;

        // Update AWS credentials separately
        if (awsCredentials) {
            const { error: awsError } = await supabase
                .from('aws_credentials')
                .update({ 
                    aws_access_key_id: awsCredentials.aws_access_key_id, 
                    aws_secret_access_key: awsCredentials.aws_secret_access_key 
                })
                .eq('user_id', user.id);
            if (awsError && awsError.code === 'PGRST116') { 
                 const { error: awsInsertError } = await supabase
                    .from('aws_credentials')
                    .insert({ 
                         user_id: user.id, 
                         aws_access_key_id: awsCredentials.aws_access_key_id, 
                         aws_secret_access_key: awsCredentials.aws_secret_access_key 
                     });
                 if (awsInsertError) throw awsInsertError;
            } else if (awsError) {
                throw awsError;
            }
        }

        toast.success('APIキーが保存されました！');

    } catch (error: any) {
        toast.error(`APIキーの保存に失敗しました: ${error.message}`);
        console.error('Error saving API keys:', error);
    } finally {
        setSaving(false);
    }
  };

  // --- ローディング表示 ---
  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  // --- メインUI --- 
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">APIキーと認証情報</h1>

      <Card>
        <CardHeader>
          <CardTitle>主要なAPIキー</CardTitle>
          <CardDescription>よく利用されるサービスのAPIキーを設定します。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {DEDICATED_KEYS_CONFIG.map(conf => (
            <div key={conf.key} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <Label htmlFor={conf.key} className="flex items-center">
                {conf.label}
                <a href={conf.link} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-500 hover:text-blue-700">
                  <ExternalLink size={14} />
                </a>
              </Label>
              <div className="md:col-span-2 flex items-center space-x-2">
                <Input
                  id={conf.key}
                  type={conf.maskable && !visibleKeys[conf.key] ? 'password' : 'text'}
                  placeholder={conf.placeholder}
                  value={dedicatedKeys[conf.key] || ''}
                  onChange={(e) => setDedicatedKeys(prev => ({ ...prev, [conf.key]: e.target.value }))}
                />
                {conf.maskable && (
                  <Button variant="ghost" size="icon" onClick={() => toggleVisibility(conf.key)}>
                    {visibleKeys[conf.key] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>その他のAPIキー</CardTitle>
          <CardDescription>.envファイル形式でキーと値を入力してください。</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            id="otherEnvVars"
            rows={5}
            placeholder="例:\nMY_API_KEY=12345\nANOTHER_KEY=abcde"
            value={otherEnvVars}
            onChange={handleOtherEnvVarsChange}
          />
          <p className="text-xs text-muted-foreground mt-1">上記の主要キー、SSH公開鍵、AWS認証情報以外を改行区切りで入力してください。</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SSH公開鍵</CardTitle>
          <CardDescription>OpenHandsがGitHub等のリポジトリにアクセスするために使用します。</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            id="sshPublicKey"
            rows={3}
            placeholder="ssh-rsa AAAAB3NzaC1yc2EAAA..."
            value={sshPublicKey}
            onChange={(e) => setSshPublicKey(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AWS認証情報</CardTitle>
          <CardDescription>インスタンス作成時に自動設定されます。通常は変更不要です。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <Alert variant="default" className="flex items-start border-yellow-500 text-yellow-700 [&>svg]:text-yellow-500">
              <AlertCircle className="h-4 w-4 mt-1 flex-shrink-0" />
              <div className="ml-2">
                  <AlertTitle className="text-yellow-800 font-semibold">注意</AlertTitle> 
                  <AlertDescription>AWS認証情報を変更する場合、既存のインスタンスやリソースが古い情報を使用し続ける可能性があります。変更前に必ず関連するインスタンスを削除してください。</AlertDescription>
              </div>
            </Alert>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <Label htmlFor="awsAccessKeyId">AWS Access Key ID</Label>
            <div className="md:col-span-2 flex items-center space-x-2">
              <Input
                id="awsAccessKeyId"
                type={!visibleKeys['AWS_ACCESS_KEY_ID'] ? 'password' : 'text'}
                value={awsCredentials?.aws_access_key_id || ''}
                onChange={(e) => setAwsCredentials(prev => prev ? { ...prev, aws_access_key_id: e.target.value } : { aws_access_key_id: e.target.value, aws_secret_access_key: '' })}
                placeholder="自動設定"
              />
              <Button variant="ghost" size="icon" onClick={() => toggleVisibility('AWS_ACCESS_KEY_ID')}>
                {visibleKeys['AWS_ACCESS_KEY_ID'] ? <EyeOff size={16} /> : <Eye size={16} />}
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <Label htmlFor="awsSecretAccessKey">AWS Secret Access Key</Label>
            <div className="md:col-span-2 flex items-center space-x-2">
              <Input
                id="awsSecretAccessKey"
                type={!visibleKeys['AWS_SECRET_ACCESS_KEY'] ? 'password' : 'text'}
                value={awsCredentials?.aws_secret_access_key || ''}
                onChange={(e) => setAwsCredentials(prev => prev ? { ...prev, aws_secret_access_key: e.target.value } : { aws_access_key_id: '' , aws_secret_access_key: e.target.value })}
                placeholder="自動設定"
              />
              <Button variant="ghost" size="icon" onClick={() => toggleVisibility('AWS_SECRET_ACCESS_KEY')}>
                {visibleKeys['AWS_SECRET_ACCESS_KEY'] ? <EyeOff size={16} /> : <Eye size={16} />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 保存ボタン */}
      <div className="flex justify-end mt-6">
        <Button onClick={handleSave} disabled={saving || loading}>
          {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 保存中...</> : 'APIキーを保存'}
        </Button>
      </div>
    </div>
  );
} 