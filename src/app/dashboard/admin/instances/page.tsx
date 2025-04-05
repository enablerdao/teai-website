'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function AdminInstancesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">全インスタンス一覧 (Admin)</h1>
      <Card>
        <CardHeader>
          <CardTitle>全インスタンス</CardTitle>
          <CardDescription>システム内のすべてのユーザーインスタンス一覧です。</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">現在、全インスタンス一覧表示機能は準備中です。</p>
          {/* Placeholder for instance table */}
        </CardContent>
      </Card>
    </div>
  );
} 