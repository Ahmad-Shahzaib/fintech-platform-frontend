"use client";
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNetworks, createNetwork, updateNetwork } from '@/redux/thunk/networkThunks';
import { RootState, AppDispatch } from '@/redux/store';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';
import AddNetworkModal from './AddNetworkModal';
import NetworkDetailModal from './NetworkDetailModal';

interface Network {
    id: number;
    code: string;
    name: string;
    full_name: string;
    description: string;
    icon_url?: string;
    chain_id: number | null;
    rpc_url?: string;
    explorer_url?: string;
    address_format?: string;
    avg_transaction_fee_aud: number;
    avg_confirmation_time_minutes?: number;
    is_active?: boolean;
    requires_checksum: boolean;
    confirmations_required?: number;
    sort_order?: number;
}

const ManageNetworks = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { items, loading, error } = useSelector(
        (state: RootState) => state.networks
    );
    const networks = (items || []) as Network[];
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'view' | 'edit'>('create');
    const [activeNetwork, setActiveNetwork] = useState<Network | null>(null);
    const [openMenuFor, setOpenMenuFor] = useState<number | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailId, setDetailId] = useState<number | null>(null);

    useEffect(() => {
        dispatch(fetchNetworks());
    }, [dispatch]);

    const handleAddNetwork = (networkData: any) => {
        // Here you would typically dispatch an action to add the network
        // normalize numeric and boolean fields
        const payload = {
            ...networkData,
            chain_id: networkData.chain_id === '' || networkData.chain_id === null ? null : Number(networkData.chain_id),
            avg_transaction_fee_aud: Number(networkData.avg_transaction_fee_aud),
            avg_confirmation_time_minutes: networkData.avg_confirmation_time_minutes ? Number(networkData.avg_confirmation_time_minutes) : undefined,
            confirmations_required: networkData.confirmations_required ? Number(networkData.confirmations_required) : undefined,
            sort_order: networkData.sort_order ? Number(networkData.sort_order) : undefined,
            is_active: networkData.is_active ?? true,
            requires_checksum: !!networkData.requires_checksum,
        };
            dispatch(createNetwork(payload));
        // refresh list after a small delay or let slice update items on fulfilled
        // dispatch(fetchNetworks());
    };

    const handleUpdateNetwork = (networkData: any) => {
        if (!activeNetwork) return;
        const payload = {
            ...networkData,
            chain_id: networkData.chain_id === '' || networkData.chain_id === null ? null : Number(networkData.chain_id),
            avg_transaction_fee_aud: Number(networkData.avg_transaction_fee_aud),
            avg_confirmation_time_minutes: networkData.avg_confirmation_time_minutes ? Number(networkData.avg_confirmation_time_minutes) : undefined,
            confirmations_required: networkData.confirmations_required ? Number(networkData.confirmations_required) : undefined,
            sort_order: networkData.sort_order ? Number(networkData.sort_order) : undefined,
            is_active: networkData.is_active ?? true,
            requires_checksum: !!networkData.requires_checksum,
        };
        dispatch(updateNetwork({ id: activeNetwork.id, ...payload }));
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

    return (
        <div className="container mx-auto px-4 py-8">
            <Button 
                className='float-right mb-4' 
                onClick={() => { setModalMode('create'); setActiveNetwork(null); setIsModalOpen(true); }}
            >
                Add Network
            </Button>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Networks</h1>

            <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Code
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Full Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Description
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Avg Fee (AUD)
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            // Loading skeletons (6 columns: Code, Name, Full Name, Description, Avg Fee, Action)
                            [...Array(4)].map((_, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Skeleton className="h-4 w-12" />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Skeleton className="h-4 w-20" />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Skeleton className="h-4 w-32" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <Skeleton className="h-4 w-full max-w-xs" />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Skeleton className="h-4 w-12" />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Skeleton className="h-4 w-8" />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            // Actual data
                            networks.map((network: Network) => (
                                <tr key={network.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{network.code}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {network.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {network.full_name}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                                        {network.description}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {Number.isFinite(Number(network.avg_transaction_fee_aud)) ? `$${Number(network.avg_transaction_fee_aud).toFixed(2)}` : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 relative">
                                        <div>
                                            <button
                                                onClick={() => setOpenMenuFor(openMenuFor === network.id ? null : network.id)}
                                                className="p-1 rounded hover:bg-gray-100"
                                                aria-haspopup="true"
                                                aria-expanded={openMenuFor === network.id}
                                            >
                                                <svg className="h-5 w-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM18 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                            </button>

                                            {openMenuFor === network.id && (
                                                <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow z-10">
                                                                    <button
                                                                        className="w-full text-left px-3 py-2 hover:bg-gray-50"
                                                                        onClick={() => { setDetailId(network.id); setDetailOpen(true); setOpenMenuFor(null); }}
                                                                    >
                                                                        View
                                                                    </button>
                                                            <button
                                                                className="w-full text-left px-3 py-2 hover:bg-gray-50"
                                                                onClick={() => { setModalMode('edit'); setActiveNetwork(network); setIsModalOpen(true); setOpenMenuFor(null); }}
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
            
            <AddNetworkModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={modalMode === 'edit' ? handleUpdateNetwork : handleAddNetwork}
                initialData={activeNetwork ? {
                    code: activeNetwork.code,
                    name: activeNetwork.name,
                    full_name: activeNetwork.full_name,
                    description: activeNetwork.description,
                    chain_id: activeNetwork.chain_id !== null && activeNetwork.chain_id !== undefined ? String(activeNetwork.chain_id) : '',
                    avg_transaction_fee_aud: activeNetwork.avg_transaction_fee_aud !== undefined ? String(activeNetwork.avg_transaction_fee_aud) : '',
                    requires_checksum: !!activeNetwork.requires_checksum,
                    icon_url: activeNetwork.icon_url ?? '',
                    rpc_url: activeNetwork.rpc_url ?? '',
                    explorer_url: activeNetwork.explorer_url ?? '',
                    address_format: activeNetwork.address_format ?? '',
                    avg_confirmation_time_minutes: activeNetwork.avg_confirmation_time_minutes !== undefined ? String(activeNetwork.avg_confirmation_time_minutes) : '',
                    is_active: activeNetwork.is_active ?? true,
                    confirmations_required: activeNetwork.confirmations_required !== undefined ? String(activeNetwork.confirmations_required) : '',
                    sort_order: activeNetwork.sort_order !== undefined ? String(activeNetwork.sort_order) : '',
                } : undefined}
                mode={modalMode}
            />
            <NetworkDetailModal
                isOpen={detailOpen}
                id={detailId}
                onClose={() => { setDetailOpen(false); setDetailId(null); }}
            />
        </div>
    );
};

export default ManageNetworks;