
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send } from 'lucide-react';

interface MessageComposerProps {
  onSendMessage: (subject: string, message: string) => Promise<boolean>;
  isDisabled?: boolean;
}

const MessageComposer: React.FC<MessageComposerProps> = ({ onSendMessage, isDisabled }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !message.trim()) {
      return;
    }

    setIsSending(true);
    const success = await onSendMessage(subject, message);
    
    if (success) {
      setSubject('');
      setMessage('');
    }
    
    setIsSending(false);
  };

  return (
    <Card className="bg-onolo-dark-lighter border-onolo-gray">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-sm">Send Message to Support</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="bg-onolo-dark border-onolo-gray text-white placeholder-onolo-gray"
            disabled={isDisabled || isSending}
          />
          <Textarea
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="bg-onolo-dark border-onolo-gray text-white placeholder-onolo-gray min-h-[80px] resize-none"
            disabled={isDisabled || isSending}
          />
          <Button
            type="submit"
            disabled={!subject.trim() || !message.trim() || isDisabled || isSending}
            className="w-full bg-onolo-orange hover:bg-onolo-orange-dark"
          >
            <Send className="w-4 h-4 mr-2" />
            {isSending ? 'Sending...' : 'Send Message'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MessageComposer;
