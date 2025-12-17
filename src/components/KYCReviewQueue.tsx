"use client";

import React, { useState, useRef, useEffect } from 'react';
import { format, parseISO } from 'date-fns';

interface KYCRequest {
  id: string;
  userName: string;
  email: string;
  submittedDate: string; // ISO date
  documentType: string;
  idFront: string; // image URL
  idBack: string;  // image URL
  selfie: string;  // image URL
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
}

const mockKYCData: KYCRequest[] = [
  {
    id: '1',
    userName: 'John Doe',
    email: 'john.doe@example.com',
    submittedDate: '2025-12-17',
    documentType: 'Passport',
    idFront: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80',
    idBack: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80',
    selfie: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    status: 'pending',
  },
  {
    id: '2',
    userName: 'Alice Smith',
    email: 'alice.smith@example.com',
    submittedDate: '2025-12-16',
    documentType: 'Driver License',
    idFront: 'https://images.unsplash.com/photo-1590086782792-7613c5d2f9ec?w=800&q=80',
    idBack: 'https://images.unsplash.com/photo-1590086782792-7613c5d2f9ec?w=800&q=80',
    selfie: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80',
    status: 'under_review',
  },
  {
    id: '3',
    userName: 'Michael Chen',
    email: 'michael.chen@example.com',
    submittedDate: '2025-12-15',
    documentType: 'National ID',
    idFront: 'https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?w=800&q=80',
    idBack: 'https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?w=800&q=80',
    selfie: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80',
    status: 'pending',
  },
];

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
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage] = useState(1); // Pagination can be added later if needed
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredData = mockKYCData.filter((kyc) => {
    if (statusFilter && kyc.status !== statusFilter) return false;
    return true;
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (id: string) => {
    setOpenDropdownId((prev) => (prev === id ? null : id));
  };

  const ActionDropdown = ({ kyc }: { kyc: KYCRequest }) => (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleDropdown(kyc.id);
        }}
        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
      >
        <span className="text-2xl leading-none text-gray-600 dark:text-gray-300">⋯</span>
      </button>

      {openDropdownId === kyc.id && (
        <div className="absolute right-0 mt-2 w-48 origin-top-right bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="py-1">
            <button
              onClick={() => {
                alert(`Approve KYC for ${kyc.userName}`);
                setOpenDropdownId(null);
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-green-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Approve
            </button>
            <button
              onClick={() => {
                alert(`Reject KYC for ${kyc.userName}`);
                setOpenDropdownId(null);
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
              {filteredData.map((kyc) => (
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
                    <img
                      src={kyc.idFront}
                      alt="ID Front"
                      className="h-16 w-24 object-cover rounded border cursor-pointer hover:opacity-80 transition"
                      onClick={() => setSelectedImage({ src: kyc.idFront, alt: 'ID Front' })}
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <img
                      src={kyc.idBack}
                      alt="ID Back"
                      className="h-16 w-24 object-cover rounded border cursor-pointer hover:opacity-80 transition"
                      onClick={() => setSelectedImage({ src: kyc.idBack, alt: 'ID Back' })}
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <img
                      src={kyc.selfie}
                      alt="Selfie"
                      className="h-16 w-16 object-cover rounded-full border cursor-pointer hover:opacity-80 transition"
                      onClick={() => setSelectedImage({ src: kyc.selfie, alt: 'Selfie' })}
                    />
                  </td>
                  <td className="px-6 py-4"><StatusBadge status={kyc.status} /></td>
                  <td className="px-6 py-4 text-right">
                    <ActionDropdown kyc={kyc} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-6">
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
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">ID Front</p>
                <img
                  src={kyc.idFront}
                  alt="ID Front"
                  className="w-full h-28 object-cover rounded border cursor-pointer"
                  onClick={() => setSelectedImage({ src: kyc.idFront, alt: 'ID Front' })}
                />
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">ID Back</p>
                <img
                  src={kyc.idBack}
                  alt="ID Back"
                  className="w-full h-28 object-cover rounded border cursor-pointer"
                  onClick={() => setSelectedImage({ src: kyc.idBack, alt: 'ID Back' })}
                />
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Selfie</p>
                <img
                  src={kyc.selfie}
                  alt="Selfie"
                  className="w-full h-28 object-cover rounded-full border cursor-pointer"
                  onClick={() => setSelectedImage({ src: kyc.selfie, alt: 'Selfie' })}
                />
              </div>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-300">
              Document Type: <span className="font-medium">{kyc.documentType}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Image Lightbox Viewer */}
      {selectedImage && (
        <ImageViewer
          src={selectedImage.src}
          alt={selectedImage.alt}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
};

export default KYCReviewQueue;