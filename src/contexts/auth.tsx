import { createContext, ReactNode, useEffect, useState } from "react";
import { api } from "../services/api";

interface IUser {
  id: string;
  login: string;
  name: string;
  avatar_url: string;
}

interface IAuthContextData {
  user: IUser | null;
  signInUrl: string;
  signOut: () => void;
}

interface IAuthProps {
  children: ReactNode;
}

interface IAuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    avatar_url: string;
    login: string;
  }
}

const AuthContext = createContext({} as IAuthContextData);

function AuthProvider({ children }: IAuthProps) {
  const clientId = '39ca8dc3d69c8e197f07';
  const signInUrl = `https://github.com/login/oauth/authorize?scope=user&client_id=${clientId}&redirect_uri`;
  
  const [user, setUser] = useState<IUser | null>(null);
  
  async function signIn(githubToken: string) {
    const { data } = await api.post<IAuthResponse>('/authenticate', { code: githubToken });
  
    const { token, user } = data;

    // Sets the authorization token for all the application
    api.defaults.headers.common.authorization = `Bearer ${token}`;

    localStorage.setItem('@nlw-heat:token', token);    
    setUser(user);
  }

  async function signOut() {
    setUser(null);
    localStorage.removeItem('@nlw-heat:token');
  }

  useEffect(() => {
    const url = window.location.href;
    const hasGithubToken = url.includes('?code=');

    if (hasGithubToken) {
      const [urlWithoutToken, token] = url.split('?code=');

      window.history.pushState({}, '', urlWithoutToken);

      signIn(token);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('@nlw-heat:token');

    if (token) {
      // api.get<IUser>('/profile', {
      //   headers: {
      //     ['authorization']: `Bearer ${token}`
      //   }
      // }).then(response => setUser(response.data));

      // Sets the authorization token for all the application
      api.defaults.headers.common.authorization = `Bearer ${token}`;

      api.get<IUser>('/profile').then(response => setUser(response.data));
    }
  }, []);
  
  return (
    <AuthContext.Provider value={{ signInUrl, user, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthProvider, AuthContext }