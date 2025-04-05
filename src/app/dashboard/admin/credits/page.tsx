'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminCreditsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">ポイント管理 (Admin)</h1>
      <Card>
        <CardHeader>
          <CardTitle>ユーザーポイント調整</CardTitle>
          <CardDescription>特定のユーザーにポイントを付与または減算します。</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">現在、ポイント管理機能は準備中です。</p>
          {/* Placeholder for point adjustment form */}
          <div className="mt-4">
             <Button disabled>ポイント調整機能を実装</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 