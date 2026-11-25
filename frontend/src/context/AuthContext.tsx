import React, { createContext, useContext, useState, useEffect } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import { SecureStorage } from '../services/storage';
import { ApiService, UserProfile } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  biometricSupported: boolean;
  biometricEnrolled: boolean;
  loginWithPhone: (phone: string, pin?: string) => Promise<void>;
  signupWithPhone: (phone: string, name: string, pin?: string) => Promise<void>;
  authenticateWithBiometrics: () => Promise<boolean>;
  enableBiometrics: () => Promise<boolean>;
  setPin: (pin: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometricEnrolled, setBiometricEnrolled] = useState(false);

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricSupported(hasHardware);
      setBiometricEnrolled(isEnrolled);

      const storedToken = await SecureStorage.getToken();
      const storedUser = await SecureStorage.getUser();

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
      }
    } catch (err) {
      console.warn('Init auth failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithPhone = async (phoneNumber: string, pin?: string) => {
    const res = await ApiService.login({ phoneNumber, pin });
    await SecureStorage.setToken(res.token);
    await SecureStorage.setUser(res.user);
    setToken(res.token);
    setUser(res.user);
  };

  const signupWithPhone = async (phoneNumber: string, fullName: string, pin?: string) => {
    const res = await ApiService.signup({ phoneNumber, fullName, pin });
    await SecureStorage.setToken(res.token);
    await SecureStorage.setUser(res.user);
    setToken(res.token);
    setUser(res.user);
  };

  const authenticateWithBiometrics = async (): Promise<boolean> => {
    try {
      const res = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Log in to Payora with Face ID',
        fallbackLabel: 'Use 5-digit PIN',
        cancelLabel: 'Cancel',
      });
      return res.success;
    } catch (err) {
      console.warn('Biometric auth error:', err);
      return false;
    }
  };

  const enableBiometrics = async (): Promise<boolean> => {
    const success = await authenticateWithBiometrics();
    if (success) {
      await SecureStorage.setBiometricEnabled(true);
    }
    return success;
  };

  const setPin = async (pin: string) => {
    await ApiService.setPin(pin);
  };

  const refreshProfile = async () => {
    try {
      const profile = await ApiService.getProfile();
      setUser(profile);
      await SecureStorage.setUser(profile);
    } catch (e) {
      console.warn('Refresh profile error:', e);
    }
  };

  const logout = async () => {
    await SecureStorage.clearAll();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        biometricSupported,
        biometricEnrolled,
        loginWithPhone,
        signupWithPhone,
        authenticateWithBiometrics,
        enableBiometrics,
        setPin,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
