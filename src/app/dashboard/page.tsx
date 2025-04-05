'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import Link from 'next/link';

// Simple dashboard page for development
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ダッシュボード</CardTitle>
          <CardDescription>開発モード</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>開発モード</AlertTitle>
            <AlertDescription>
              これは開発モードのダッシュボードです。実際のデータは表示されません。
            </AlertDescription>
          </Alert>
          
          <div className="mt-4">
            <h3 className="text-lg font-medium">利用可能なページ</h3>
            <ul className="mt-2 space-y-2">
              <li>
                <Link href="/" className="text-blue-500 hover:underline">
                  ホームページ
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-blue-500 hover:underline">
                  ダッシュボード
                </Link>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
