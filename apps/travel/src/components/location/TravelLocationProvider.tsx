import type { ReactNode } from 'react';
import { TravelLocationContext } from '../../hooks/travelLocationContext';
import { useTravelLocationState } from '../../hooks/useTravelLocationState';

function TravelLocationProvider({ children }: { children: ReactNode }) {
  const location = useTravelLocationState();
  return (
    <TravelLocationContext.Provider value={location}>
      {children}
    </TravelLocationContext.Provider>
  );
}

export default TravelLocationProvider;
