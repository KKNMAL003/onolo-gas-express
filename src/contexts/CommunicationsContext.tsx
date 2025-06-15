
import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CommunicationLog {
  id: string;
  user_id: string;
  log_type: string;
  subject: string | null;
  message: string;
  created_at: string;
}

export interface CommunicationsContextType {
  communications: CommunicationLog[];
  isLoading: boolean;
  unreadCount: number;
  sendMessage: (subject: string, message: string) => Promise<boolean>;
  markAsRead: () => void;
  refetch: () => Promise<void>;
}

export const CommunicationsContext = createContext<CommunicationsContextType | undefined>(undefined);

export const CommunicationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [communications, setCommunications] = useState<CommunicationLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchCommunications = useCallback(async () => {
    if (!user) {
      setCommunications([]);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('communication_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCommunications(data || []);
    } catch (error) {
      console.error('Error fetching communications:', error);
      toast({
        title: "Error loading messages",
        description: "Failed to load your messages. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      fetchCommunications();
      
      const channel = supabase.channel('communications-changes');
      
      channel.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'communication_logs',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Real-time communication update:', payload);
            
            if (payload.eventType === 'INSERT') {
              const newCommunication = payload.new as CommunicationLog;
              setCommunications(prev => [newCommunication, ...prev]);
              setUnreadCount(prev => prev + 1);
              
              if (newCommunication.log_type === 'order_status_update') {
                toast({
                  title: newCommunication.subject || 'Order Update',
                  description: newCommunication.message,
                });
              }
            }
          }
        )
        .subscribe((status, err) => {
          if (status === 'SUBSCRIBE_FAILED') {
            console.error('Failed to subscribe to communications channel', err);
          }
        });

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
        setCommunications([]);
        setUnreadCount(0);
        setIsLoading(false);
    }
  }, [user, toast, fetchCommunications]);

  const sendMessage = async (subject: string, message: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to send messages.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('communication_logs')
        .insert({
          user_id: user.id,
          log_type: 'user_message',
          subject: subject.trim(),
          message: message.trim()
        });

      if (error) throw error;

      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      });
      
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error sending message",
        description: "Failed to send your message. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const markAsRead = () => {
    setUnreadCount(0);
  };

  const value = {
    communications,
    isLoading,
    unreadCount,
    sendMessage,
    markAsRead,
    refetch: fetchCommunications,
  };

  return (
    <CommunicationsContext.Provider value={value}>
      {children}
    </CommunicationsContext.Provider>
  );
};
