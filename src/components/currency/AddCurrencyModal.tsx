// components/AddCurrencyModal.tsx
"use client";
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

interface NetworkFormData {
  name: string;
  contract_address: string;
  network_fee_estimate_aud: string;
}

interface CurrencyFormData {
  code: string;
  name: string;
  symbol: string;
  description: string;
  decimals: string;
  networks: NetworkFormData[];
}

interface AddCurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CurrencyFormData) => void;
}

const AddCurrencyModal: React.FC<AddCurrencyModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<CurrencyFormData>({
    code: '',
    name: '',
    symbol: '',
    description: '',
    decimals: '',
    networks: [{ name: '', contract_address: '', network_fee_estimate_aud: '' }],
  });

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNetworkChange = (index: number, field: keyof NetworkFormData, value: string) => {
    const updatedNetworks = [...formData.networks];
    updatedNetworks[index] = { ...updatedNetworks[index], [field]: value };
    setFormData(prev => ({ ...prev, networks: updatedNetworks }));
  };

  const addNetwork = () => {
    setFormData(prev => ({
      ...prev,
      networks: [...prev.networks, { name: '', contract_address: '', network_fee_estimate_aud: '' }],
    }));
  };

  const removeNetwork = (index: number) => {
    if (formData.networks.length > 1) {
      const updatedNetworks = [...formData.networks];
      updatedNetworks.splice(index, 1);
      setFormData(prev => ({ ...prev, networks: updatedNetworks }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      code: '',
      name: '',
      symbol: '',
      description: '',
      decimals: '',
      networks: [{ name: '', contract_address: '', network_fee_estimate_aud: '' }],
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Add New Currency</h2>
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

  {/* NETWORK SECTION */}
  <div className="mb-6">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-medium text-gray-800">Networks</h3>
      <Button type="button" variant="outline" onClick={addNetwork}>
        Add Network
      </Button>
    </div>

    {formData.networks.map((network, index) => (
      <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-medium text-gray-700">Network {index + 1}</h4>

          {formData.networks.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeNetwork(index)}
              className="text-red-500 hover:text-red-700"
            >
              Remove
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label>Network Name</Label>
            <Input
              value={network.name}
              onChange={(e) => handleNetworkChange(index, "name", e.target.value)}
              placeholder="e.g., Ethereum"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Contract Address</Label>
            <Input
              value={network.contract_address}
              onChange={(e) =>
                handleNetworkChange(index, "contract_address", e.target.value)
              }
              placeholder="0x..."
            />
          </div>

          <div className="space-y-2">
            <Label>Network Fee (AUD)</Label>
            <Input
              value={network.network_fee_estimate_aud}
              onChange={(e) =>
                handleNetworkChange(index, "network_fee_estimate_aud", e.target.value)
              }
              placeholder="e.g., 0.50"
              required
            />
          </div>
        </div>
      </div>
    ))}
  </div>

  <div className="flex justify-end space-x-2">
    <Button type="button" variant="outline" onClick={onClose}>
      Cancel
    </Button>
    <Button type="submit">Add Currency</Button>
  </div>
</form>

      </div>
    </div>
  );
};

export default AddCurrencyModal;