
import { useContext } from 'react';
import { CommunicationsContext } from '@/contexts/CommunicationsContext';
import type { CommunicationsContextType } from '@/contexts/CommunicationsContext';

export const useCommunications = (): CommunicationsContextType => {
  const context = useContext(CommunicationsContext);
  if (context === undefined) {
    throw new Error('useCommunications must be used within a CommunicationsProvider');
  }
  return context;
};
