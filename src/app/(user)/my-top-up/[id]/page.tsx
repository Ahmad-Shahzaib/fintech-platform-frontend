"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchTopUps } from '@/redux/thunk/topUpsThunks'; // use the existing thunk that fetches top-ups list
import {
  X,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  ArrowLeft,
} from 'lucide-react';

type TopUp = {
  id: string;
  date: string;
  amount: number;
  coin: string;
  network: string;
  status: string;
  paymentStatus?: string | null;
  totalAud?: number | string | null;
  payment_deadline?: string | null;
  submitted_at?: string | null;
  verified_at?: string | null;
  rejection_reason?: string | null;
  walletAddress: string;
  transactionHash?: string | null;
  adminNotes?: string | null;
};

const TopUpDetailPage = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [topUp, setTopUp] = useState<TopUp | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedWallet, setCopiedWallet] = useState(false);
  const [copiedTxHash, setCopiedTxHash] = useState(false);
  const [countdown, setCountdown] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchTopUps({ status: '', page: 1 }))
        .unwrap()
        .then((payload: any) => {
          const list = Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : []);
          const data = list.find((item: any) => String(item.id) === String(id) || (item.transaction_id && String(item.transaction_id) === String(id)));
          if (!data) {
            setTopUp(null);
            setLoading(false);
            return;
          }
          // normalize data similar to dashboard
          const normalized: TopUp = {
            id: data.transaction_id ?? String(data.id),
            date: data.created_at ?? '',
            amount: parseFloat(data.amount_aud ?? '0'),
            coin: data.currency ?? data.coin ?? '',
            network: data.network ?? '',
            status: data.status ?? 'pending',
            paymentStatus: data.payment_status ?? data.paymentStatus ?? null,
            totalAud: data.total_aud ?? data.totalAud ?? data.amount_aud ?? null,
            payment_deadline: data.payment_deadline ?? data.paymentDeadline ?? null,
            submitted_at: data.submitted_at ?? data.submittedAt ?? null,
            verified_at: data.verified_at ?? data.verifiedAt ?? null,
            rejection_reason: data.rejection_reason ?? data.rejectionReason ?? null,
            walletAddress: data.wallet_address ?? data.walletAddress ?? '',
            transactionHash: data.transaction_hash ?? data.transactionHash ?? null,
            adminNotes: data.admin_notes ?? data.adminNotes ?? null,
          };
          setTopUp(normalized);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [id, dispatch]);

  // Countdown timer
  useEffect(() => {
    if (!topUp?.payment_deadline) {
      setCountdown(null);
      return;
    }
    const timer = setInterval(() => {
      const deadline = new Date(topUp!.payment_deadline!).getTime();
      const now = Date.now();
      const diff = Math.max(0, deadline - now);

      if (diff <= 0) {
        setCountdown('Expired');
        clearInterval(timer);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const parts: string[] = [];
      if (days) parts.push(`${days}d`);
      if (hours || days) parts.push(`${hours}h`);
      parts.push(`${minutes}m`);
      parts.push(`${seconds}s`);
      setCountdown(parts.join(' '));
    }, 1000);

    return () => clearInterval(timer);
  }, [topUp]);

  const copyToClipboard = async (text: string, setter: (v: boolean) => void) => {
    await navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const getExplorerUrl = (network: string, txHash?: string | null) => {
    if (!txHash) return null;
    const n = network.toLowerCase();
    if (n.includes('eth') || n.includes('erc') || n.includes('usdc') || n.includes('usdt'))
      return `https://etherscan.io/tx/${txHash}`;
    if (n.includes('tron') || n.includes('trc')) return `https://tronscan.org/#/transaction/${txHash}`;
    if (n.includes('btc') || n.includes('bitcoin')) return `https://blockstream.info/tx/${txHash}`;
    return null;
  };

  const explorerUrl = topUp ? getExplorerUrl(topUp.network, topUp.transactionHash) : null;

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200',
      processing: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200',
      rejected: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || ''}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">Loading...</div>;
  }

  if (!topUp) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">Top-up not found</div>;
  }

  return (
    <div className="">
      <div className=" mx-auto">
        <a href="/my-top-up" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to List
        </a>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Top-Up Details</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Transaction ID: {topUp.id}</p>
            </div>
            <div>{getStatusBadge(topUp.status)}</div>
          </div>

          {/* Basic Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Date Submitted</label>
              <p className="mt-1 text-gray-900 dark:text-gray-100">
                {new Date(topUp.date).toLocaleString('en-AU')}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Amount (AUD)</label>
              <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                ${topUp.amount.toLocaleString()}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Coin & Network</label>
              <p className="mt-1 text-gray-900 dark:text-gray-100">
                {topUp.coin} <span className="text-gray-500">({topUp.network})</span>
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Wallet Address</label>
              <div className="mt-1 flex items-center gap-2 bg-gray-50 dark:bg-gray-700 rounded-md p-2 border">
                <code className="text-xs font-mono break-all">{topUp.walletAddress}</code>
                <button
                  onClick={() => copyToClipboard(topUp.walletAddress, setCopiedWallet)}
                  className="ml-auto"
                >
                  {copiedWallet ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Payment Status</h2>
            {topUp.paymentStatus === 'awaiting_payment' && (
              <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                  <div>
                    <p className="font-semibold">Payment Required</p>
                    <p className="text-sm mt-1">
                      Deadline: {topUp.payment_deadline ? new Date(topUp.payment_deadline).toLocaleString() : '—'}
                      {countdown && <span className="ml-2 font-medium">({countdown})</span>}
                    </p>
                    <p className="text-sm mt-1">Amount: ${String(topUp.totalAud ?? topUp.amount)} AUD</p>
                  </div>
                </div>
                <button type="button" onClick={() => router.push('/create-payment')} className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md flex items-center justify-center gap-2">
                  <CreditCard className="w-4 h-4" /> Complete Payment Now
                </button>
              </div>
            )}

            {topUp.paymentStatus === 'payment_pending' && (
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <Clock className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-semibold">Payment Verification in Progress</p>
                  <p className="text-sm mt-1">Submitted: {topUp.submitted_at ? new Date(topUp.submitted_at).toLocaleString() : '—'}</p>
                  <p className="text-sm mt-1">Expected: 24-48 hours</p>
                </div>
              </div>
            )}

            {topUp.paymentStatus === 'payment_verified' && (
              <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-semibold">Payment Verified</p>
                </div>
              </div>
            )}

            {topUp.paymentStatus === 'payment_failed' && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-red-600" />
                  <div>
                    <p className="font-semibold">Payment Failed</p>
                    <p className="text-sm mt-1">Reason: {topUp.rejection_reason || '—'}</p>
                  </div>
                </div>
                <button className="mt-4 w-full border border-gray-300 dark:border-gray-600 py-2 rounded-md flex items-center justify-center gap-2">
                  <CreditCard className="w-4 h-4" /> Resubmit Payment
                </button>
              </div>
            )}
          </div>

          {/* Progress Timeline */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Progress</h2>
            <ol className="space-y-4">
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 text-green-800 flex items-center justify-center">✓</span>
                <div>
                  <p className="font-medium">Request Created</p>
                  <p className="text-sm text-gray-500">{new Date(topUp.date).toLocaleString()}</p>
                </div>
              </li>
              {/* Add other steps similarly as in original modal */}
            </ol>
          </div>

          {/* Transaction Hash (if completed) */}
          {topUp.status === 'completed' && topUp.transactionHash && (
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Transaction Hash
              </label>
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 rounded-md p-2 border">
                <code className="text-xs font-mono break-all">{topUp.transactionHash}</code>
                <button onClick={() => copyToClipboard(topUp.transactionHash!, setCopiedTxHash)}>
                  {copiedTxHash ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
                {explorerUrl && (
                  <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 text-blue-600" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Admin Notes */}
          {topUp.status === 'rejected' && topUp.adminNotes && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 rounded-lg p-4">
              <p className="font-medium text-red-800 dark:text-red-200">Admin Notes</p>
              <p className="text-sm mt-1 text-red-700 dark:text-red-300">{topUp.adminNotes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopUpDetailPage;