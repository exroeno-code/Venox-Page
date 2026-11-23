import { useEffect, useSyncExternalStore } from "react";

import { getAuthState, startAuth, subscribeAuth, type AuthState } from "./auth-core";

const LOADING: AuthState = { status: "loading" };

/** Current VEXON account state. `loading` on the server and during the first client render. */
export function useAuth(): AuthState {
  const auth = useSyncExternalStore(subscribeAuth, getAuthState, () => LOADING);
  useEffect(() => {
    startAuth();
  }, []);
  return auth;
}
