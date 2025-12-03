"use client";
import React, { useEffect, useState } from 'react';
import { resetFaqStatus } from '../../redux/slice/faqsSlice';
import createFaq from '../../redux/thunk/faqsThunk';
import fetchFaqs from '../../redux/thunk/fetchFaqsThunk';
import deleteFaq from '../../redux/thunk/deleteFaqThunk';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';

const ManageFaqs: React.FC = () => {
  const dispatch = useAppDispatch();
  const { loading, success, error, faqs, fetching, deletingId, deleteError } = useAppSelector((s) => s.faqs);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id?: string | number; question?: string } | null>(null);

  useEffect(() => {
    if (success) {
      setQuestion('');
      setAnswer('');
      const t = setTimeout(() => dispatch(resetFaqStatus()), 2500);
      // refetch list after successful create
      dispatch(fetchFaqs());
      setShowModal(false);
      return () => clearTimeout(t);
    }
  }, [success, dispatch]);

  useEffect(() => {
    // fetch faqs on mount
    dispatch(fetchFaqs());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;
    dispatch(createFaq({ question: question.trim(), answer: answer.trim() }));
  };

  const handleDelete = (id?: string | number, question?: string) => {
    if (!id) return;
    setDeleteTarget({ id, question });
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget?.id) return;
    dispatch(deleteFaq(String(deleteTarget.id)));
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-800">Manage FAQs</h3>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add FAQ
        </button>
      </div>

      {/* List */}
      <div className="space-y-4">
        {fetching ? (
          <p>Loading FAQs...</p>
        ) : (
          (faqs || []).map((f: any, idx: number) => (
            <div key={f.id || idx} className="bg-white shadow rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-gray-800">{f.question}</h4>
                  <p className="text-gray-600 mt-2">{f.answer}</p>
                </div>
                <div className="ml-4 flex items-center gap-2">
                  <button
                    onClick={() => handleDelete(f.id, f.question)}
                    disabled={deletingId === String(f.id)}
                    className={`px-3 py-1 rounded-lg text-white ${deletingId === String(f.id) ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'}`}
                  >
                    {deletingId === String(f.id) ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
              {deleteError && deletingId === String(f.id) && <p className="text-red-600 mt-2">{deleteError}</p>}
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 opacity-40" onClick={() => setShowModal(false)} />
          <div className="bg-white rounded-lg shadow-lg z-10 w-full max-w-xl p-6">
            <h4 className="text-lg font-semibold mb-4">Add FAQ</h4>
            <form onSubmit={(e) => { handleSubmit(e); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Enter question"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Answer</label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Enter answer"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg text-white ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border">Cancel</button>
                {success && <p className="text-green-600">Saved.</p>}
                {error && <p className="text-red-600">{error}</p>}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 opacity-40" onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }} />
          <div className="bg-white rounded-lg shadow-lg z-10 w-full max-w-md p-6">
            <h4 className="text-lg font-semibold mb-4">Confirm Delete</h4>
            <p className="text-sm text-gray-700 mb-4">Are you sure you want to delete this FAQ?</p>
            {deleteTarget?.question && <p className="text-gray-600 italic mb-4">"{deleteTarget.question}"</p>}

            <div className="flex items-center gap-3 justify-end">
              <button type="button" onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }} className="px-4 py-2 rounded-lg border">Cancel</button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={!!deletingId}
                className={`px-4 py-2 rounded-lg text-white ${deletingId ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {deletingId ? 'Deleting...' : 'Delete'}
              </button>
            </div>

            {deleteError && <p className="text-red-600 mt-3">{deleteError}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageFaqs;