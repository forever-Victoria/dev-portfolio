import { useSyncExternalStore } from 'react';
import { ensureLoaded, getSnapshot, subscribe } from '../store/profileStore';

/**
 * Subscribe a component to the profile store. Returns undefined properties
 * until loading finishes, which the pages already handle with their spinner.
 */
export default function useProfile() {
  ensureLoaded();
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
