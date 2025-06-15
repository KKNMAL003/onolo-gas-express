
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DeliveryRestrictionAlertProps {
  isNonGautengProvince: boolean;
}

const DeliveryRestrictionAlert: React.FC<DeliveryRestrictionAlertProps> = ({ isNonGautengProvince }) => {
  if (!isNonGautengProvince) return null;

  return (
    <Alert variant="destructive" className="bg-red-900/20 border-red-500 text-red-400">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        We currently only deliver within Gauteng province. Please select Gauteng if you wish to place an order, or contact us for special delivery arrangements.
      </AlertDescription>
    </Alert>
  );
};

export default DeliveryRestrictionAlert;
