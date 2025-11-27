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
}

interface AddNetworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NetworkFormData) => void;
}

const AddNetworkModal: React.FC<AddNetworkModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<NetworkFormData>({
    code: '',
    name: '',
    full_name: '',
    description: '',
    chain_id: '',
    avg_transaction_fee_aud: '',
    requires_checksum: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, requires_checksum: checked }));
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
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Add New Network</h2>
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
      />
    </div>

    <div className="flex items-center space-x-2 mt-6">
      <Switch
        id="requires_checksum"
        checked={formData.requires_checksum}
        onCheckedChange={handleSwitchChange}
      />
      <Label htmlFor="requires_checksum">Requires Checksum</Label>
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
    />
  </div>

  <div className="flex justify-end space-x-2">
    <Button type="button" variant="outline" onClick={onClose}>
      Cancel
    </Button>
    <Button type="submit">Add Network</Button>
  </div>
</form>

      </div>
    </div>
  );
};

export default AddNetworkModal;