import React, { useState } from 'react';
import Select from 'react-select';

const BillPaymentForm = ({ onSubmit, onCancel, minAmount, maxAmount }) => {
  const [formData, setFormData] = useState({
    amount: '',
    billType: '',
    accountNumber: '',
    provider: '',
    reference: ''
  });

  const [errors, setErrors] = useState({});

  const billTypes = [
    { value: 'utility', label: 'Utility Bills', providers: [
      { value: 'electric', label: 'Electric Company' },
      { value: 'water', label: 'Water Utility' },
      { value: 'gas', label: 'Gas Company' }
    ]},
    { value: 'phone', label: 'Phone/Internet', providers: [
      { value: 'att', label: 'AT&T' },
      { value: 'verizon', label: 'Verizon' },
      { value: 'tmobile', label: 'T-Mobile' }
    ]},
    { value: 'insurance', label: 'Insurance', providers: [
      { value: 'statefarm', label: 'State Farm' },
      { value: 'progressive', label: 'Progressive' },
      { value: 'geico', label: 'GEICO' }
    ]},
    { value: 'creditcard', label: 'Credit Card', providers: [
      { value: 'chase', label: 'Chase' },
      { value: 'amex', label: 'American Express' },
      { value: 'discover', label: 'Discover' }
    ]}
  ];

  const [selectedBillType, setSelectedBillType] = useState(null);

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

  const handleBillTypeSelect = (option) => {
    setSelectedBillType(option);
    setFormData(prev => ({
      ...prev,
      billType: option.label,
      provider: ''
    }));
  };

  const handleProviderSelect = (option) => {
    setFormData(prev => ({
      ...prev,
      provider: option.label
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.amount || isNaN(formData.amount) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    if (!formData.billType) {
      newErrors.billType = 'Please select a bill type';
    }
    if (!formData.provider) {
      newErrors.provider = 'Please select a provider';
    }
    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = 'Account number is required';
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
          Bill Type
        </label>
        <Select
          options={billTypes}
          onChange={handleBillTypeSelect}
          className="react-select-container"
          classNamePrefix="react-select"
          placeholder="Select bill type"
        />
        {errors.billType && (
          <p className="mt-1 text-sm text-red-600">{errors.billType}</p>
        )}
      </div>

      {selectedBillType && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Provider
          </label>
          <Select
            options={selectedBillType.providers}
            onChange={handleProviderSelect}
            className="react-select-container"
            classNamePrefix="react-select"
            placeholder="Select provider"
          />
          {errors.provider && (
            <p className="mt-1 text-sm text-red-600">{errors.provider}</p>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Account/Policy Number
        </label>
        <input
          type="text"
          name="accountNumber"
          value={formData.accountNumber}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter account or policy number"
        />
        {errors.accountNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.accountNumber}</p>
        )}
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

export default BillPaymentForm;