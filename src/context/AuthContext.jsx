import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, firebaseReady } from "../services/firebase";
import {
  loginWithEmail,
  logout as logoutSession,
  requestPasswordReset,
  resolveProfessional,
} from "../services/authService";
import { AuthStatus } from "../utils/professionalAuth";

const AuthContext = createContext(null);

const initialState = {
  status: AuthStatus.loading,
  firebaseUser: null,
  profile: null,
  reason: null,
  reasonCode: null,
};

export function AuthProvider({ children }) {
  const [state, setState] = useState(initialState);

  const refreshProfile = useCallback(async (firebaseUser = auth.currentUser) => {
    if (!firebaseUser) {
      setState({ ...initialState, status: AuthStatus.unauthenticated });
      return;
    }
    setState({
      ...initialState,
      status: AuthStatus.loading,
      firebaseUser,
    });
    try {
      setState(await resolveProfessional(firebaseUser));
    } catch {
      setState({
        ...initialState,
        status: AuthStatus.error,
        firebaseUser,
        reason: "Não foi possível validar seu acesso neste momento.",
      });
    }
  }, []);

  const endSession = useCallback(async () => {
    setState({ ...initialState, status: AuthStatus.loading });
    try {
      await logoutSession();
    } finally {
      setState({ ...initialState, status: AuthStatus.unauthenticated });
    }
  }, []);

  useEffect(() => {
    let unsubscribe = () => {};
    let active = true;
    firebaseReady
      .then(() => {
        if (!active) return;
        unsubscribe = onAuthStateChanged(auth, refreshProfile);
      })
      .catch(() => {
        if (!active) return;
        setState({
          ...initialState,
          status: AuthStatus.error,
          reason:
            "Não foi possível conectar ao Vitta. Verifique sua internet.",
        });
      });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [refreshProfile]);

  const value = useMemo(
    () => ({
      ...state,
      login: loginWithEmail,
      logout: endSession,
      requestPasswordReset,
      refreshProfile,
      isAdmin: state.profile?.roles?.includes("admin") === true,
    }),
    [state, refreshProfile, endSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  return context;
}
