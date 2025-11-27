"use client";
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNetworks } from '@/redux/thunk/networkThunks';
import { RootState, AppDispatch } from '@/redux/store';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';
import AddNetworkModal from './AddNetworkModal';

interface Network {
    id: number;
    code: string;
    name: string;
    full_name: string;
    description: string;
    chain_id: string | null;
    avg_transaction_fee_aud: string;
    requires_checksum: boolean;
}

const ManageNetworks = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { items, loading, error } = useSelector(
        (state: RootState) => state.networks
    );
    const networks = (items || []) as Network[];
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchNetworks());
    }, [dispatch]);

    const handleAddNetwork = (networkData: any) => {
        // Here you would typically dispatch an action to add the network
        console.log('Adding network:', networkData);
        // After successful addition, you might want to refresh the list
        dispatch(fetchNetworks());
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
                onClick={() => setIsModalOpen(true)}
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
                                Chain ID
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Avg Fee (AUD)
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Requires Checksum
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            // Loading skeletons
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
                                        <Skeleton className="h-4 w-10" />
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
                                        {network.chain_id || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        ${network.avg_transaction_fee_aud}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {network.requires_checksum ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                Yes
                                            </span>
                                        ) : (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                No
                                            </span>
                                        )}
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
                onSubmit={handleAddNetwork}
            />
        </div>
    );
};

export default ManageNetworks;