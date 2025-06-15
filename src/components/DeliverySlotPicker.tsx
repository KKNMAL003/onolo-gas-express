
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Clock, Loader2 } from 'lucide-react';
import { useDeliverySlots } from '@/hooks/useDeliverySlots';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

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
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(
    selectedDate ? new Date(selectedDate) : undefined
  );
  const [timeWindow, setTimeWindow] = useState<string>(selectedTimeWindow || '');
  const { slots, isLoading, fetchAvailableSlots, getTimeWindowLabel } = useDeliverySlots();

  useEffect(() => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 7); // Next 7 days
    fetchAvailableSlots(startDate, endDate);
  }, [fetchAvailableSlots]);

  // Generate sample slots if no slots are available from database
  const generateSampleSlots = () => {
    const sampleSlots = [];
    const today = new Date();
    
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      
      ['morning', 'afternoon', 'evening'].forEach((timeWindow) => {
        sampleSlots.push({
          id: `sample-${dateString}-${timeWindow}`,
          date: dateString,
          time_window: timeWindow,
          max_orders: 10,
          current_orders: Math.floor(Math.random() * 5),
          available: true,
          active: true,
          created_at: new Date().toISOString()
        });
      });
    }
    
    return sampleSlots;
  };

  const slotsToShow = slots.length > 0 ? slots : generateSampleSlots();

  const handleDateSelect = (date: Date | undefined) => {
    setCalendarDate(date);
    if (date && timeWindow) {
      const dateString = date.toISOString().split('T')[0];
      const slot = slotsToShow.find(s => s.date === dateString && s.time_window === timeWindow);
      if (slot) {
        const slotData = {
          date: slot.date,
          timeWindow: slot.time_window,
          slotId: slot.id
        };
        setSelectedSlot(slotData);
        onSlotSelect(slotData);
      }
    }
  };

  const handleTimeWindowSelect = (selectedTimeWindow: string) => {
    setTimeWindow(selectedTimeWindow);
    if (calendarDate) {
      const dateString = calendarDate.toISOString().split('T')[0];
      const slot = slotsToShow.find(s => s.date === dateString && s.time_window === selectedTimeWindow);
      if (slot) {
        const slotData = {
          date: slot.date,
          timeWindow: slot.time_window,
          slotId: slot.id
        };
        setSelectedSlot(slotData);
        onSlotSelect(slotData);
      }
    }
  };

  // Get available dates (next 7 days)
  const getAvailableDates = () => {
    const dates = new Set(slotsToShow.map(slot => slot.date));
    return Array.from(dates).map(date => new Date(date));
  };

  const availableDates = getAvailableDates();

  // Check if a date is available
  const isDateAvailable = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return slotsToShow.some(slot => slot.date === dateString && slot.available);
  };

  // Get available time windows for selected date
  const getAvailableTimeWindows = () => {
    if (!calendarDate) return [];
    const dateString = calendarDate.toISOString().split('T')[0];
    return slotsToShow
      .filter(slot => slot.date === dateString && slot.available)
      .map(slot => slot.time_window);
  };

  const availableTimeWindows = getAvailableTimeWindows();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2 text-white" />
        <span className="text-white">Loading delivery slots...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Label className="text-lg font-semibold flex items-center text-white">
        <CalendarIcon className="w-5 h-5 mr-2" />
        Select Delivery Date & Time
      </Label>
      
      <div className="grid grid-cols-1 gap-4">
        {/* Date Picker */}
        <div className="space-y-2">
          <Label className="text-sm text-white">Delivery Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal bg-onolo-dark border-onolo-gray hover:bg-onolo-gray text-white",
                  !calendarDate && "text-onolo-gray"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {calendarDate ? format(calendarDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-onolo-dark border-onolo-gray" align="start">
              <Calendar
                mode="single"
                selected={calendarDate}
                onSelect={handleDateSelect}
                disabled={(date) => 
                  date < new Date(new Date().setHours(0, 0, 0, 0)) || 
                  !isDateAvailable(date)
                }
                initialFocus
                className="pointer-events-auto bg-onolo-dark text-white"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Time Window Selector */}
        <div className="space-y-2">
          <Label className="text-sm text-white">Time Window</Label>
          <Select
            value={timeWindow}
            onValueChange={handleTimeWindowSelect}
            disabled={!calendarDate || availableTimeWindows.length === 0}
          >
            <SelectTrigger className="w-full bg-onolo-dark border-onolo-gray hover:bg-onolo-gray text-white">
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select time window" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-onolo-dark border-onolo-gray">
              {availableTimeWindows.map((window) => (
                <SelectItem 
                  key={window} 
                  value={window}
                  className="text-white hover:bg-onolo-gray focus:bg-onolo-gray"
                >
                  {getTimeWindowLabel(window)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Selected slot confirmation */}
      {selectedSlot && (
        <div className="mt-4 p-3 bg-onolo-orange bg-opacity-20 rounded-lg border border-onolo-orange">
          <div className="text-sm text-onolo-orange">
            <strong>Selected:</strong> {format(new Date(selectedSlot.date), "PPPP")} - {getTimeWindowLabel(selectedSlot.timeWindow)}
          </div>
        </div>
      )}

      {calendarDate && availableTimeWindows.length === 0 && (
        <div className="text-center p-4 text-onolo-gray">
          No time slots available for selected date. Please choose another date.
        </div>
      )}
    </div>
  );
};

export default DeliverySlotPicker;
