import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../api/client";

const UserContext = createContext(null);
const STORAGE_KEY = "skillswap_active_user_id";

export function UserProvider({ children }) {
  const [allUsers, setAllUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const users = await api.getUsers();
      setAllUsers(users);

      const savedId = localStorage.getItem(STORAGE_KEY);
      const savedUser = users.find((u) => u._id === savedId);
      const nextActive = savedUser || users[0] || null;
      setActiveUser(nextActive);
      if (nextActive) localStorage.setItem(STORAGE_KEY, nextActive._id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const switchUser = (userId) => {
    const user = allUsers.find((u) => u._id === userId);
    if (user) {
      setActiveUser(user);
      localStorage.setItem(STORAGE_KEY, user._id);
    }
  };

  const refreshActiveUser = async () => {
    if (!activeUser) return;
    const fresh = await api.getUser(activeUser._id);
    setActiveUser(fresh);
    setAllUsers((prev) => prev.map((u) => (u._id === fresh._id ? fresh : u)));
  };

  return (
    <UserContext.Provider
      value={{ allUsers, activeUser, switchUser, refreshActiveUser, loading, error, reload: loadUsers }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useActiveUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useActiveUser must be used within a UserProvider");
  return ctx;
}
