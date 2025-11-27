// components/AddNetworkModal.tsx
"use client";
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';

interface NetworkFormData {
  code: string;
  name: string;
  full_name: string;
  description: string;
  chain_id: string;
  avg_transaction_fee_aud: string;
  requires_checksum: boolean;
  icon_url: string;
  rpc_url: string;
  explorer_url: string;
  address_format: string;
  avg_confirmation_time_minutes: string;
  is_active: boolean;
  confirmations_required: string;
  sort_order: string;
}

interface AddNetworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NetworkFormData) => void;
  initialData?: Partial<NetworkFormData> | null;
  mode?: 'create' | 'view' | 'edit';
  isLoading?: boolean;
}

const AddNetworkModal: React.FC<AddNetworkModalProps> = ({ isOpen, onClose, onSubmit, initialData = null, mode = 'create', isLoading = false }) => {
  const [formData, setFormData] = useState<NetworkFormData>({
    code: '',
    name: '',
    full_name: '',
    description: '',
    chain_id: '',
    avg_transaction_fee_aud: '',
    requires_checksum: false,
    icon_url: '',
    rpc_url: '',
    explorer_url: '',
    address_format: '',
    avg_confirmation_time_minutes: '',
    is_active: true,
    confirmations_required: '',
    sort_order: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  React.useEffect(() => {
    if (isOpen && initialData) {
      setFormData(prev => ({ ...prev, ...initialData } as NetworkFormData));
    }
    if (!isOpen && mode === 'create') {
      // reset on close for create mode
      setFormData({
        code: '',
        name: '',
        full_name: '',
        description: '',
        chain_id: '',
        avg_transaction_fee_aud: '',
        requires_checksum: false,
        icon_url: '',
        rpc_url: '',
        explorer_url: '',
        address_format: '',
        avg_confirmation_time_minutes: '',
        is_active: true,
        confirmations_required: '',
        sort_order: '',
      });
    }
  }, [isOpen, initialData, mode]);

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, requires_checksum: checked }));
  };

  const handleIsActiveChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_active: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      code: '',
      name: '',
      full_name: '',
      description: '',
      chain_id: '',
      avg_transaction_fee_aud: '',
      requires_checksum: false,
      icon_url: '',
      rpc_url: '',
      explorer_url: '',
      address_format: '',
      avg_confirmation_time_minutes: '',
      is_active: true,
      confirmations_required: '',
      sort_order: '',
    });
    onClose();
  };

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0  flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6">
          <div className="flex items-center justify-center py-8">
            <svg className="animate-spin h-6 w-6 text-gray-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            <span className="text-gray-700">Loading network...</span>
          </div>
        </div>
      </div>
    );
  }

  const isView = mode === 'view';
  const isEdit = mode === 'edit';

  return (
    <div className="fixed inset-0  flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">{isView ? 'View Network' : isEdit ? 'Edit Network' : 'Add New Network'}</h2>
          <Button variant="ghost" onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
        
      <form onSubmit={handleSubmit}>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
    <div className="space-y-2">
      <Label htmlFor="code">Code</Label>
      <Input
        id="code"
        name="code"
        value={formData.code}
        onChange={handleChange}
        placeholder="e.g., BTC"
        required
        disabled={isView}
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="name">Name</Label>
      <Input
        id="name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="e.g., Bitcoin"
        required
        disabled={isView}
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="full_name">Full Name</Label>
      <Input
        id="full_name"
        name="full_name"
        value={formData.full_name}
        onChange={handleChange}
        placeholder="e.g., Bitcoin Mainnet"
        required
        disabled={isView}
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="chain_id">Chain ID</Label>
      <Input
        id="chain_id"
        name="chain_id"
        value={formData.chain_id}
        onChange={handleChange}
        placeholder="e.g., 1"
        disabled={isView}
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="icon_url">Icon URL</Label>
      <Input
        id="icon_url"
        name="icon_url"
        value={formData.icon_url}
        onChange={handleChange}
        placeholder="https://.../icon.png"
        disabled={isView}
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="avg_transaction_fee_aud">Avg Fee (AUD)</Label>
      <Input
        id="avg_transaction_fee_aud"
        name="avg_transaction_fee_aud"
        value={formData.avg_transaction_fee_aud}
        onChange={handleChange}
        placeholder="e.g., 5.00"
        required
        disabled={isView}
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="avg_confirmation_time_minutes">Avg Confirm Time (min)</Label>
      <Input
        id="avg_confirmation_time_minutes"
        name="avg_confirmation_time_minutes"
        value={formData.avg_confirmation_time_minutes}
        onChange={handleChange}
        placeholder="e.g., 1.2"
        disabled={isView}
      />
    </div>

    <div className="flex items-center space-x-4 mt-6">
      <div className="flex items-center space-x-2">
        <Switch
          id="requires_checksum"
          checked={formData.requires_checksum}
          onCheckedChange={handleSwitchChange}
          disabled={isView}
        />
        <Label htmlFor="requires_checksum">Requires Checksum</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={handleIsActiveChange}
          disabled={isView}
        />
        <Label htmlFor="is_active">Is Active</Label>
      </div>
    </div>
  </div>

  <div className="space-y-2 mb-6">
    <Label htmlFor="description">Description</Label>
      <Textarea
      id="description"
      name="description"
      value={formData.description}
      onChange={handleChange}
      placeholder="Network description"
      rows={3}
      required
      disabled={isView}
    />
  </div>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <div className="space-y-2">
      <Label htmlFor="rpc_url">RPC URL</Label>
      <Input
        id="rpc_url"
        name="rpc_url"
        value={formData.rpc_url}
        onChange={handleChange}
        placeholder="https://..."
        disabled={isView}
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="explorer_url">Explorer URL</Label>
      <Input
        id="explorer_url"
        name="explorer_url"
        value={formData.explorer_url}
        onChange={handleChange}
        placeholder="https://..."
        disabled={isView}
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="address_format">Address Format (regex)</Label>
      <Input
        id="address_format"
        name="address_format"
        value={formData.address_format}
        onChange={handleChange}
        placeholder="^0x[a-fA-F0-9]{40}$"
        disabled={isView}
      />
    </div>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <div className="space-y-2">
      <Label htmlFor="confirmations_required">Confirmations Required</Label>
      <Input
        id="confirmations_required"
        name="confirmations_required"
        value={formData.confirmations_required}
        onChange={handleChange}
        placeholder="e.g., 12"
        disabled={isView}
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="sort_order">Sort Order</Label>
      <Input
        id="sort_order"
        name="sort_order"
        value={formData.sort_order}
        onChange={handleChange}
        placeholder="e.g., 1"
        disabled={isView}
      />
    </div>
  </div>

  <div className="flex justify-end space-x-2">
    <Button type="button" variant="outline" onClick={onClose}>
      Close
    </Button>
    {!isView && (
      <Button type="submit">{isEdit ? 'Update Network' : 'Add Network'}</Button>
    )}
  </div>
</form>

      </div>
    </div>
  );
};

export default AddNetworkModal;