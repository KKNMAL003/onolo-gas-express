
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Clock, MapPin } from 'lucide-react';

const DeliveryPreferences: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    defaultDeliveryWindow: profile?.default_delivery_window || '',
    defaultAddress: profile?.address || ''
  });

  useEffect(() => {
    if (profile) {
      setPreferences({
        defaultDeliveryWindow: profile.default_delivery_window || '',
        defaultAddress: profile.address || ''
      });
    }
  }, [profile]);

  const handleSavePreferences = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          default_delivery_window: preferences.defaultDeliveryWindow || null,
          address: preferences.defaultAddress || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      
      toast({
        title: "Preferences saved",
        description: "Your delivery preferences have been updated.",
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error saving preferences",
        description: "Failed to save your delivery preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeWindowLabel = (window: string) => {
    switch (window) {
      case 'morning': return 'Morning (8AM - 12PM)';
      case 'afternoon': return 'Afternoon (12PM - 5PM)';
      case 'evening': return 'Evening (5PM - 8PM)';
      default: return 'Select preferred time';
    }
  };

  return (
    <div className="bg-onolo-dark-lighter rounded-2xl p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <Clock className="w-5 h-5 mr-2" />
        Delivery Preferences
      </h2>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="deliveryWindow">Preferred Delivery Time</Label>
          <Select
            value={preferences.defaultDeliveryWindow}
            onValueChange={(value) => setPreferences(prev => ({ ...prev, defaultDeliveryWindow: value }))}
          >
            <SelectTrigger className="w-full mt-2 bg-onolo-dark border-onolo-gray text-white">
              <SelectValue placeholder="Select preferred time" />
            </SelectTrigger>
            <SelectContent className="bg-onolo-dark border-onolo-gray">
              <SelectItem value="morning" className="text-white hover:bg-onolo-gray">
                Morning (8AM - 12PM)
              </SelectItem>
              <SelectItem value="afternoon" className="text-white hover:bg-onolo-gray">
                Afternoon (12PM - 5PM)
              </SelectItem>
              <SelectItem value="evening" className="text-white hover:bg-onolo-gray">
                Evening (5PM - 8PM)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="defaultAddress">Default Delivery Address</Label>
          <div className="flex items-center space-x-2 mt-2">
            <MapPin className="w-4 h-4 text-onolo-gray" />
            <input
              type="text"
              value={preferences.defaultAddress}
              onChange={(e) => setPreferences(prev => ({ ...prev, defaultAddress: e.target.value }))}
              placeholder="Enter your default delivery address"
              className="flex-1 p-3 bg-onolo-dark border border-onolo-gray rounded-xl text-white"
            />
          </div>
        </div>

        <Button
          onClick={handleSavePreferences}
          disabled={isLoading}
          className="w-full bg-onolo-orange hover:bg-onolo-orange-dark"
        >
          {isLoading ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
};

export default DeliveryPreferences;
