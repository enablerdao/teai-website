'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface CreditData {
  balance: number;
  transactions: Array<{
    id: string;
    amount: number;
    type: string;
    createdAt: string;
  }>;
}

export default function CreditsPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login');
    },
  });
  const router = useRouter();
  const [creditData, setCreditData] = useState<CreditData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCreditData = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/credits/${session.user.id}`);
          if (response.ok) {
            const data = await response.json();
            setCreditData(data);
          }
        } catch (error) {
          console.error('Error fetching credit data:', error);
        }
      }
      setIsLoading(false);
    };

    if (session?.user?.id) {
      fetchCreditData();
    }
  }, [session]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 sm:px-0">
        <div className="sm:flex sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">クレジット管理</h1>
          <div className="mt-4 sm:mt-0">
            <Link
              href="/dashboard/charge"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              クレジットをチャージ
            </Link>
          </div>
        </div>

        <div className="mt-6 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              現在の残高
            </h3>
            <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
              ¥{creditData?.balance?.toLocaleString() || 0}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              利用履歴
            </h3>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700">
            <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
              {creditData?.transactions?.map((transaction) => (
                <li key={transaction.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {transaction.type === 'charge' ? 'チャージ' : '利用'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(transaction.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className={`text-sm font-medium ${
                      transaction.type === 'charge'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {transaction.type === 'charge' ? '+' : '-'}
                      ¥{transaction.amount.toLocaleString()}
                    </div>
                  </div>
                </li>
              ))}
              {(!creditData?.transactions || creditData.transactions.length === 0) && (
                <li className="px-4 py-4 sm:px-6 text-center text-gray-500 dark:text-gray-400">
                  利用履歴はありません
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
