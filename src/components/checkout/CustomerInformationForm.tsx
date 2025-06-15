
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CustomerInformationFormProps {
  formData: {
    name: string;
    email: string;
    phone: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CustomerInformationForm: React.FC<CustomerInformationFormProps> = ({
  formData,
  onChange
}) => {
  return (
    <div className="bg-onolo-dark-lighter rounded-2xl p-6">
      <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={onChange}
            className="w-full p-3 bg-onolo-dark border border-onolo-gray rounded-xl text-white mt-2"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={onChange}
            className="w-full p-3 bg-onolo-dark border border-onolo-gray rounded-xl text-white mt-2"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={onChange}
            className="w-full p-3 bg-onolo-dark border border-onolo-gray rounded-xl text-white mt-2"
            required
          />
        </div>
      </div>
    </div>
  );
};

export default CustomerInformationForm;
