'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { AWSCredentialsForm } from '@/components/AWSCredentialsForm'

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [slackNotifications, setSlackNotifications] = useState(false);
  const [slackWebhook, setSlackWebhook] = useState('');

  const handleSave = async () => {
    // TODO: 設定の保存処理を実装
    console.log('Settings saved');
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">Settings</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">AWS Credentials</h2>
          <p className="text-gray-500 mb-4">
            Enter your AWS credentials to manage your instances. These credentials will be used to create and manage EC2 instances in your AWS account.
          </p>
          <AWSCredentialsForm />
        </section>

        <Card>
          <CardHeader>
            <CardTitle>通知設定</CardTitle>
            <CardDescription>通知の受け取り方法を設定します</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications">メール通知</Label>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="slack-notifications">Slack通知</Label>
              <Switch
                id="slack-notifications"
                checked={slackNotifications}
                onCheckedChange={setSlackNotifications}
              />
            </div>
            {slackNotifications && (
              <div className="space-y-2">
                <Label htmlFor="slack-webhook">Slack Webhook URL</Label>
                <Input
                  id="slack-webhook"
                  value={slackWebhook}
                  onChange={(e) => setSlackWebhook(e.target.value)}
                  placeholder="https://hooks.slack.com/services/..."
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>APIキー設定</CardTitle>
            <CardDescription>APIキーの管理と生成を行います</CardDescription>
          </CardHeader>
          <CardContent>
            <Button>新規APIキーを生成</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>請求設定</CardTitle>
            <CardDescription>請求情報と支払い方法の管理</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">請求情報を更新</Button>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave}>設定を保存</Button>
        </div>
      </div>
    </div>
  );
} 