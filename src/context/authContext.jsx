import { useCallback, useEffect, useState } from "react";
import { currentUserApi } from "../api/authApi.js";
import { AuthContext } from "./AuthContextValue";


export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
 
  const fetchCurrentUser = useCallback(async () => {
    setAuthLoading(true);
    try {
      const data = await currentUserApi();
      setCurrentUser(data.currentUser);
      return data.currentUser;
    } catch {
      setCurrentUser(null);
      return null;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadCurrentUser = async () => {
      await fetchCurrentUser();
    };

    loadCurrentUser();
  }, [fetchCurrentUser]);

  const value = {
    currentUser,
    setCurrentUser,
    authLoading,
    fetchCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
