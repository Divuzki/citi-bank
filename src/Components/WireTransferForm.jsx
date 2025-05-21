import React, { useState } from 'react';
import Select from 'react-select';

const WireTransferForm = ({ onSubmit, onCancel, minAmount, maxAmount }) => {
  const [formData, setFormData] = useState({
    amount: '',
    recipientName: '',
    recipientBank: '',
    recipientAccount: '',
    routingNumber: '',
    reference: '',
    transferType: 'domestic'
  });

  const [errors, setErrors] = useState({});

  const bankOptions = [
    { value: 'chase', label: 'Chase Bank', routingNumber: '021000021' },
    { value: 'bofa', label: 'Bank of America', routingNumber: '026009593' },
    { value: 'wells', label: 'Wells Fargo', routingNumber: '121000248' },
    { value: 'citi', label: 'Citibank', routingNumber: '021000089' },
    { value: 'usbank', label: 'U.S. Bank', routingNumber: '122105155' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  const handleBankSelect = (option) => {
    setFormData(prev => ({
      ...prev,
      recipientBank: option.label,
      routingNumber: option.routingNumber
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.amount || isNaN(formData.amount) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    if (!formData.recipientName.trim()) {
      newErrors.recipientName = 'Recipient name is required';
    }
    if (!formData.recipientBank) {
      newErrors.recipientBank = 'Please select a bank';
    }
    if (!formData.recipientAccount.trim() || formData.recipientAccount.length < 8) {
      newErrors.recipientAccount = 'Please enter a valid account number';
    }
    if (!formData.routingNumber.trim() || formData.routingNumber.length !== 9) {
      newErrors.routingNumber = 'Please enter a valid 9-digit routing number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Transfer Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className={`p-2 text-center rounded-lg border ${
              formData.transferType === 'domestic'
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setFormData(prev => ({ ...prev, transferType: 'domestic' }))}
          >
            Domestic
          </button>
          <button
            type="button"
            className={`p-2 text-center rounded-lg border ${
              formData.transferType === 'international'
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setFormData(prev => ({ ...prev, transferType: 'international' }))}
          >
            International
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Amount
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
            $
          </span>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0.00"
          />
        </div>
        {errors.amount && (
          <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Min: ${minAmount} | Max: ${maxAmount.toLocaleString()}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Recipient Name
        </label>
        <input
          type="text"
          name="recipientName"
          value={formData.recipientName}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter recipient's full name"
        />
        {errors.recipientName && (
          <p className="mt-1 text-sm text-red-600">{errors.recipientName}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Recipient Bank
        </label>
        <Select
          options={bankOptions}
          onChange={handleBankSelect}
          className="react-select-container"
          classNamePrefix="react-select"
          placeholder="Select recipient's bank"
        />
        {errors.recipientBank && (
          <p className="mt-1 text-sm text-red-600">{errors.recipientBank}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Account Number
        </label>
        <input
          type="text"
          name="recipientAccount"
          value={formData.recipientAccount}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter account number"
          maxLength="17"
        />
        {errors.recipientAccount && (
          <p className="mt-1 text-sm text-red-600">{errors.recipientAccount}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Routing Number
        </label>
        <input
          type="text"
          name="routingNumber"
          value={formData.routingNumber}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="9-digit routing number"
          maxLength="9"
        />
        {errors.routingNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.routingNumber}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Reference (Optional)
        </label>
        <input
          type="text"
          name="reference"
          value={formData.reference}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Add a reference note"
        />
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-white bg-customBlue rounded-md hover:bg-blue-600"
        >
          Continue
        </button>
      </div>
    </form>
  );
};

export default WireTransferForm;