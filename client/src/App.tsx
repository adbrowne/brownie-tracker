import './App.css'
import { Outlet, Link } from "react-router-dom";
import { useEffect, useState, createContext } from 'react';
import PWABadge from './PWABadge';

interface UserContextType {
  profile: any,
  setProfile: any,
}

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
      <UserContext.Provider value={{ profile: profile, setProfile: setProfile }}>
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
    </>
  )
}
