
import React from 'react';
import { CheckCircle, Clock, MapPin, Truck, Package, AlertCircle } from 'lucide-react';

interface OrderStatusTrackerProps {
  status: string;
  estimatedTimeRange?: string;
  createdAt: string;
}

const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = ({ 
  status, 
  estimatedTimeRange, 
  createdAt 
}) => {
  const statusSteps = [
    { 
      key: 'pending', 
      label: 'Order Placed', 
      icon: Package,
      description: 'Your order has been received'
    },
    { 
      key: 'order_received', 
      label: 'Order Received', 
      icon: CheckCircle,
      description: 'Processing within 2-4 hours'
    },
    { 
      key: 'order_confirmed', 
      label: 'Order Confirmed', 
      icon: CheckCircle,
      description: 'Scheduling within 4-8 hours'
    },
    { 
      key: 'scheduled_for_delivery', 
      label: 'Scheduled for Delivery', 
      icon: Clock,
      description: 'Usually within 24-48 hours'
    },
    { 
      key: 'driver_dispatched', 
      label: 'Driver Dispatched', 
      icon: Truck,
      description: 'Driver en route, 2-6 hours'
    },
    { 
      key: 'out_for_delivery', 
      label: 'Out for Delivery', 
      icon: MapPin,
      description: 'Delivery within 1-3 hours'
    },
    { 
      key: 'delivered', 
      label: 'Delivered', 
      icon: CheckCircle,
      description: 'Order completed'
    }
  ];

  const getCurrentStepIndex = () => {
    if (status === 'cancelled') return -1;
    return statusSteps.findIndex(step => step.key === status);
  };

  const currentStepIndex = getCurrentStepIndex();

  const getStepStatus = (index: number) => {
    if (status === 'cancelled') return 'cancelled';
    if (index < currentStepIndex) return 'completed';
    if (index === currentStepIndex) return 'current';
    return 'pending';
  };

  const getStatusColor = (stepStatus: string) => {
    switch (stepStatus) {
      case 'completed': return 'text-green-500';
      case 'current': return 'text-onolo-orange';
      case 'cancelled': return 'text-red-500';
      default: return 'text-onolo-gray';
    }
  };

  const getStatusBg = (stepStatus: string) => {
    switch (stepStatus) {
      case 'completed': return 'bg-green-500';
      case 'current': return 'bg-onolo-orange';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-onolo-gray';
    }
  };

  if (status === 'cancelled') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-6 h-6 text-red-500" />
          <div>
            <h3 className="font-semibold text-red-700">Order Cancelled</h3>
            <p className="text-sm text-red-600">This order has been cancelled</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-onolo-dark-lighter rounded-xl p-6 mb-6">
      <h3 className="text-lg font-semibold text-white mb-4">Order Status</h3>
      
      {estimatedTimeRange && (
        <div className="bg-onolo-orange/10 border border-onolo-orange/20 rounded-lg p-3 mb-4">
          <p className="text-onolo-orange text-sm font-medium">
            {estimatedTimeRange}
          </p>
        </div>
      )}

      <div className="space-y-4">
        {statusSteps.map((step, index) => {
          const stepStatus = getStepStatus(index);
          const Icon = step.icon;
          
          return (
            <div key={step.key} className="flex items-start space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusBg(stepStatus)}`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <h4 className={`font-medium ${getStatusColor(stepStatus)}`}>
                  {step.label}
                </h4>
                <p className="text-sm text-onolo-gray mt-1">
                  {step.description}
                </p>
                {stepStatus === 'current' && (
                  <div className="mt-2">
                    <div className="w-full bg-onolo-gray rounded-full h-1">
                      <div className="bg-onolo-orange h-1 rounded-full animate-pulse w-3/4"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 pt-4 border-t border-onolo-gray/20">
        <p className="text-xs text-onolo-gray">
          Order placed: {new Date(createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default OrderStatusTracker;
