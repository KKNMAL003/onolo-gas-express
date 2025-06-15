
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCommunications } from '@/hooks/useCommunications';
import CommunicationsFeed from '@/components/CommunicationsFeed';
import MessageComposer from '@/components/MessageComposer';

const Chat = () => {
  const { user } = useAuth();
  const {
    communications,
    isLoading,
    unreadCount,
    sendMessage,
    markAsRead
  } = useCommunications();

  useEffect(() => {
    // Mark messages as read when the chat page is opened
    markAsRead();
  }, [markAsRead]);

  return (
    <div className="min-h-screen bg-onolo-dark text-white">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Messages & Support</h1>
        <p className="text-onolo-gray mb-6">
          View order updates, send messages to support, or chat with our team below.
        </p>
      </div>
      
      {/* Communications Section */}
      <div className="px-6 mb-6 space-y-4">
        <CommunicationsFeed
          communications={communications}
          isLoading={isLoading}
          onMarkAsRead={markAsRead}
        />
        
        {user && (
          <MessageComposer
            onSendMessage={sendMessage}
            isDisabled={!user}
          />
        )}
        
        {!user && (
          <div className="bg-onolo-dark-lighter border border-onolo-gray rounded-lg p-4">
            <p className="text-onolo-gray text-center">
              Please sign in to send messages and view your order updates.
            </p>
          </div>
        )}
      </div>

      {/* Customer Support Chat */}
      <div className="px-6">
        <div className="border-t border-onolo-gray pt-6">
          <h2 className="text-lg font-semibold mb-4">Live Customer Support</h2>
          <iframe
            src="https://www.chatbase.co/chatbot-iframe/SzxvYORICrmmckhOCkvB6"
            width="100%"
            style={{ height: '100%', minHeight: '500px' }}
            frameBorder="0"
            className="rounded-2xl"
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;
