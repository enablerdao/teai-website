import { test as base, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// テストデータの型定義
export interface TestUser {
  id: string;
  email: string | null;
  name: string | null;
}

// カスタムフィクスチャーの型定義
export type TestFixtures = {
  testUser: TestUser;
};

// カスタムテストの作成
export const test = base.extend<TestFixtures>({
  testUser: async ({}, use) => {
    // テストユーザーの作成
    const user = await createTestUser();
    await use(user);
    // テストユーザーの削除
    await deleteTestUser(user.id);
  },
});

// データベースのクリーンアップ
export async function cleanupDatabase() {
  try {
    await prisma.user.deleteMany();
  } catch (error) {
    console.error('Database cleanup failed:', error);
  }
}

// テストユーザーの作成
async function createTestUser(): Promise<TestUser> {
  const user = await prisma.user.create({
    data: {
      email: `test-${Date.now()}@example.com`,
      name: `Test User ${Date.now()}`,
    },
  });
  return user;
}

// テストユーザーの削除
async function deleteTestUser(userId: string) {
  await prisma.user.delete({
    where: { id: userId },
  });
}

// テストデータの作成
export async function createTestData() {
  return await createTestUser();
}

// ページの読み込み完了を待機
export async function waitForPageLoad(page: any) {
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
}

// エラーメッセージの検証
export async function expectErrorMessage(page: any, message: string) {
  const errorElement = page.getByText(message, { exact: true });
  await expect(errorElement).toBeVisible();
}

// 成功メッセージの検証
export async function expectSuccessMessage(page: any, message: string) {
  const successElement = page.getByText(message, { exact: true });
  await expect(successElement).toBeVisible();
}

// ナビゲーションの検証
export async function expectNavigation(page: any, expectedUrl: string) {
  await expect(page).toHaveURL(expectedUrl);
}

export { expect }; 