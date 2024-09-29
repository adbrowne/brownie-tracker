import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import './App.css'
import { Outlet, Link } from "react-router-dom";
import { useEffect, useState, createContext } from 'react';
import PWABadge from './PWABadge';
import { GoogleLogin } from '@react-oauth/google';

interface UserContextType {
  profile: any,
  setProfile: any,
}

const queryClient = new QueryClient()

export const UserContext = createContext<UserContextType>({} as UserContextType);

export const loader = async () => {
};


export function App() {
  const [profile, setProfile] = useState<any>([]);

  useEffect(() => {
    console.log("Profile changed")
    console.log(profile);
  }, [profile])


  return (
    <>
      <QueryClientProvider client={queryClient}>
        <UserContext.Provider value={{ profile: profile, setProfile: setProfile }}>
          <GoogleLogin
            onSuccess={() => console.log("login success")}
            auto_select={true}
            useOneTap={true}
            ux_mode='redirect'
          />
          <div id="login">
            User: {profile.email}
          </div>
          <PWABadge />
          <Link to="/">Home</Link>
          <Link to="/login">Login</Link>
          <div id="detail">
            <Outlet />
          </div>
        </UserContext.Provider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </>
  )
}
