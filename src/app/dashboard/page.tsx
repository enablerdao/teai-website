'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import {
  CreditCardIcon,
  CloudIcon,
  ServerIcon,
} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalCredit: number;
  activeInstances: number;
  totalSpent: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchStats = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/dashboard/stats?userId=${session.user.id}`);
          if (response.ok) {
            const data = await response.json();
            setStats(data);
          }
        } catch (error) {
          console.error('Error fetching dashboard stats:', error);
        }
      }
      setIsLoading(false);
    };

    if (session?.user?.id) {
      fetchStats();
    }
  }, [session]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          ダッシュボード
        </h1>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/instances/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <ServerIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            新規インスタンス作成
          </Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* クレジット残高 */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CreditCardIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    クレジット残高
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      ¥{stats?.totalCredit.toLocaleString() || 'Loading...'}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <div className="text-sm">
              <Link
                href="/dashboard/credits"
                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              >
                詳細を表示
              </Link>
            </div>
          </div>
        </div>

        {/* アクティブなインスタンス */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ServerIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    アクティブなインスタンス
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {stats?.activeInstances.toLocaleString() || 'Loading...'}台
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <div className="text-sm">
              <Link
                href="/instances"
                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              >
                詳細を表示
              </Link>
            </div>
          </div>
        </div>

        {/* 今月の利用額 */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CloudIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    今月の利用額
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      ¥{stats?.totalSpent.toLocaleString() || 'Loading...'}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <div className="text-sm">
              <Link
                href="/dashboard/aws"
                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              >
                詳細を表示
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
