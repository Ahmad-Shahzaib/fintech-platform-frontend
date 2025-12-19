import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';
import axios from 'axios';

export interface PeriodRange {
    start: string;
    end: string;
}

export interface LendingStats {
    total_lent: string;
    transaction_count: number;
    average_loan_size: string;
}

export interface RevenueStats {
    platform_fees: string;
    network_fees: string;
    total_revenue: string;
}

export interface RepaymentsStats {
    total_repaid: string;
    payment_count: number;
    pending_verification: string;
}

export interface OutstandingStats {
    pending: string;
    partial: string;
    late: number;
    total_outstanding: string;
}

export interface LatePaymentsStats {
    count: number;
    total_amount: number;
    overdue_days_avg: number | null;
}

export interface DefaultsStats {
    count: number;
    total_amount: number;
}

export interface PerformanceStats {
    on_time_payment_rate: number;
    default_rate: number;
    average_repayment_days: number;
}

export interface FinancialSummaryData {
    period: PeriodRange;
    lending: LendingStats;
    revenue: RevenueStats;
    repayments: RepaymentsStats;
    outstanding: OutstandingStats;
    late_payments: LatePaymentsStats;
    defaults: DefaultsStats;
    performance: PerformanceStats;
}

export interface FinancialSummaryResponse {
    data: FinancialSummaryData;
}

export interface FinancialSummaryParams {
    start_date?: string;
    end_date?: string;
}

export const fetchFinancialSummary = createAsyncThunk(
    'financialSummary/fetch',
    async (params: FinancialSummaryParams = {}, { rejectWithValue }) => {
        try {
            const query = new URLSearchParams();
            if (params.start_date) query.set('start_date', params.start_date);
            if (params.end_date) query.set('end_date', params.end_date);

            const response = await api.get<FinancialSummaryResponse>(
                `/admin/reports/financial-summary?${query.toString()}`
            );
            const payload = response.data?.data ?? null;
            return payload;
        } catch (err: any) {
            if (axios.isAxiosError(err)) {
                const message = err.response?.data?.message || err.message || 'Failed to fetch financial summary';
                return rejectWithValue(message);
            }
            return rejectWithValue('Network error');
        }
    }
);
