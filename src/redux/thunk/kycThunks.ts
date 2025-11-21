import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../rootReducer';
import api from '../../lib/axios';

type DocumentFiles = {
    front: File | null;
    back: File | null;
    selfie: File | null;
};

// Define the shape of the data we will send to the API
export interface KycSubmissionPayload {
    fullName: string;
    dateOfBirth: string;
    address: string;
    city: string;
    country: string;
    postalCode: string;
    email: string;
    phoneNumber: string;
    documentType: string;
    nationalIdNumber: string;
    documents: DocumentFiles;
    acceptTerms: boolean;
}

// Define the shape of the successful API response
export interface KycSubmissionResponse {
    message: string;
    data: {
        id: number;
        status: string; // e.g., "pending"
        submitted_at: string; // ISO 8601 date string
    };
}

const appendIfPresent = (formData: FormData, key: string, value: string | null | undefined) => {
    if (value === undefined || value === null) return;
    formData.append(key, value);
};

export const submitKyc = createAsyncThunk<
    KycSubmissionResponse, // Type of the return value on success
    KycSubmissionPayload, // Type of the argument passed to the thunk
    { state: RootState } // Type for the thunk's API (for accessing state if needed)
>('kyc/submitKyc', async (kycData, { rejectWithValue }) => {
    try {
        // Create a FormData object to handle both text fields and file uploads
        const formData = new FormData();

        // Append all text-based fields from the payload using backend field names
        formData.append('full_name', kycData.fullName.trim());
        formData.append('date_of_birth', kycData.dateOfBirth.trim());
        formData.append('address', kycData.address.trim());
        formData.append('city', kycData.city.trim());
        formData.append('country', kycData.country.trim().toUpperCase());
        formData.append('postal_code', kycData.postalCode.trim());
        formData.append('email', kycData.email.trim());
        formData.append('phone_number', kycData.phoneNumber.trim());
        formData.append('document_type', kycData.documentType.trim().toLowerCase());
        appendIfPresent(formData, 'national_id_number', kycData.nationalIdNumber?.trim());
        formData.append('accept_terms', kycData.acceptTerms ? 'true' : 'false');

        // Append document files using expected backend keys
        if (kycData.documents.front) {
            formData.append('document_front', kycData.documents.front);
        }

        if (kycData.documents.back) {
            formData.append('document_back', kycData.documents.back);
        }

        if (kycData.documents.selfie) {
            formData.append('selfie_image', kycData.documents.selfie);
        }

        // Debug: log FormData entries so we can see what is being sent
        try {
            console.log('KYC FormData entries:');
            for (const pair of formData.entries() as IterableIterator<[string, FormDataEntryValue]>) {
                const [key, value] = pair;
                if (value instanceof File) {
                    console.log(`  ${key}: File { name: ${value.name}, type: ${value.type}, size: ${value.size} }`);
                } else {
                    console.log(`  ${key}: ${value}`);
                }
            }
        } catch {
            // ignore logging errors
        }

        // Use axios instance with configured baseURL so it uses NEXT_PUBLIC_API_BASE_URL
        const response = await api.post('/kyc/submit', formData);

        // axios returns data on success
        const data: KycSubmissionResponse = response.data;
        return data;

    } catch (error: unknown) {
        // Normalize error for logging and inspection
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err: any = error;
        console.error('KYC Submission Error:', err);

        // Try to read axios error details if present (validation errors from backend)
        if (err?.response && err.response.data) {
            const respData = err.response.data;
            // If backend uses Laravel-style validation errors
            if (respData.errors) {
                console.error('Validation errors:', respData.errors);
                return rejectWithValue(JSON.stringify(respData.errors));
            }

            const serverMsg = respData.message || respData.error || JSON.stringify(respData);
            return rejectWithValue(serverMsg);
        }

        if (err instanceof Error) {
            return rejectWithValue(err.message);
        }

        return rejectWithValue('An unknown error occurred during KYC submission.');
    }
});