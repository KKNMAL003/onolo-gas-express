
import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Bell, User } from 'lucide-react';

interface CommunicationLog {
  id: string;
  user_id: string;
  log_type: string;
  subject: string | null;
  message: string;
  created_at: string;
}

interface CommunicationsFeedProps {
  communications: CommunicationLog[];
  isLoading: boolean;
  onMarkAsRead: () => void;
}

const CommunicationsFeed: React.FC<CommunicationsFeedProps> = ({ 
  communications, 
  isLoading, 
  onMarkAsRead 
}) => {
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Mark as read when component mounts or when communications update
    onMarkAsRead();
  }, [communications, onMarkAsRead]);

  const getMessageIcon = (logType: string) => {
    switch (logType) {
      case 'order_status_update':
        return <Bell className="w-4 h-4 text-onolo-orange" />;
      case 'user_message':
        return <User className="w-4 h-4 text-blue-400" />;
      default:
        return <MessageSquare className="w-4 h-4 text-onolo-gray" />;
    }
  };

  const getMessageBadgeColor = (logType: string) => {
    switch (logType) {
      case 'order_status_update':
        return 'bg-onolo-orange/20 text-onolo-orange border-onolo-orange/30';
      case 'user_message':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-onolo-gray/20 text-onolo-gray border-onolo-gray/30';
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-onolo-dark-lighter border-onolo-gray">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-onolo-orange"></div>
            <span className="ml-3 text-onolo-gray">Loading messages...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-onolo-dark-lighter border-onolo-gray">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-sm flex items-center">
          <MessageSquare className="w-4 h-4 mr-2" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div 
          ref={feedRef}
          className="max-h-80 overflow-y-auto space-y-3 px-6 pb-6"
        >
          {communications.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-onolo-gray mx-auto mb-3" />
              <p className="text-onolo-gray">No messages yet</p>
              <p className="text-sm text-onolo-gray mt-1">
                Order updates and messages will appear here
              </p>
            </div>
          ) : (
            communications.map((comm) => (
              <div
                key={comm.id}
                className="flex items-start space-x-3 p-3 rounded-lg bg-onolo-dark/50 border border-onolo-gray/30"
              >
                <div className="flex-shrink-0 mt-1">
                  {getMessageIcon(comm.log_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getMessageBadgeColor(comm.log_type)}`}
                    >
                      {comm.log_type === 'order_status_update' 
                        ? 'Order Update' 
                        : comm.log_type === 'user_message'
                        ? 'Your Message'
                        : 'System'}
                    </Badge>
                    <span className="text-xs text-onolo-gray">
                      {formatDateTime(comm.created_at)}
                    </span>
                  </div>
                  {comm.subject && (
                    <h4 className="text-sm font-medium text-white mb-1">
                      {comm.subject}
                    </h4>
                  )}
                  <p className="text-sm text-onolo-gray leading-relaxed">
                    {comm.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CommunicationsFeed;
