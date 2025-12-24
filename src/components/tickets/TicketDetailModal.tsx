"use client";

import React from 'react';

interface TicketDetailModalProps {
  isOpen: boolean;
  ticket: {
    id: string;
    subject: string;
    issueType: string;
    priority: string;
    status: string;
    createdDate: string;
    lastUpdated: string;
    description?: string;
    attachment?: string;
  } | null;
  onClose: () => void;
}

const issueTypeMap: { [key: string]: string } = {
  technical: 'Technical Issue',
  billing: 'Billing Problem',
  account: 'Account Access',
  feature: 'Feature Request',
  other: 'Other'
};

const TicketDetailModal: React.FC<TicketDetailModalProps> = ({ isOpen, ticket, onClose }) => {
  if (!isOpen || !ticket) return null;

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-purple-100 text-purple-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'closed':
        return 'bg-green-100 text-green-800';
      case 'close':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 z-[100000]  flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-lg max-w-lg w-full mx-4 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Ticket Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ticket ID</p>
            <p className="text-lg font-semibold text-blue-600 dark:text-blue-400 mt-1">{ticket.id}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Issue Type</p>
            <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">{issueTypeMap[ticket.issueType] || ticket.issueType}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Priority</p>
              <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
              </span>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</p>
              <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace('-', ' ')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Created Date</p>
              <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">{ticket.createdDate}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Last Updated</p>
              <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">{ticket.lastUpdated}</p>
            </div>
          </div>

          {ticket.description && (
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Description</p>
              <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">{ticket.description}</p>
            </div>
          )}

          {ticket.attachment && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Attachment</p>
              <div className="mt-3">
                {ticket.attachment.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                  <div>
                    <img
                      src={`https://fintechapi.softsuitetech.com/storage/${ticket.attachment}`}
                      alt="Ticket attachment"
                      className="max-h-[100px] h-auto rounded cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => window.open(`https://fintechapi.softsuitetech.com/storage/${ticket.attachment}`, '_blank')}
                      onError={(e) => {
                        const imgElement = e.target as HTMLImageElement;
                        imgElement.parentElement!.innerHTML = `
                          <div class="flex items-center gap-2 text-sm text-orange-600">
                            <span>⚠️ Image failed to load</span>
                          </div>
                          <a href="https://fintechapi.softsuitetech.com/storage/${ticket.attachment}" target="_blank" rel="noopener noreferrer" class="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200">
                            📎 Download Instead
                          </a>
                        `;
                      }}
                    />
                  </div>
                ) : (
                  <a
                    href={`https://fintechapi.softsuitetech.com/storage/${ticket.attachment}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm font-medium transition-colors"
                  >
                    <span>📎</span>
                    <span>Download Attachment</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetailModal;
