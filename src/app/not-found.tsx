'use client';

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Frown } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader>
          <div className="mx-auto bg-secondary rounded-full p-4 w-fit">
             <Frown className="w-16 h-16 text-secondary-foreground" />
          </div>
          <CardTitle className="mt-4 text-4xl font-bold">404</CardTitle>
          <CardDescription className="text-lg">ページが見つかりません</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            お探しのページは移動または削除されたか、URLが間違っている可能性があります。
          </p>
          <Button asChild>
            <Link href="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              ダッシュボードに戻る
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
