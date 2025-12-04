// components/FAQ.jsx
"use client";
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import fetchFaqs from '../../redux/thunk/fetchFaqsThunk';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const dispatch = useAppDispatch();
  const { faqs: fetchedFaqs, fetching, fetchError } = useAppSelector((s) => s.faqs);


  useEffect(() => {
    dispatch(fetchFaqs());
  }, [dispatch]);

  // use fetched FAQs only; show a message when none are available
  const faqs = Array.isArray(fetchedFaqs) ? fetchedFaqs : [];

  const toggleFAQ = (index: number): void => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen shadow-md rounded-xl py-12">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about our products and services
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {fetching ? (
            <div className="p-4 text-center text-gray-600">Loading FAQs...</div>
          ) : fetchError ? (
            <div className="p-4 text-center text-red-600">{fetchError}</div>
          ) : faqs.length > 0 ? (
            faqs.map((faq, index) => (
              <div
                key={faq.id ?? index}
                className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md"
              >
                <button
                  className="flex justify-between items-center w-full p-5 text-left bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  onClick={() => toggleFAQ(index)}
                  aria-expanded={openIndex === index}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span className="font-medium text-gray-800">{faq.question}</span>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${
                      openIndex === index ? 'transform rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <div
                  id={`faq-answer-${index}`}
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                  aria-hidden={openIndex !== index}
                >
                  <div className="p-5 pt-0 text-gray-600 bg-gray-50">
                    <p>{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-600">No FAQs found.</div>
          )}
        </div>

      
      </div>
    </div>
  );
};

export default FAQ;