
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddressFormData {
  houseNumber: string;
  streetName: string;
  suburb: string;
  city: string;
  postalCode: string;
  province: string;
}

interface AddressFormProps {
  addressForm: AddressFormData;
  onInputChange: (field: string, value: string) => void;
}

const AddressForm: React.FC<AddressFormProps> = ({ addressForm, onInputChange }) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="houseNumber" className="text-white">House/Unit Number</Label>
          <Input
            id="houseNumber"
            value={addressForm.houseNumber}
            onChange={(e) => onInputChange('houseNumber', e.target.value)}
            placeholder="123"
            className="bg-onolo-dark border-onolo-gray text-white mt-2"
          />
        </div>
        
        <div>
          <Label htmlFor="streetName" className="text-white">Street Name</Label>
          <Input
            id="streetName"
            value={addressForm.streetName}
            onChange={(e) => onInputChange('streetName', e.target.value)}
            placeholder="Main Road"
            className="bg-onolo-dark border-onolo-gray text-white mt-2"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="suburb" className="text-white">Suburb/Area</Label>
        <Input
          id="suburb"
          value={addressForm.suburb}
          onChange={(e) => onInputChange('suburb', e.target.value)}
          placeholder="Sandton"
          className="bg-onolo-dark border-onolo-gray text-white mt-2"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city" className="text-white">City</Label>
          <Input
            id="city"
            value={addressForm.city}
            onChange={(e) => onInputChange('city', e.target.value)}
            placeholder="Johannesburg"
            className="bg-onolo-dark border-onolo-gray text-white mt-2"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="postalCode" className="text-white">Postal Code</Label>
          <Input
            id="postalCode"
            value={addressForm.postalCode}
            onChange={(e) => onInputChange('postalCode', e.target.value)}
            placeholder="2196"
            className="bg-onolo-dark border-onolo-gray text-white mt-2"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="province" className="text-white">Province</Label>
        <select
          id="province"
          value={addressForm.province}
          onChange={(e) => onInputChange('province', e.target.value)}
          className="w-full p-3 bg-onolo-dark border border-onolo-gray rounded-xl text-white mt-2"
        >
          <option value="Gauteng">Gauteng</option>
          <option value="Western Cape">Western Cape</option>
          <option value="KwaZulu-Natal">KwaZulu-Natal</option>
          <option value="Eastern Cape">Eastern Cape</option>
          <option value="Free State">Free State</option>
          <option value="Limpopo">Limpopo</option>
          <option value="Mpumalanga">Mpumalanga</option>
          <option value="North West">North West</option>
          <option value="Northern Cape">Northern Cape</option>
        </select>
      </div>
    </>
  );
};

export default AddressForm;
