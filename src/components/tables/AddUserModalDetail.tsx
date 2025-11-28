// pages/users.js
import React, { useEffect, useState, useMemo } from 'react';
import Head from 'next/head';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchUsers } from '../../redux/slice/usersSlice';
import { fetchUserDetail } from '../../redux/thunk/userThunks';
import axios from '../../lib/axios';

type FormDataType = {
    name: string;
    email: string;
    role: string;
    active: boolean;
};

const AddUserModalDetail = () => {
    const dispatch = useAppDispatch();
    const usersState = useAppSelector((state) => state.users || { users: [], loading: false });
    const userDetailState = useAppSelector((state) => (state as any).userDetail || { data: null, loading: false });
    const { loading } = usersState;
    const users = (() => {
        // normalize to an array in case the slice or API returned an object
        const u = (usersState as any).users;
        if (Array.isArray(u)) return u;
        if (!u) return [];
        if (Array.isArray(u.data)) return u.data;
        if (Array.isArray(u.users)) return u.users;
        return [];
    })();
    const meta = (usersState as any).meta;
    const [page, setPage] = useState<number>(meta?.current_page ?? 1);

    const totalPages = meta?.last_page ?? 1;
    const currentPage = meta?.current_page ?? page;

    const pagesToRender = useMemo(() => {
        const tp = totalPages;
        const curr = currentPage;
        if (tp <= 9) return Array.from({ length: tp }, (_, i) => i + 1);
        const pages = new Set<number>();
        pages.add(1);
        pages.add(2);
        pages.add(tp - 1);
        pages.add(tp);
        for (let i = curr - 2; i <= curr + 2; i++) {
            if (i > 2 && i < tp - 1) pages.add(i);
        }
        return Array.from(pages).sort((a, b) => a - b);
    }, [totalPages, currentPage]);

    useEffect(() => {
        dispatch(fetchUsers({ page }));
    }, [dispatch, page]);

    // State for modal visibility
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (openDropdownId !== null) {
                const target = event.target as HTMLElement;
                if (!target.closest('.dropdown-container')) {
                    setOpenDropdownId(null);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openDropdownId]);

    // State for form data
    const [formData, setFormData] = useState<FormDataType>({
        name: '',
        email: '',
        role: 'user',
        active: true,
    });

    // initial fetch is handled by the effect that depends on `page`

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const target = e.target as HTMLInputElement;
        const { name, value, type, checked } = target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        } as unknown as FormDataType);
    };

    // Handle form submission: for now refresh the list after closing modal
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // TODO: Replace with a create-user thunk when available
        setFormData({ name: '', email: '', role: 'user', active: true });
        setIsModalOpen(false);
        // refresh list (stay on current page)
        dispatch(fetchUsers({ page }));
    };

    // Toggle user status by calling API and refreshing list
    const toggleUserStatus = async (id: number) => {
        try {
            const current = users.find((u: any) => u.id === id);
            const currentStatus = current?.status ?? (current?.active ? 'active' : 'inactive');
            const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
            // Attempt to update backend status (endpoint may vary)
            await axios.patch(`/admin/users/${id}`, { status: newStatus });
            dispatch(fetchUsers({ page }));
        } catch (err) {
            // swallow or show error; keep UX stable
            console.error('Failed to toggle user status', err);
            dispatch(fetchUsers({ page }));
        }
    };

    const openUserDetail = async (id: number) => {
        try {
            await dispatch(fetchUserDetail(id));
            setIsDetailOpen(true);
        } catch (err) {
            console.error('Failed to fetch user detail', err);
        }
    };

    const blockUser = async (id: number) => {
        try {
            await axios.patch(`/admin/users/${id}`, { status: 'suspended' });
            dispatch(fetchUsers({ page }));
            if (isDetailOpen) await dispatch(fetchUserDetail(id));
        } catch (err) {
            console.error('Failed to block user', err);
            dispatch(fetchUsers({ page }));
        }
    };

    const unblockUser = async (id: number) => {
        try {
            await axios.patch(`/admin/users/${id}`, { status: 'active' });
            dispatch(fetchUsers({ page }));
            if (isDetailOpen) await dispatch(fetchUserDetail(id));
        } catch (err) {
            console.error('Failed to unblock user', err);
            dispatch(fetchUsers({ page }));
        }
    };

    return (
        <div className="min-h-screen  dark:bg-gray-900">
            <Head>
                <title>User Management</title>
                <meta name="description" content="Manage users" />
            </Head>

            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">User Management</h1>

                </div>

                {/* Users Table */}
                <div className="bg-white shadow-md rounded-lg overflow-hidden dark:bg-gray-800">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                        ID
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                        Name
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                        Email
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                        Role
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">Loading...</td>
                                    </tr>
                                ) : (
                                    users.map((user: any) => {
                                        const roleLabel = typeof user.role === 'string' ? user.role : user.role?.name || user.role?.display_name || 'user';
                                        const isActive = user.status ? user.status === 'active' : user.active === true;
                                        return (
                                            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900 dark:text-gray-300">{user.email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${roleLabel === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}
                                                    >
                                                        {roleLabel}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}
                                                    >
                                                        {isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="relative inline-block text-left dropdown-container">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setOpenDropdownId(openDropdownId === user.id ? null : user.id);
                                                            }}
                                                            className="inline-flex justify-center w-full rounded-md px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM18 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                            </svg>
                                                        </button>
                                                        {openDropdownId === user.id && (
                                                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-20 py-1">
                                                                <button
                                                                    onClick={() => {
                                                                        openUserDetail(user.id);
                                                                        setOpenDropdownId(null);
                                                                    }}
                                                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors flex items-center"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                        <path d="M2.05 12C3.43 7.36 7.4 4 12 4s8.57 3.36 9.95 8c-1.38 4.64-5.35 8-9.95 8S3.43 16.64 2.05 12z" />
                                                                    </svg>
                                                                    View Details
                                                                </button>
                                                                {isActive ? (
                                                                    <button
                                                                        onClick={() => {
                                                                            blockUser(user.id);
                                                                            setOpenDropdownId(null);
                                                                        }}
                                                                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 transition-colors flex items-center"
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                            <circle cx="12" cy="12" r="10" />
                                                                            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                                                                        </svg>
                                                                        Block
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => {
                                                                            unblockUser(user.id);
                                                                            setOpenDropdownId(null);
                                                                        }}
                                                                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-green-600 dark:text-green-400 transition-colors flex items-center"
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                            <path d="M5 13l4 4L19 7" />
                                                                        </svg>
                                                                        Unblock
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination (moved below table, styled) */}
                {meta && (
                    <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                            Showing <span className="font-medium">{meta.from ?? 1}</span> to <span className="font-medium">{meta.to ?? users.length}</span> of <span className="font-medium">{meta.total ?? users.length}</span> users
                        </div>

                        <nav className="inline-flex items-center space-x-2 bg-white dark:bg-gray-800 p-2 rounded-md shadow-sm" aria-label="Pagination">
                            <button
                                onClick={() => setPage(Math.max(1, (meta.current_page || 1) - 1))}
                                disabled={(meta.current_page || 1) <= 1}
                                className="px-3 py-1 rounded-md border text-sm hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-300 dark:border-gray-600"
                            >
                                Prev
                            </button>

                            {pagesToRender.map((p, idx) => {
                                // insert ellipsis if gap
                                const prev = pagesToRender[idx - 1];
                                const showEllipsis = prev !== undefined && p - prev > 1;
                                return (
                                    <React.Fragment key={p}>
                                        {showEllipsis && <span className="px-2 text-sm text-gray-400">...</span>}
                                        <button
                                            onClick={() => setPage(p)}
                                            className={`px-3 py-1 rounded-md border text-sm ${p === (meta.current_page || 1) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 dark:border-gray-600'}`}
                                        >
                                            {p}
                                        </button>
                                    </React.Fragment>
                                );
                            })}

                            <button
                                onClick={() => setPage(Math.min((meta.last_page || 1), (meta.current_page || 1) + 1))}
                                disabled={(meta.current_page || 1) >= (meta.last_page || 1)}
                                className="px-3 py-1 rounded-md border text-sm hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-300 dark:border-gray-600"
                            >
                                Next
                            </button>
                        </nav>
                    </div>
                )}
            </div>


            {/* User Detail Modal */}
            {isDetailOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 ">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl p-6 dark:bg-gray-800">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">User Detail</h3>
                            <button onClick={() => setIsDetailOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100">
                                Close
                            </button>
                        </div>

                        {userDetailState.loading ? (
                            <div className="text-gray-600 dark:text-gray-300">Loading...</div>
                        ) : userDetailState.error ? (
                            <div className="text-red-500">{userDetailState.error}</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Name</div>
                                    <div className="font-medium text-gray-900 dark:text-white">{userDetailState.data?.name ?? '-'}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Email</div>
                                    <div className="font-medium text-gray-900 dark:text-white">{userDetailState.data?.email ?? '-'}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Phone</div>
                                    <div className="font-medium text-gray-900 dark:text-white">{userDetailState.data?.phone ?? '-'}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
                                    <div className="font-medium text-gray-900 dark:text-white">{userDetailState.data?.status ?? '-'}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Transaction limit</div>
                                    <div className="font-medium text-gray-900 dark:text-white">{userDetailState.data?.transaction_limit ?? '-'}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Last login</div>
                                    <div className="font-medium text-gray-900 dark:text-white">{userDetailState.data?.last_login_at ?? '-'}</div>
                                </div>


                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddUserModalDetail;