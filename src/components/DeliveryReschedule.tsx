
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import DeliverySlotPicker from '@/components/DeliverySlotPicker';
import { useOrderReschedule } from '@/hooks/useOrderReschedule';
import { Calendar } from 'lucide-react';

interface DeliveryRescheduleProps {
  orderId: string;
  currentDate?: string;
  currentTimeWindow?: string;
  onRescheduleSuccess: () => void;
}

const DeliveryReschedule: React.FC<DeliveryRescheduleProps> = ({
  orderId,
  currentDate,
  currentTimeWindow,
  onRescheduleSuccess
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    date: string;
    timeWindow: string;
    slotId: string;
  } | null>(null);
  
  const { rescheduleOrder, isLoading } = useOrderReschedule();

  const handleSlotSelect = (slot: { date: string; timeWindow: string; slotId: string }) => {
    setSelectedSlot(slot);
  };

  const handleReschedule = async () => {
    if (!selectedSlot) return;

    const success = await rescheduleOrder(
      orderId,
      selectedSlot.date,
      selectedSlot.timeWindow,
      selectedSlot.slotId
    );

    if (success) {
      setIsOpen(false);
      setSelectedSlot(null);
      onRescheduleSuccess();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Calendar className="w-4 h-4 mr-2" />
          Reschedule Delivery
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-onolo-dark text-white border-onolo-gray">
        <DialogHeader>
          <DialogTitle>Reschedule Delivery</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {currentDate && currentTimeWindow && (
            <div className="p-3 bg-onolo-dark-lighter rounded-lg">
              <p className="text-sm text-onolo-gray">Current delivery:</p>
              <p className="text-white">
                {new Date(currentDate).toLocaleDateString()} - {currentTimeWindow}
              </p>
            </div>
          )}
          
          <DeliverySlotPicker 
            onSlotSelect={handleSlotSelect}
            selectedDate={selectedSlot?.date}
            selectedTimeWindow={selectedSlot?.timeWindow}
          />
          
          <div className="flex space-x-2">
            <Button
              onClick={() => setIsOpen(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReschedule}
              disabled={!selectedSlot || isLoading}
              className="flex-1 bg-onolo-orange hover:bg-onolo-orange-dark"
            >
              {isLoading ? 'Rescheduling...' : 'Confirm Reschedule'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeliveryReschedule;
