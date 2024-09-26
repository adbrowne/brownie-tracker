import './App.css'
import { Outlet } from "react-router-dom";
import { useState, createContext } from 'react';

interface UserContextType {
  profile: any,
  setProfile: any,
}

export const UserContext = createContext<UserContextType>({} as UserContextType);

export const loader = async () => {
};


export function App() {
  const [profile, setProfile] = useState<any>([]);

  return (
    <>
      <UserContext.Provider value={{ profile: profile, setProfile: setProfile }}>
        <div id="login">
          {profile.email}
        </div>
        Home
        <div id="detail">
          <Outlet />
        </div>
      </UserContext.Provider>
    </>
  )
}
