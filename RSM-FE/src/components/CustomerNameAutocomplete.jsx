import { useState, useEffect, useRef, memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

const CustomerNameAutocomplete = memo(function CustomerNameAutocomplete({ value, onSelect }) {
  const [searchTerm, setSearchTerm] = useState(value || '');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const { data: customers } = useQuery({
    queryKey: ['customer-suggestions', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return { data: [] };
      const response = await api.get(`/customers?search=${encodeURIComponent(searchTerm)}`);
      return response.data;
    },
    enabled: searchTerm.length >= 2,
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setShowDropdown(true);
  };

  const handleSelectCustomer = (customer) => {
    setSearchTerm(customer.name);
    onSelect(customer);
    setShowDropdown(false);
  };

  const handleClear = () => {
    setSearchTerm('');
    onSelect(null);
    setShowDropdown(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          className="w-full border rounded px-3 py-2 pr-8"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => searchTerm.length >= 2 && setShowDropdown(true)}
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
      </div>
      
      {showDropdown && customers?.data && customers.data.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {customers.data.map((customer) => (
            <div
              key={customer.id}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelectCustomer(customer)}
            >
              <div className="font-medium">{customer.name}</div>
              <div className="text-xs text-gray-500">{customer.phone}</div>
            </div>
          ))}
        </div>
      )}
      
      {showDropdown && searchTerm.length >= 2 && customers?.data?.length === 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
          <div className="px-3 py-2 text-sm text-gray-500">No customers found</div>
        </div>
      )}
    </div>
  );
});
export default CustomerNameAutocomplete;