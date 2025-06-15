
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, Loader2 } from 'lucide-react';
import { useDeliverySlots } from '@/hooks/useDeliverySlots';

interface DeliverySlotPickerProps {
  onSlotSelect: (slot: { date: string; timeWindow: string; slotId: string }) => void;
  selectedDate?: string;
  selectedTimeWindow?: string;
}

const DeliverySlotPicker: React.FC<DeliverySlotPickerProps> = ({
  onSlotSelect,
  selectedDate,
  selectedTimeWindow
}) => {
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; timeWindow: string; slotId: string } | null>(
    selectedDate && selectedTimeWindow ? { date: selectedDate, timeWindow: selectedTimeWindow, slotId: '' } : null
  );
  const { slots, isLoading, fetchAvailableSlots, getTimeWindowLabel } = useDeliverySlots();

  useEffect(() => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 7); // Next 7 days
    fetchAvailableSlots(startDate, endDate);
  }, [fetchAvailableSlots]);

  const handleSlotSelect = (slot: any) => {
    const slotData = {
      date: slot.date,
      timeWindow: slot.time_window,
      slotId: slot.id
    };
    setSelectedSlot(slotData);
    onSlotSelect(slotData);
  };

  const groupedSlots = slots.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, typeof slots>);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Loading delivery slots...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Label className="text-lg font-semibold flex items-center">
        <Calendar className="w-5 h-5 mr-2" />
        Select Delivery Date & Time
      </Label>
      
      <div className="space-y-4">
        {Object.entries(groupedSlots).map(([date, dateSlots]) => (
          <div key={date} className="border rounded-lg p-4">
            <h3 className="font-medium mb-3 text-white">{formatDate(date)}</h3>
            <div className="grid grid-cols-1 gap-2">
              {dateSlots.map((slot) => (
                <Button
                  key={slot.id}
                  variant={
                    selectedSlot?.date === slot.date && selectedSlot?.timeWindow === slot.time_window
                      ? "default"
                      : "outline"
                  }
                  disabled={!slot.available}
                  onClick={() => handleSlotSelect(slot)}
                  className="justify-between h-auto p-3"
                >
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{getTimeWindowLabel(slot.time_window)}</span>
                  </div>
                  <div className="text-sm">
                    {slot.available ? (
                      <span className="text-green-600">
                        {slot.max_orders - slot.current_orders} slots left
                      </span>
                    ) : (
                      <span className="text-red-600">Fully booked</span>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {Object.keys(groupedSlots).length === 0 && (
        <div className="text-center p-8 text-gray-500">
          No delivery slots available. Please try again later.
        </div>
      )}
    </div>
  );
};

export default DeliverySlotPicker;
