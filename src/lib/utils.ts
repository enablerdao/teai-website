import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getURL() {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // 本番環境のサイトURL
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Vercelが自動設定するURL
    'http://localhost:3000/'
  
  // http://が付いていない場合は追加
  url = url.startsWith('http') ? url : `https://${url}`
  // 末尾のスラッシュを追加
  url = url.endsWith('/') ? url : `${url}/`
  
  return url
}

const protectedPaths = [
  '/dashboard',
  '/settings',
  '/profile',
  // 他の保護したいパス
];
