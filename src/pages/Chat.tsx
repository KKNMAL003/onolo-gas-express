
import React from 'react';

const Chat = () => {
  return (
    <div className="min-h-screen bg-onolo-dark text-white">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Customer Support</h1>
        <p className="text-onolo-gray mb-6">Chat with our support team for any questions or assistance.</p>
      </div>
      
      <div className="px-6">
        <iframe
          src="https://www.chatbase.co/chatbot-iframe/SzxvYORICrmmckhOCkvB6"
          width="100%"
          style={{ height: '100%', minHeight: '700px' }}
          frameBorder="0"
          className="rounded-2xl"
        />
      </div>
    </div>
  );
};

export default Chat;
