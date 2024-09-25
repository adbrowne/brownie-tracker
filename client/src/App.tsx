import './App.css'
import { redirect } from "react-router-dom";
import { format_date } from './utils.ts'

export const loader = async () => {
  var today = new Date();

  return redirect("/day/" + format_date(today));
};


export function App() {

  return (
    <>
      Home
    </>
  )
}
