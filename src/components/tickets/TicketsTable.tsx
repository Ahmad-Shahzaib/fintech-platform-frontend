"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchTickets, SupportTicket } from '@/redux/thunk/ticketsThunk';
import TicketDetailModal from './TicketDetailModal';

interface Ticket {
  id: number;
  subject: string;
  issue_type: string;
  priority_level: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const TicketsTable = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { tickets, loading, error } = useAppSelector((state) => state.tickets);
  const tableRef = useRef<HTMLDivElement>(null);
  
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchTickets({ page: 1 }));
  }, [dispatch]);

  // Close dropdown when table scrolls
  useEffect(() => {
    const tableElement = tableRef.current;
    if (!tableElement) return;

    const handleScroll = () => {
      setOpenDropdown(null);
    };

    tableElement.addEventListener('scroll', handleScroll);
    return () => {
      tableElement.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const getPriorityColor = (priority: string) => {
    switch(priority?.toLowerCase()) {
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
    switch(status?.toLowerCase()) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'inprogress':
      case 'in-progress':
        return 'bg-purple-100 text-purple-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'closed':
      case 'close':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getIssueTypeLabel = (type: string) => {
    return type || 'Unknown';
  };

  // State to control which dropdown is open
  const toggleDropdown = (ticketId: number) => {
    setOpenDropdown(prev => prev === ticketId ? null : ticketId);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header with Title and Add Button */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Support Tickets</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">View and manage your support tickets</p>
        </div>
        <Link
          href="/support/create-ticket"
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          + Add Ticket
        </Link>
      </div>
      
      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Tickets</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{tickets.length}</p>
            </div>
            <div className="text-3xl text-gray-300">📋</div>
          </div>
        </div>
        {/* closed */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Closed</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                        {
                            tickets.filter((t) => t.status?.toLowerCase() === "closed").length
                        }
                    </p>
                </div>
                <div className="text-3xl text-green-300">✅</div>
            </div>
        </div>
        

       

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Open</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                {tickets.filter(t => t.status?.toLowerCase() === 'inprogress').length}
              </p>
            </div>
            <div className="text-3xl text-purple-300">⚙️</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Pending</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                {tickets.filter(t => t.status?.toLowerCase() === 'pending').length}
              </p>
            </div>
            <div className="text-3xl text-orange-300">⏳</div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden mt-4" ref={tableRef}>
        {loading && (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Loading tickets...</p>
          </div>
        )}
        
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Ticket ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Subject</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Issue Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Priority</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Action</th>
                </tr>
              </thead>
              <tbody>
                {tickets.length > 0 ? (
                  tickets.map((ticket) => (
                    <tr key={ticket.id} className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-blue-600 dark:text-blue-400">{ticket.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{ticket.subject}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{getIssueTypeLabel(ticket.issue_type)}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority_level)}`}>
                          {ticket.priority_level?.charAt(0).toUpperCase() + ticket.priority_level?.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                          {ticket.status?.toLowerCase() === 'inprogress'
                            ? 'Open'
                            : ticket.status?.charAt(0).toUpperCase() + ticket.status?.slice(1).toLowerCase().replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-lg relative">
                        <button
                          onClick={() => toggleDropdown(ticket.id)}
                          className="text-gray-600 hover:text-gray-900 focus:outline-none"
                        >
                          ...
                        </button>

                        {/* Dropdown Menu */}
                        {openDropdown === ticket.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-700 rounded-md shadow-lg border border-gray-200 dark:border-slate-600 z-10">
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  setSelectedTicket(ticket);
                                  setIsModalOpen(true);
                                  setOpenDropdown(null);
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600"
                              >
                                View Details
                              </button>
                              {ticket.status?.toLowerCase() !== 'pending' && (
                                <button
                                  onClick={() => {
                                    router.push(`/support/messages?ticketId=${ticket.id}`);
                                    setOpenDropdown(null);
                                  }}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600"
                                >
                                  Send Message
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      <p className="text-lg font-medium">No tickets found</p>
                      <p className="text-sm mt-2">Create your first support ticket by clicking the "Add Ticket" button</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ticket Detail Modal */}
      <TicketDetailModal
        isOpen={isModalOpen}
        ticket={selectedTicket ? {
          id: String(selectedTicket.id),
          subject: selectedTicket.subject,
          issueType: selectedTicket.issue_type,
          priority: selectedTicket.priority_level,
          status: selectedTicket.status,
          createdDate: selectedTicket.created_at,
          lastUpdated: selectedTicket.updated_at,
          description: selectedTicket.description,
          attachment: selectedTicket.attachment,
        } : null}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTicket(null);
        }}
      />
    </div>
  );
};

export default TicketsTable;