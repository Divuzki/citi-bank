import React, { useState, useEffect } from 'react';
import Select from 'react-select';

const CryptoTradeForm = ({ onSubmit, onCancel, minAmount, maxAmount }) => {
  const [formData, setFormData] = useState({
    amount: '',
    cryptoType: '',
    cryptoAmount: '0',
    walletAddress: '',
    reference: ''
  });

  const [errors, setErrors] = useState({});
  const [exchangeRates, setExchangeRates] = useState({
    BTC: 43000,
    ETH: 2200,
    SOL: 100,
    DOGE: 0.08,
    XRP: 0.50
  });

  const cryptoOptions = [
    { value: 'BTC', label: 'Bitcoin (BTC)' },
    { value: 'ETH', label: 'Ethereum (ETH)' },
    { value: 'SOL', label: 'Solana (SOL)' },
    { value: 'DOGE', label: 'Dogecoin (DOGE)' },
    { value: 'XRP', label: 'Ripple (XRP)' }
  ];

  useEffect(() => {
    if (formData.amount && formData.cryptoType) {
      const rate = exchangeRates[formData.cryptoType];
      const cryptoAmount = (Number(formData.amount) / rate).toFixed(8);
      setFormData(prev => ({
        ...prev,
        cryptoAmount
      }));
    }
  }, [formData.amount, formData.cryptoType]);

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

  const handleCryptoSelect = (option) => {
    setFormData(prev => ({
      ...prev,
      cryptoType: option.value
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.amount || isNaN(formData.amount) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    if (!formData.cryptoType) {
      newErrors.cryptoType = 'Please select a cryptocurrency';
    }
    if (!formData.walletAddress.trim()) {
      newErrors.walletAddress = 'Wallet address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...formData,
        additionalDetails: {
          exchangeRate: exchangeRates[formData.cryptoType],
          cryptoAmount: formData.cryptoAmount
        }
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cryptocurrency
        </label>
        <Select
          options={cryptoOptions}
          onChange={handleCryptoSelect}
          className="react-select-container"
          classNamePrefix="react-select"
          placeholder="Select cryptocurrency"
        />
        {errors.cryptoType && (
          <p className="mt-1 text-sm text-red-600">{errors.cryptoType}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Amount (USD)
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

      {formData.cryptoType && formData.amount && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">You will receive approximately:</p>
          <p className="text-lg font-medium text-gray-800">
            {formData.cryptoAmount} {formData.cryptoType}
          </p>
          <p className="text-xs text-gray-500">
            Rate: 1 {formData.cryptoType} = ${exchangeRates[formData.cryptoType].toLocaleString()}
          </p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Wallet Address
        </label>
        <input
          type="text"
          name="walletAddress"
          value={formData.walletAddress}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter your wallet address"
        />
        {errors.walletAddress && (
          <p className="mt-1 text-sm text-red-600">{errors.walletAddress}</p>
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

export default CryptoTradeForm;