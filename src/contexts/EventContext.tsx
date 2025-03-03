import React, { createContext, useContext, ReactNode } from 'react';
import { EventBriefResponse } from '../api/events.api';

interface EventContextType {
  eventBrief: EventBriefResponse | null;
  setEventBrief: (eventBrief: EventBriefResponse | null) => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

interface EventProviderProps {
  children: ReactNode;
  value: EventContextType;
}

export const EventProvider: React.FC<EventProviderProps> = ({
  children,
  value,
}) => {
  return (
    <EventContext.Provider value={value}>{children}</EventContext.Provider>
  );
};

export const useEvent = () => {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvent must be used within an EventProvider');
  }
  return context;
};
