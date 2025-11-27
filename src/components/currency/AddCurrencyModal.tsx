// components/AddCurrencyModal.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

interface CurrencyFormData {
  code: string;
  name: string;
  symbol: string;
  description: string;
  decimals: string;
  icon_url: string;
  is_active: boolean;
  min_amount: string;
  max_amount: string;
  sort_order: string;
}

interface AddCurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: Partial<CurrencyFormData> | Record<string, any> | null;
  submitLabel?: string;
}

const blankForm = (): CurrencyFormData => ({
  code: '',
  name: '',
  symbol: '',
  description: '',
  decimals: '',
  icon_url: '',
  is_active: true,
  min_amount: '',
  max_amount: '',
  sort_order: '',
});

const AddCurrencyModal: React.FC<AddCurrencyModalProps> = ({ isOpen, onClose, onSubmit, initialData = null, submitLabel }) => {
  const [formData, setFormData] = useState<CurrencyFormData>({
    ...blankForm(),
  });

  useEffect(() => {
    if (isOpen && initialData) {
      // Map incoming initial data into string fields expected by the form
      setFormData({
        code: initialData.code ?? '',
        name: initialData.name ?? '',
        symbol: initialData.symbol ?? '',
        description: initialData.description ?? '',
        decimals: initialData.decimals !== undefined && initialData.decimals !== null ? String(initialData.decimals) : '',
        icon_url: initialData.icon_url ?? '',
        is_active: initialData.is_active ?? true,
        min_amount: initialData.min_amount !== undefined && initialData.min_amount !== null ? String(initialData.min_amount) : '',
        max_amount: initialData.max_amount !== undefined && initialData.max_amount !== null ? String(initialData.max_amount) : '',
        sort_order: initialData.sort_order !== undefined && initialData.sort_order !== null ? String(initialData.sort_order) : '',
      });
    }
    if (!isOpen) {
      setFormData(blankForm());
    }
  }, [isOpen, initialData]);

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;
    const val: any = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: val } as CurrencyFormData));
  };
  

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      ...blankForm(),
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">{submitLabel ?? (initialData ? 'Edit Currency' : 'Add New Currency')}</h2>
          <Button variant="ghost" onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
        
        <form onSubmit={handleSubmit}>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
    <div className="space-y-2">
      <Label htmlFor="code">Currency Code</Label>
      <Input
        id="code"
        name="code"
        value={formData.code}
        onChange={handleCurrencyChange}
        placeholder="e.g., BTC"
        required
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="name">Currency Name</Label>
      <Input
        id="name"
        name="name"
        value={formData.name}
        onChange={handleCurrencyChange}
        placeholder="e.g., Bitcoin"
        required
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="symbol">Symbol</Label>
      <Input
        id="symbol"
        name="symbol"
        value={formData.symbol}
        onChange={handleCurrencyChange}
        placeholder="e.g., ₿"
        required
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="decimals">Decimals</Label>
      <Input
        id="decimals"
        name="decimals"
        type="number"
        value={formData.decimals}
        onChange={handleCurrencyChange}
        placeholder="e.g., 8"
        required
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="icon_url">Icon URL</Label>
      <Input
        id="icon_url"
        name="icon_url"
        value={formData.icon_url}
        onChange={handleCurrencyChange}
        placeholder="https://example.com/icon.png"
      />
    </div>
  </div>

  <div className="space-y-2 mb-6">
    <Label htmlFor="description">Description</Label>
    <Textarea
      id="description"
      name="description"
      value={formData.description}
      onChange={handleCurrencyChange}
      placeholder="Currency description"
      rows={3}
      required
    />
  </div>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
    <div className="space-y-2">
      <Label htmlFor="min_amount">Min Amount</Label>
      <Input
        id="min_amount"
        name="min_amount"
        type="number"
        value={formData.min_amount}
        onChange={handleCurrencyChange}
        placeholder="e.g., 10"
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="max_amount">Max Amount</Label>
      <Input
        id="max_amount"
        name="max_amount"
        type="number"
        value={formData.max_amount}
        onChange={handleCurrencyChange}
        placeholder="e.g., 100000"
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="sort_order">Sort Order</Label>
      <Input
        id="sort_order"
        name="sort_order"
        type="number"
        value={formData.sort_order}
        onChange={handleCurrencyChange}
        placeholder="e.g., 1"
      />
    </div>
  </div>

  <div className="mb-6">
    <label className="inline-flex items-center">
      <input
        id="is_active"
        name="is_active"
        type="checkbox"
        checked={formData.is_active}
        onChange={handleCurrencyChange}
        className="mr-2"
      />
      <span className="text-sm text-gray-700">Active</span>
    </label>
  </div>

  {/* Networks removed from this modal */}

    <div className="flex justify-end space-x-2">
    <Button type="button" variant="outline" onClick={onClose}>
      Cancel
    </Button>
    <Button type="submit">{submitLabel ?? (initialData ? 'Update Currency' : 'Add Currency')}</Button>
  </div>
</form>

      </div>
    </div>
  );
};

export default AddCurrencyModal;