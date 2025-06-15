
import React from 'react';
import { MapPin } from 'lucide-react';

interface AddressPreviewProps {
  fullAddress: string;
  isNonGautengProvince: boolean;
}

const AddressPreview: React.FC<AddressPreviewProps> = ({ fullAddress, isNonGautengProvince }) => {
  if (!fullAddress || isNonGautengProvince) return null;

  return (
    <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg">
      <div className="flex items-start space-x-2">
        <MapPin className="w-4 h-4 mt-0.5" />
        <div>
          <div className="text-sm font-medium">Delivery Address:</div>
          <div className="text-sm">{fullAddress}</div>
        </div>
      </div>
    </div>
  );
};

export default AddressPreview;
