
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    paymentMethod: 'eft'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Process order logic here
    alert('Order placed successfully!');
    navigate('/');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-onolo-dark text-white p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-8">Checkout</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-onolo-dark-lighter rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Delivery Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-3 bg-onolo-dark border border-onolo-gray rounded-xl text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 bg-onolo-dark border border-onolo-gray rounded-xl text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-3 bg-onolo-dark border border-onolo-gray rounded-xl text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full p-3 bg-onolo-dark border border-onolo-gray rounded-xl text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full p-3 bg-onolo-dark border border-onolo-gray rounded-xl text-white"
                  required
                />
              </div>
            </div>
          </div>

          <div className="bg-onolo-dark-lighter rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
            
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="eft"
                  checked={formData.paymentMethod === 'eft'}
                  onChange={handleChange}
                  className="text-onolo-orange"
                />
                <span>EFT (Electronic Funds Transfer)</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={formData.paymentMethod === 'card'}
                  onChange={handleChange}
                  className="text-onolo-orange"
                />
                <span>Credit/Debit Card</span>
              </label>
            </div>
          </div>

          <div className="bg-onolo-dark-lighter rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>9 Kg LP Gas Bottle REFILL x1</span>
                <span>R 344.00</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>Free</span>
              </div>
              <div className="border-t border-onolo-gray pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-onolo-orange">R 344.00</span>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-onolo-orange hover:bg-onolo-orange-dark text-white font-semibold py-4 px-6 rounded-2xl transition-colors"
          >
            Place Order
          </button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
