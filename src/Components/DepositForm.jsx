import React, { useState } from 'react';
import Select from 'react-select';

const DepositForm = ({ onSubmit, onCancel, minAmount, maxAmount }) => {
  const [formData, setFormData] = useState({
    amount: '',
    depositMethod: '',
    accountNumber: '',
    routingNumber: '',
    bankName: '',
    reference: ''
  });

  const [errors, setErrors] = useState({});

  const depositMethods = [
    { value: 'ach', label: 'ACH Transfer' },
    { value: 'wire', label: 'Wire Transfer' },
    { value: 'check', label: 'Check Deposit' },
    { value: 'cash', label: 'Cash Deposit' }
  ];

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

  const handleMethodSelect = (option) => {
    setFormData(prev => ({
      ...prev,
      depositMethod: option.label
    }));
  };

  const handleBankSelect = (option) => {
    setFormData(prev => ({
      ...prev,
      bankName: option.label,
      routingNumber: option.routingNumber
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.amount || isNaN(formData.amount) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    if (!formData.depositMethod) {
      newErrors.depositMethod = 'Please select a deposit method';
    }

    if (formData.depositMethod === 'ACH Transfer' || formData.depositMethod === 'Wire Transfer') {
      if (!formData.bankName) {
        newErrors.bankName = 'Please select a bank';
      }
      if (!formData.accountNumber) {
        newErrors.accountNumber = 'Account number is required';
      }
      if (!formData.routingNumber) {
        newErrors.routingNumber = 'Routing number is required';
      }
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
          Deposit Method
        </label>
        <Select
          options={depositMethods}
          onChange={handleMethodSelect}
          className="react-select-container"
          classNamePrefix="react-select"
          placeholder="Select deposit method"
        />
        {errors.depositMethod && (
          <p className="mt-1 text-sm text-red-600">{errors.depositMethod}</p>
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

      {(formData.depositMethod === 'ACH Transfer' || formData.depositMethod === 'Wire Transfer') && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Bank
            </label>
            <Select
              options={bankOptions}
              onChange={handleBankSelect}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Select your bank"
            />
            {errors.bankName && (
              <p className="mt-1 text-sm text-red-600">{errors.bankName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Number
            </label>
            <input
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter account number"
            />
            {errors.accountNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.accountNumber}</p>
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
              readOnly
            />
            {errors.routingNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.routingNumber}</p>
            )}
          </div>
        </>
      )}

      {formData.depositMethod === 'Check Deposit' && (
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm text-yellow-800">
            Please visit your nearest branch or ATM to deposit your check.
            Alternatively, you can use mobile check deposit through our mobile app.
          </p>
        </div>
      )}

      {formData.depositMethod === 'Cash Deposit' && (
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm text-yellow-800">
            Please visit your nearest branch or ATM to make a cash deposit.
            For your security, we do not accept cash deposits through online banking.
          </p>
        </div>
      )}

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

export default DepositForm;