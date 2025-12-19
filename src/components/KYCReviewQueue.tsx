"use client";

import React, { useState, useRef, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchAdminAllKyc, approveAdminAllKyc, rejectAdminAllKyc } from '@/redux/thunk/adminAllKycThunks';
import { useAlert } from './common/GlobalAlert';

interface KYCRequest {
  id: number;
  userName: string;
  email: string;
  submittedDate: string; // ISO date
  documentType: string;
  idFront: string; // image URL
  idBack: string;  // image URL
  selfie: string;  // image URL
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
}

const StatusBadge: React.FC<{ status: KYCRequest['status'] }> = ({ status }) => {
  const variants: Record<KYCRequest['status'], string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    under_review: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };

  const label = status === 'under_review' ? 'Under Review' : status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${variants[status]}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {label}
    </span>
  );
};

const ImageViewer: React.FC<{ src: string; alt: string; onClose: () => void }> = ({ src, alt, onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-black/80 z-[100000] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-full">
        <img src={src} alt={alt} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full p-2 transition"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const KYCReviewQueue: React.FC = () => {
  const dispatch = useAppDispatch();
  const { list, loading, pagination } = useAppSelector(state => state.adminAllKyc);
  const { showAlert } = useAlert();
  
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [currentActionId, setCurrentActionId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Fetch KYC records on mount and when filters/page changes
  useEffect(() => {
    dispatch(fetchAdminAllKyc({ page: currentPage }));
  }, [dispatch, currentPage]);

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  // Map API response to display format
  const displayKYCs = list.map((kyc) => ({
    id: kyc.id,
    userName: kyc.user?.name || kyc.full_name || 'N/A',
    email: kyc.user?.email || 'N/A',
    submittedDate: kyc.submitted_at,
    documentType: kyc.document_type?.replace('_', ' ') || 'N/A',
    idFront: kyc.document_front_url || '',
    idBack: kyc.document_back_url || '',
    selfie: kyc.selfie_url || '',
    status: (kyc.status?.toLowerCase() || 'pending') as 'pending' | 'under_review' | 'approved' | 'rejected',
  }));

  // Apply status filter
  const filteredData = displayKYCs.filter((kyc) => {
    if (statusFilter && kyc.status !== statusFilter) return false;
    return true;
  });

  // Total pages from pagination
  const totalPages = pagination?.last_page || 1;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close dropdown only if clicking outside dropdown area
      if (openDropdownId !== null) {
        const target = event.target as HTMLElement;
        // Check if click is on a button or within dropdown menu
        if (target.closest('[data-dropdown-trigger]') || target.closest('[data-dropdown-menu]')) {
          return;
        }
        // Close dropdown on outside click
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdownId]);

  const toggleDropdown = (id: string | number) => {
    console.log('toggleDropdown called with id:', id);
    setOpenDropdownId((prev) => {
      const newVal = prev === String(id) ? null : String(id);
      console.log('dropdown state changed from', prev, 'to', newVal);
      return newVal;
    });
  };

  const handleApprove = (id: number) => {
    console.log('handleApprove called with id:', id);
    setCurrentActionId(id);
    setShowApproveModal(true);
    setOpenDropdownId(null);
  };

  const handleReject = (id: number) => {
    console.log('handleReject called with id:', id);
    setCurrentActionId(id);
    setShowRejectModal(true);
    setRejectionReason('');
    setOpenDropdownId(null);
  };

  const confirmApprove = async () => {
    if (!currentActionId) {
      console.warn('No KYC ID selected for approval');
      return;
    }
    
    console.log('Starting approval process for KYC ID:', currentActionId);
    setActionLoading(true);
    
    try {
      console.log('Dispatching approveAdminAllKyc thunk...');
      const action: any = await dispatch(approveAdminAllKyc(currentActionId));
      
      console.log('Thunk action:', action);
      console.log('Action type:', action.type);
      console.log('Action payload:', action.payload);
      
      if (action.type && action.type.endsWith('/fulfilled')) {
        console.log('Approval successful!');
        setShowApproveModal(false);
        dispatch(fetchAdminAllKyc({ page: currentPage }));
        showAlert('KYC approved successfully', 'success');
      } else {
        console.error('Approval failed - not fulfilled');
        const msg = (action.payload as any) || (action.error && action.error.message) || 'Failed to approve KYC';
        showAlert(msg, 'error');
      }
    } catch (err) {
      console.error('Approve error caught:', err);
      showAlert('Failed to approve KYC. See console for details.', 'error');
    } finally {
      setActionLoading(false);
      setCurrentActionId(null);
    }
  };

  const confirmReject = async () => {
    if (!currentActionId) {
      console.warn('No KYC ID selected for rejection');
      return;
    }
    
    if (!rejectionReason.trim()) {
      showAlert('Please provide a rejection reason', 'warning');
      return;
    }
    
    console.log('Starting rejection process for KYC ID:', currentActionId);
    setActionLoading(true);
    
    try {
      console.log('Dispatching rejectAdminAllKyc thunk with reason:', rejectionReason);
      const action: any = await dispatch(rejectAdminAllKyc({ id: currentActionId, rejection_reason: rejectionReason.trim() }));
      
      console.log('Thunk action:', action);
      console.log('Action type:', action.type);
      console.log('Action payload:', action.payload);
      
      if (action.type && action.type.endsWith('/fulfilled')) {
        console.log('Rejection successful!');
        setShowRejectModal(false);
        setRejectionReason('');
        dispatch(fetchAdminAllKyc({ page: currentPage }));
        showAlert('KYC rejected successfully', 'success');
      } else {
        console.error('Rejection failed - not fulfilled');
        const msg = (action.payload as any) || (action.error && action.error.message) || 'Failed to reject KYC';
        showAlert(msg, 'error');
      }
    } catch (err) {
      console.error('Reject error caught:', err);
      showAlert('Failed to reject KYC. See console for details.', 'error');
    } finally {
      setActionLoading(false);
      setCurrentActionId(null);
    }
  };

  const ImageCell: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
    if (!src) {
      return (
        <div className="h-16 w-24 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 flex items-center justify-center">
          <span className="text-xs text-gray-500 dark:text-gray-400 text-center px-2">No image</span>
        </div>
      );
    }
    return (
      <img
        src={src}
        alt={alt}
        className="h-16 w-24 object-cover rounded border cursor-pointer hover:opacity-80 transition"
        onClick={() => setSelectedImage({ src, alt })}
      />
    );
  };

  const SelfieCell: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
    if (!src) {
      return (
        <div className="h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center">
          <span className="text-xs text-gray-500 dark:text-gray-400 text-center px-2">No image</span>
        </div>
      );
    }
    return (
      <img
        src={src}
        alt={alt}
        className="h-16 w-16 object-cover rounded-full border cursor-pointer hover:opacity-80 transition"
        onClick={() => setSelectedImage({ src, alt })}
      />
    );
  };

  const MobileImageCard: React.FC<{ src: string; alt: string; label: string }> = ({ src, alt, label }) => {
    if (!src) {
      return (
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">{label}</p>
          <div className="w-full h-28 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 flex items-center justify-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">No image</span>
          </div>
        </div>
      );
    }
    return (
      <div className="text-center">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <img
          src={src}
          alt={alt}
          className="w-full h-28 object-cover rounded border cursor-pointer"
          onClick={() => setSelectedImage({ src, alt })}
        />
      </div>
    );
  };

  const ActionDropdown = ({ kyc }: { kyc: (typeof filteredData)[0] }) => (
    <div className="relative inline-block text-left">
      <button
        data-dropdown-trigger
        onClick={(e) => {
          e.stopPropagation();
          toggleDropdown(kyc.id);
        }}
        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
      >
        <span className="text-2xl leading-none text-gray-600 dark:text-gray-300">⋯</span>
      </button>

      {openDropdownId === String(kyc.id) && (
        <div data-dropdown-menu className="absolute right-0 mt-2 w-48 origin-top-right bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="py-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log('Approve button clicked, calling handleApprove');
                handleApprove(kyc.id);
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-green-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Approve
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log('Reject button clicked, calling handleReject');
                handleReject(kyc.id);
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header + Filters */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              KYC Review Queue
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Review and verify user identity documents
            </p>
          </div>

          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
            </select>
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Submitted</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Document Type</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">ID Front</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">ID Back</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Selfie</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                      Loading KYC requests...
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    No KYC requests found
                  </td>
                </tr>
              ) : (
                filteredData.map((kyc) => (
                <tr key={kyc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{kyc.userName}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{kyc.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {format(parseISO(kyc.submittedDate), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{kyc.documentType}</td>
                  <td className="px-6 py-4 text-center">
                    <ImageCell src={kyc.idFront} alt="ID Front" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <ImageCell src={kyc.idBack} alt="ID Back" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <SelfieCell src={kyc.selfie} alt="Selfie" />
                  </td>
                  <td className="px-6 py-4"><StatusBadge status={kyc.status} /></td>
                  <td className="px-6 py-4 text-right">
                    <ActionDropdown kyc={kyc} />
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Showing {filteredData.length > 0 ? `${filteredData.length} of ${pagination?.total || 0}` : '0'} requests
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1 || loading}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || loading}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-6">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-8">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            <span className="text-gray-500">Loading KYC requests...</span>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            No KYC requests found
          </div>
        ) : (
          <>
            {filteredData.map((kyc) => (
          <div key={kyc.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{kyc.userName}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{kyc.email}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Submitted: {format(parseISO(kyc.submittedDate), 'MMM dd, yyyy')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={kyc.status} />
                <ActionDropdown kyc={kyc} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <MobileImageCard src={kyc.idFront} alt="ID Front" label="ID Front" />
              <MobileImageCard src={kyc.idBack} alt="ID Back" label="ID Back" />
              <MobileImageCard src={kyc.selfie} alt="Selfie" label="Selfie" />
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-300">
              Document Type: <span className="font-medium">{kyc.documentType}</span>
            </div>
          </div>
        ))}
          </>
        )}

        <div className="flex justify-between items-center pt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1 || loading}
              className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || loading}
              className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Image Lightbox Viewer */}
      {selectedImage && (
        <ImageViewer
          src={selectedImage.src}
          alt={selectedImage.alt}
          onClose={() => setSelectedImage(null)}
        />
      )}

      {/* Approve Confirmation Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Approve KYC</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to approve this KYC request?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowApproveModal(false);
                  setCurrentActionId(null);
                }}
                disabled={actionLoading}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmApprove}
                disabled={actionLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Reject KYC</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Please provide a reason for rejection:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={4}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                  setCurrentActionId(null);
                }}
                disabled={actionLoading}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={actionLoading || !rejectionReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KYCReviewQueue;