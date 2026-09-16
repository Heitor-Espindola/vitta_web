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
  logout,
  requestPasswordReset,
  resolveProfessional,
} from "../services/authService";

const AuthContext = createContext(null);

const initialState = {
  status: "loading",
  firebaseUser: null,
  profile: null,
  reason: null,
};

export function AuthProvider({ children }) {
  const [state, setState] = useState(initialState);

  const refreshProfile = useCallback(async (firebaseUser = auth.currentUser) => {
    if (!firebaseUser) {
      setState({ ...initialState, status: "notAuthenticated" });
      return;
    }
    setState((current) => ({ ...current, status: "loading" }));
    try {
      setState(await resolveProfessional(firebaseUser));
    } catch (error) {
      setState({
        status: "error",
        firebaseUser,
        profile: null,
        reason: "Não foi possível validar o perfil profissional.",
        error,
      });
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
      .catch((error) => {
        if (!active) return;
        setState({
          status: "error",
          firebaseUser: null,
          profile: null,
          reason: "Não foi possível inicializar a sessão.",
          error,
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
      logout,
      requestPasswordReset,
      refreshProfile,
      isAdmin: state.profile?.roles?.includes("admin") === true,
    }),
    [state, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  return context;
}
