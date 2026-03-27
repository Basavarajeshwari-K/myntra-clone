import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type UserType = {
  email: string;
};

type AuthContextType = {
  user: UserType | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  // Auto login check when app starts
  useEffect(() => {
    const loadUser = async () => {
      try {
        const savedUser = await AsyncStorage.getItem("loggedUser");

        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.log("Error loading user", error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error("Email and password required");
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    const correctEmail = "john.doe@example.com";
    const correctPassword = "123456789";

    if (email !== correctEmail || password !== correctPassword) {
      throw new Error("Invalid email or password");
    }

    const userData = { email };

    setUser(userData);
    await AsyncStorage.setItem("loggedUser", JSON.stringify(userData));
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem("loggedUser");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};