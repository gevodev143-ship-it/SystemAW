// core/contexts/AuthContext.tsx
// createContext es donde se guardara el id del cust
// useContext 
import { createContext, useContext, useEffect, useState} from "react";
import type { ReactNode } from "react"
import { supabase } from "../../lib/supabase";
import { obtenerCustIdPorAuthId } from "../services/auth.service";

interface AuthContextType {
  custId: number | null;
  custNameBucket: string | null;
  session: any;
  loadingAuth: boolean;
}

const AuthContext = createContext<AuthContextType>({
  custId: null,
  custNameBucket: null,
  session: null,
  loadingAuth: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<any>(null);
  const [custId, setCustId] = useState<number | null>(null);
  const [custNameBucket, setCustNameBucket] = useState<string | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const resolverCustomer = async (userId: string) => {
    const { data: customer, error } = await obtenerCustIdPorAuthId(userId);

    if (error || !customer) {
      console.error("ERROR AL OBTENER CUSTOMER:", error);
      setCustId(null);
      setCustNameBucket(null);
      return;
    }

    setCustId(customer.cust_id);
    setCustNameBucket(customer.cust_name_bucket);
  };

  useEffect(() => {
    const inicializar = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);

      if (data.session?.user) {
        await resolverCustomer(data.session.user.id);
      }

      setLoadingAuth(false);
    };

    inicializar();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);

      if (session?.user) {
        await resolverCustomer(session.user.id);
      } else {
        setCustId(null);
        setCustNameBucket(null);
        localStorage.removeItem("aw_erp_jwt");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ custId, custNameBucket, session, loadingAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);