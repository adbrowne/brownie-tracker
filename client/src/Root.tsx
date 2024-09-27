import { useContext, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { format_date } from './utils.ts'
import { UserContext as AppUserContext } from './App.tsx'
export default function Root() {
  const { profile } = useContext<any>(AppUserContext);
  const navigate = useNavigate();
  useEffect(() => {
    const isLoggedIn = profile != null && profile.length !== 0;
    if (isLoggedIn) {
      var today = new Date();
      return navigate("/day/" + format_date(today));
    }
    else {
      console.log("not logged in");
      return navigate("/login");
    }
  }, [profile]);
  return <></>
}
