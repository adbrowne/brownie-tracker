export function format_date(date: Date) {
  var dd = String(date.getDate()).padStart(2, '0');
  var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = date.getFullYear();

  var today_str = yyyy + '-' + mm + '-' + dd;
  return today_str;
}
