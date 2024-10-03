import { redirect } from "react-router-dom";
import { format_date } from './utils.ts'

export function rootLoader() {
  var today = new Date();
  return redirect("/day/" + format_date(today));
}

export default function Root() {
  return <></>;
}
