"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchTicketMessages } from '@/redux/thunk/ticketMessagesThunk';
import { sendTicketMessage } from '@/redux/thunk/ticketMessagesThunk';
import { fetchTickets } from '@/redux/thunk/ticketsThunk';
import { Paperclip, X } from 'lucide-react';

const MessagesPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const ticketId = searchParams.get('ticketId') || '';
  
  const { messages: reduxMessages, loading, sending, sendError } = useAppSelector((state) => state.ticketMessages);
  const { tickets } = useAppSelector((state) => state.tickets);
  
  const currentTicket = tickets.find(t => t.id === parseInt(ticketId));

  const ticketAttachments = currentTicket?.attachment 
    ? [{ name: currentTicket.attachment, url: currentTicket.attachment }]
    : [];

  useEffect(() => {
    if (tickets.length === 0) {
      dispatch(fetchTickets({ page: 1 }));
    }
  }, [dispatch, tickets.length]);

  useEffect(() => {
    if (ticketId && currentTicket) {
      dispatch(fetchTicketMessages(ticketId));
    }
  }, [ticketId, currentTicket, dispatch]);

  const [newMessage, setNewMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [optimisticMessages, setOptimisticMessages] = useState<any[]>([]);

  // NEW: Modal state
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);

  // Use fresh messages from Redux if available, otherwise fallback to ticket.messages
  const messageSource = reduxMessages.length > 0 ? reduxMessages : (currentTicket?.messages || []);

  // All messages = real + optimistic
  const allMessages = [...messageSource, ...optimisticMessages];

  const displayMessages = allMessages.map((msg) => ({
    id: String(msg.id),
    sender: msg.sender_type === 'admin' ? 'Support Team' : 'You',
    message: msg.message,
    timestamp: new Date(msg.created_at).toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    isUser: msg.sender_type !== 'admin',
    attachments: msg.attachment ? [{ name: msg.attachment, url: msg.attachment }] : []
  }));

  // Auto scroll to bottom
  useEffect(() => {
    const messagesContainer = document.getElementById('messages-container');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, [displayMessages]);

  // NEW: Smart cleanup of optimistic messages when real ones arrive
  useEffect(() => {
    if (reduxMessages.length > 0 && optimisticMessages.length > 0) {
      const lastOptimistic = optimisticMessages[optimisticMessages.length - 1];
      const hasRealMatch = reduxMessages.some((realMsg: any) => {
        return realMsg.message === lastOptimistic.message &&
               realMsg.sender_type === 'user' &&
               new Date(realMsg.created_at) >= new Date(lastOptimistic.created_at);
      });

      if (hasRealMatch) {
        setOptimisticMessages([]);
      }
    }
  }, [reduxMessages, optimisticMessages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles([...selectedFiles, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && selectedFiles.length === 0) return;

    try {
      const file = selectedFiles.length > 0 ? selectedFiles[0] : null;
      
      const optimisticMsg = {
        id: Date.now(),
        support_ticket_id: parseInt(ticketId),
        sender_type: 'user',
        message: newMessage,
        attachment: file?.name || null,
        created_at: new Date().toISOString(),
      };
      
      setOptimisticMessages(prev => [...prev, optimisticMsg]);

      await dispatch(
        sendTicketMessage({
          ticketId,
          message: newMessage,
          attachment: file,
        })
      ).unwrap();

      setNewMessage('');
      setSelectedFiles([]);
      setSuccessMessage('Message sent successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);

      dispatch(fetchTicketMessages(ticketId));

    } catch (error) {
      console.error('Failed to send message:', error);
      setOptimisticMessages(prev => prev.filter(msg => msg.id !== Date.now()));
      setSuccessMessage('');
    }
  };

  return (
    <>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Link
          href="/support"
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium mb-6 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Tickets
        </Link>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400">
            ✅ {successMessage}
          </div>
        )}

        {sendError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
            ❌ {sendError}
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-6">
          <div className="flex items-start justify-between gap-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                Ticket: {currentTicket?.id || ticketId || 'Unknown'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{currentTicket?.subject || 'No subject'}</p>
            </div>

            {ticketAttachments.length > 0 && (
              <div className="flex flex-col items-end">
                <div className="flex flex-row gap-6 flex-wrap justify-end">
                  {ticketAttachments.map((file, idx) => {
                    const isImage = file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                    const fileUrl = file.url.startsWith('http')
                      ? file.url
                      : `https://fintechapi.softsuitetech.com/storage/${file.url}`;

                    return (
                      <div key={idx} className="flex flex-col items-center">
                        {isImage ? (
                          <img
                            src={fileUrl}
                            alt={file.name}
                            className="w-[14rem] h-auto rounded-lg border border-gray-300 cursor-pointer hover:opacity-80 transition-opacity shadow-md"
                            onClick={() => setModalImageUrl(fileUrl)} // Open modal instead of new tab
                            onError={(e) => {
                              const imgElement = e.target as HTMLImageElement;
                              imgElement.parentElement!.innerHTML = `
                                <div class="flex flex-col items-center gap-2 text-sm text-orange-600 mb-2">
                                  <span>⚠️ Image failed to load</span>
                                </div>
                                <a href="${fileUrl}" target="_blank" rel="noopener noreferrer" class="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded text-sm font-medium hover:bg-blue-200">
                                  📎 Download Instead
                                </a>
                              `;
                            }}
                          />
                        ) : (
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center gap-3 p-6 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                          >
                            <Paperclip className="w-12 h-12 text-gray-600" />
                            <span className="text-sm text-gray-700 text-center max-w-[180px] truncate">
                              {file.name}
                            </span>
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col h-96">
          <div className="flex-1 overflow-y-auto p-6 space-y-4" id="messages-container">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 dark:text-gray-400">Loading messages...</p>
              </div>
            ) : displayMessages.length > 0 ? (
              displayMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-lg px-4 py-3 rounded-lg ${
                      msg.isUser
                        ? 'bg-blue-600 dark:bg-blue-700 text-white'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-100'
                    }`}
                  >
                    {!msg.isUser && (
                      <p className="text-xs font-semibold mb-1 opacity-75">{msg.sender}</p>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>

                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {msg.attachments.map((file, idx) => {
                          const isImage = file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                          const fileUrl = file.url.startsWith('http') ? file.url : `https://fintechapi.softsuitetech.com/storage/${file.url}`;
                          
                          return (
                            <div key={idx} className="p-2 bg-gray-50 rounded border border-gray-300">
                              {isImage ? (
                                <img
                                  src={fileUrl}
                                  alt={file.name}
                                  className="w-[14rem] h-auto rounded max-h-48 cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => setModalImageUrl(fileUrl)} // Open modal
                                  onError={(e) => {
                                    const imgElement = e.target as HTMLImageElement;
                                    imgElement.parentElement!.innerHTML = `
                                      <div class="flex items-center gap-2 text-sm text-orange-600 mb-2">
                                        <span>⚠️ Image failed to load</span>
                                      </div>
                                      <a href="${fileUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200">
                                        <span>📎</span>
                                        <span>Download File</span>
                                      </a>
                                    `;
                                  }}
                                />
                              ) : (
                                <a
                                  href={fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`flex items-center gap-2 text-xs px-3 py-2 rounded-md ${
                                    msg.isUser
                                      ? 'bg-blue-700 dark:bg-blue-900/30 text-blue-100 dark:text-blue-400 hover:bg-blue-800 dark:hover:bg-blue-900/50'
                                      : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-500'
                                  } transition-colors`}
                                >
                                  <Paperclip className="w-4 h-4" />
                                  <span className="truncate max-w-xs">{file.name}</span>
                                </a>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 dark:text-gray-400">No messages yet. Start the conversation.</p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 dark:border-slate-700 p-6">
            {currentTicket?.status?.toLowerCase() === 'closed' ? (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
                ❌ This ticket is closed. You cannot send messages on closed tickets.
              </div>
            ) : (
              <>
                {selectedFiles.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-100 dark:bg-slate-700 px-3 py-2 rounded-md text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <Paperclip className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          <span className="truncate max-w-xs text-gray-700 dark:text-gray-300">{file.name}</span>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={sending}
                  />

                  <input
                    type="file"
                    id="file-upload"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <label
                    htmlFor="file-upload"
                    className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors flex items-center gap-2"
                  >
                    <Paperclip className="w-5 h-5" />
                    <span className="hidden sm:inline">Attach</span>
                  </label>

                  <button
                    type="submit"
                    disabled={sending || (!newMessage.trim() && selectedFiles.length === 0)}
                    className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-75 disabled:cursor-not-allowed transition-colors"
                  >
                    {sending ? (
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      'Send'
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      {/* NEW: Image Modal */}
      {modalImageUrl && (
        <div 
          className="fixed inset-0 bg-black/40 z-[100000] flex items-center justify-center p-4"
          onClick={() => setModalImageUrl(null)}
        >
          <div className="relative max-w-3xl max-h-full">
            <button
              onClick={() => setModalImageUrl(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 text-4xl font-light"
            >
              ×
            </button>
            <img
              src={modalImageUrl}
              alt="Full size"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default MessagesPage;