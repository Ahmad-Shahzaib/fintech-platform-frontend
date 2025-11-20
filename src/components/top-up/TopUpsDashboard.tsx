"use client";

import { useEffect, useState } from 'react';
import { X, ExternalLink, Copy, Check } from 'lucide-react';

type TopUp = {
  id: string;
  date: string;
  amount: number;
  coin: string;
  network: string;
  status: 'completed' | 'processing' | 'pending' | 'rejected' | string;
  walletAddress: string;
  transactionHash?: string | null;
  adminNotes?: string | null;
};

const DEFAULT_TOPUPS: TopUp[] = [
  {
    id: 'REQ-2024-001',
    date: '2024-03-15',
    amount: 500,
    coin: 'USDT',
    network: 'TRC20',
    status: 'completed',
    walletAddress: 'TXYZa1b2c3d4e5f6g7h8i9j0k1l2m3n4o5',
    transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    adminNotes: null
  },
  {
    id: 'REQ-2024-002',
    date: '2024-03-18',
    amount: 1000,
    coin: 'USDC',
    network: 'ERC20',
    status: 'processing',
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    transactionHash: null,
    adminNotes: null
  },
  {
    id: 'REQ-2024-003',
    date: '2024-03-20',
    amount: 250,
    coin: 'BTC',
    network: 'Bitcoin',
    status: 'pending',
    walletAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    transactionHash: null,
    adminNotes: null
  }
];

const TopUpsDashboard = () => {
  const [selectedTopUp, setSelectedTopUp] = useState<TopUp | null>(null);
  const [topUps, setTopUps] = useState<TopUp[]>([]);
  const [copiedWallet, setCopiedWallet] = useState(false);
  const [copiedTxHash, setCopiedTxHash] = useState(false);

  useEffect(() => {
    const readTopUps = () => {
      try {
        const stored = JSON.parse(localStorage.getItem('topUps') || 'null');
        if (Array.isArray(stored) && stored.length > 0) {
          setTopUps(stored);
        } else {
          setTopUps(DEFAULT_TOPUPS);
        }
      } catch (err) {
        setTopUps(DEFAULT_TOPUPS);
      }
    };
    readTopUps();

    const onAdded = (e: Event) => {
      const detail = (e as CustomEvent).detail as TopUp | undefined;
      if (detail) setTopUps(prev => [detail, ...prev]);
      else readTopUps();
    };

    window.addEventListener('topup:added', onAdded as EventListener);
    return () => window.removeEventListener('topup:added', onAdded as EventListener);
  }, []);

  // Copy helpers
  const copyToClipboard = async (text: string, onCopied: (v: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text);
      onCopied(true);
      setTimeout(() => onCopied(false), 2000);
    } catch (err) {
      // ignore
    }
  };

  // Explorer link mapping
  const getExplorerUrl = (network: string, txHash: string | undefined | null): string | null => {
    if (!txHash) return null;
    const n = network?.toLowerCase() || '';
    if (n.includes('erc') || n.includes('eth') || n.includes('ethereum') || n.includes('usdc') || n.includes('usdt')) return `https://etherscan.io/tx/${txHash}`;
    if (n.includes('trc') || n.includes('tron')) return `https://tronscan.org/#/transaction/${txHash}`;
    if (n.includes('btc') || n.includes('bitcoin')) return `https://blockstream.info/tx/${txHash}`;
    return `https://www.google.com/search?q=${txHash}`;
  };

  // Close on ESC key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedTopUp(null);
    };
    if (selectedTopUp) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedTopUp]);

  const explorerUrl = selectedTopUp ? getExplorerUrl(selectedTopUp.network, selectedTopUp.transactionHash) : null;

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: 'bg-green-100 text-green-800 border-green-200',
      processing: 'bg-blue-100 text-blue-800 border-blue-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      rejected: 'bg-red-100 text-red-800 border-red-200'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || ''}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-AU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (err) {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Top-Ups</h1>
          <p className="text-gray-600 mt-1">View and manage your cryptocurrency top-up requests</p>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Request ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount (AUD)</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Coin/Token</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Network</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {topUps.map((topUp) => (
                  <tr key={topUp.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{topUp.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(topUp.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">${topUp.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{topUp.coin}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{topUp.network}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(topUp.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button onClick={() => setSelectedTopUp(topUp)} className="text-blue-600 hover:text-blue-800 font-medium text-sm hover:underline">View Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {topUps.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No top-up requests found</p>
          </div>
        )}
      </div>

      {/* Slide-over panel */}
      {selectedTopUp && (
        // Ensure the slide-over sits above the header which uses a high z-index
        <div className="fixed inset-0 z-[100000] flex">
          {/* backdrop */}
          <div className="fixed inset-0 bg-black opacity-40" onClick={() => setSelectedTopUp(null)} />

          {/* slide over */}
          <section role="dialog" aria-modal="true" className="ml-auto w-full max-w-sm bg-white h-full shadow-xl overflow-y-auto" aria-label="Top Up details panel">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-900">Top-Up Details</h2>
                <span className="text-sm text-gray-500">{selectedTopUp.id}</span>
              </div>
              <button onClick={() => setSelectedTopUp(null)} className="text-gray-400 hover:text-gray-600 transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-4 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Request ID</label>
                  <p className="text-base font-semibold text-gray-900">{selectedTopUp.id}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Date Submitted</label>
                  <p className="text-base text-gray-900">{formatDate(selectedTopUp.date)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Amount (AUD)</label>
                  <p className="text-base font-semibold text-gray-900">${selectedTopUp.amount.toLocaleString()}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Coin & Network</label>
                  <p className="text-base text-gray-900">{selectedTopUp.coin} <span className="text-gray-500">({selectedTopUp.network})</span></p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Wallet Address</label>
                <div className="flex items-center gap-2 bg-gray-50 rounded-md p-2 border border-gray-200">
                  <p className="text-xs font-mono text-gray-900 break-words truncate">{selectedTopUp.walletAddress}</p>
                  <div className="ml-auto flex items-center gap-2">
                    <button title="Copy wallet address" onClick={() => copyToClipboard(selectedTopUp.walletAddress, setCopiedWallet)} className="text-gray-400 hover:text-gray-600">
                      {copiedWallet ? <Check className="w-4 h-4 text-green-600"/> : <Copy className="w-4 h-4"/>}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                <div className="mt-2">{getStatusBadge(selectedTopUp.status)}</div>
              </div>

              {selectedTopUp.status === 'completed' && selectedTopUp.transactionHash && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Transaction Hash</label>
                  <div className="bg-gray-50 rounded-md p-2 border border-gray-200 flex items-center gap-2">
                    <p className="text-xs font-mono text-gray-900 break-words truncate">{selectedTopUp.transactionHash}</p>
                    <div className="ml-auto flex items-center gap-2">
                      <button title="Copy transaction hash" onClick={() => copyToClipboard(selectedTopUp.transactionHash || '', setCopiedTxHash)} className="text-gray-400 hover:text-gray-600">
                        {copiedTxHash ? <Check className="w-4 h-4 text-green-600"/> : <Copy className="w-4 h-4"/>}
                      </button>
                      {explorerUrl && (
                        <a target="_blank" rel="noopener noreferrer" href={explorerUrl} className="text-blue-600 hover:text-blue-800 flex items-center">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {selectedTopUp.status === 'rejected' && selectedTopUp.adminNotes && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <label className="block text-sm font-medium text-red-800 mb-2">Admin Notes</label>
                  <p className="text-sm text-red-700">{selectedTopUp.adminNotes}</p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-4 py-3 flex justify-end border-t border-gray-200">
              <button onClick={() => setSelectedTopUp(null)} className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm font-medium">Close</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default TopUpsDashboard;

