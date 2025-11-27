"use client";
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrencies, addCurrency, updateCurrency } from '@/redux/thunk/currencyThunks';
import CurrencyDetailModal from './CurrencyDetailModal';
import { RootState, AppDispatch } from '@/redux/store';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';
import AddCurrencyModal from './AddCurrencyModal';

// Define TypeScript interfaces for our data
interface Network {
    id: number;
    code: string;
    name: string;
    contract_address: string | null;
    network_fee_estimate_aud: string;
}

interface Currency {
    id: number;
    code: string;
    name: string;
    symbol: string;
    description: string;
    decimals: number;
    networks: Network[];
}

const ManageCurrencies = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { items, loading, error } = useSelector(
        (state: RootState) => state.currencies
    );
    const currencies = (items || []) as Currency[];
    const [modalMode, setModalMode] = useState<null | 'add' | 'edit'>(null);
    const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailId, setDetailId] = useState<number | null>(null);

    useEffect(() => {
        dispatch(fetchCurrencies());
    }, [dispatch]);

    const handleAddCurrency = (currencyData: any) => {
        // Dispatch addCurrency thunk, then refresh list on success
        (async () => {
            try {
                await dispatch(addCurrency(currencyData));
                setModalMode(null);
                // Refresh to ensure latest data (optional if backend returns full object)
                dispatch(fetchCurrencies());
            } catch (err) {
                console.error('Failed to add currency', err);
            }
        })();
    };

    const handleUpdateCurrency = (id: number, currencyData: any) => {
        (async () => {
            try {
                await dispatch(updateCurrency({ id, payload: currencyData }));
                setModalMode(null);
                setSelectedCurrency(null);
                dispatch(fetchCurrencies());
            } catch (err) {
                console.error('Failed to update currency', err);
            }
        })();
    };

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Helper function to truncate address
    const truncateAddress = (address: string | null) => {
        if (!address) return null;
        return `${address.substring(0, 5)}...`;
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <Button 
                className='float-right mb-4' 
                onClick={() => { setSelectedCurrency(null); setModalMode('add'); }}
            >
                Add New Currency
            </Button>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Currencies</h1>

            <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Currency
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Symbol
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Description
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Decimals
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            // Loading skeletons
                            [...Array(4)].map((_, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="ml-4">
                                                <Skeleton className="h-4 w-24 mb-1" />
                                                <Skeleton className="h-3 w-16" />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Skeleton className="h-4 w-6" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <Skeleton className="h-4 w-full max-w-xs" />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Skeleton className="h-4 w-8" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-2">
                                            <div className="bg-gray-50 p-3 rounded-md">
                                                <div className="flex justify-between mb-1">
                                                    <Skeleton className="h-4 w-20" />
                                                    <Skeleton className="h-4 w-12" />
                                                </div>
                                                <Skeleton className="h-3 w-full" />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            // Actual data
                            currencies.map((currency: Currency) => (
                                <tr key={currency.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{currency.name}</div>
                                                <div className="text-sm text-gray-500">{currency.code}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {currency.symbol}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                                        {currency.description}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {currency.decimals}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 relative">
                                        <div>
                                            <button
                                                onClick={() => setOpenMenuId(openMenuId === currency.id ? null : currency.id)}
                                                className="p-1 rounded hover:bg-gray-100"
                                                aria-haspopup="true"
                                                aria-expanded={openMenuId === currency.id}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM18 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                            </button>

                                            {openMenuId === currency.id && (
                                                <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow z-10">
                                                    <button
                                                        className="w-full text-left px-3 py-2 hover:bg-gray-50"
                                                        onClick={() => {
                                                            // Open detail modal and let the modal fetch data
                                                            setDetailId(currency.id);
                                                            setDetailOpen(true);
                                                            setOpenMenuId(null);
                                                        }}
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        className="w-full text-left px-3 py-2 hover:bg-gray-50"
                                                        onClick={() => {
                                                            setSelectedCurrency(currency);
                                                            setModalMode('edit');
                                                            setOpenMenuId(null);
                                                        }}
                                                    >
                                                        Update
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
            <AddCurrencyModal
                isOpen={modalMode !== null}
                initialData={modalMode === 'edit' ? selectedCurrency ?? undefined : undefined}
                submitLabel={modalMode === 'edit' ? 'Update Currency' : 'Add Currency'}
                onClose={() => { setModalMode(null); setSelectedCurrency(null); }}
                onSubmit={(data: any) => {
                    if (modalMode === 'edit' && selectedCurrency) {
                        handleUpdateCurrency(selectedCurrency.id, data);
                    } else {
                        handleAddCurrency(data);
                    }
                }}
            />
            <CurrencyDetailModal
                isOpen={detailOpen}
                id={detailId}
                onClose={() => { setDetailOpen(false); setDetailId(null); }}
            />
        </div>
    );
};

export default ManageCurrencies;