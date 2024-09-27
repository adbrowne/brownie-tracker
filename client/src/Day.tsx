import { Link, useParams } from "react-router-dom";
import { format_date } from "./utils";
import { useState, useEffect } from "react";


interface Exercise {
  name: string,
  reps: number,
  sets: number,
  done: number
}

interface ExerciseList {
  name: string
  items: Exercise[]
}

interface DayData {
  date: string
  next_date: string
  prev_date: string
  items: ExerciseList[]
}

async function get_day_data(date: Date) {
  var next_date = new Date();
  next_date.setDate(date.getDate() + 1);
  var prev_date = new Date();
  prev_date.setDate(date.getDate() - 1);

  const day_data: DayData = {
    "date": format_date(date),
    "next_date": format_date(next_date),
    "prev_date": format_date(prev_date),
    items: [
      {
        name: "Physio",
        items: [
          { name: "Bend down", reps: 10, sets: 3, done: 0 },
          { name: "Split squat", reps: 10, sets: 3, done: 0 },
          { name: "Band out", reps: 10, sets: 3, done: 0 },
          { name: "Band in", reps: 10, sets: 3, done: 0 },
        ]
      }
    ]
  };
  return { day_data };
}
export async function loader({ params }: { params: any }) {
  const date: Date = new Date(params.date);
  return get_day_data(date);
}

export function ExerciseComponent({ item, onDone }: { item: Exercise, onDone: () => void }) {
  return (
    <li>
      {item.name} x {item.reps}. {item.done}/{item.sets} sets.
      <button onClick={() => onDone()}>+1</button>
    </li>
  )
}

export function Editable({ value, onChange }: { value: string, onChange: (new_value: string) => void }) {
  let [mode, setMode] = useState('view');

  if (mode == "edit") {
    return (<>
      <input
        onBlur={() => setMode("view")}
        onKeyDown={(e) => { if (e.key == "Enter") { setMode("view") } }}
        type="text"
        onChange={(e => onChange(e.currentTarget.value))}
        defaultValue={value} />
    </>);
  }
  else {
    return (
      <span
        onClick={() => setMode("edit")}>{value}</span>);
  }

}

export function ExerciseListComponent({ item, onUpdate }: { item: ExerciseList, onUpdate: (item: ExerciseList) => void }) {
  function name_change(new_value: string) {
    const updated_item = Object.assign({}, item);
    updated_item.name = new_value;
    onUpdate(updated_item);
  }

  function onDone(index: number) {
    const current_value = item.items[index].done | 0;
    const updated_item = Object.assign({}, item);
    updated_item.items[index].done = current_value + 1;
    onUpdate(updated_item);
  }

  return (
    <div>
      <Editable onChange={name_change} value={item.name} />
      <ul>
        {
          item.items.map((sub_item, index) => (
            <ExerciseComponent key={index} item={sub_item} onDone={() => onDone(index)} />
          ))
        }
      </ul>
    </div>);
}

export function Day() {
  const [dayData, setDayData] = useState<DayData>();

  const { date: route_date } = useParams<{ date: string }>();

  useEffect(() => {
    if (route_date) {
      const date: Date = new Date(route_date);
      get_day_data(date).then(d => setDayData(d.day_data));
    }
  }, [route_date])

  function update_exercise_list_item(item: ExerciseList, index: number) {
    const update_data = Object.assign({}, dayData, {}) as DayData;
    update_data.items[index] = item;
    setDayData(update_data);
  }

  return (
    <div id="day">
      <Link to={'/day/' + dayData?.prev_date}>Prev</Link>
      {dayData?.date}
      <Link to={'/day/' + dayData?.next_date}>Next</Link>
      <div>
        <div>
          {
            dayData?.items.map((item: ExerciseList, index: number) => (
              <ExerciseListComponent item={item} key={index} onUpdate={(update_item) => update_exercise_list_item(update_item, index)} />
            ))
          }
        </div>
      </div>
      <pre>
        {JSON.stringify(dayData, null, 2)}
      </pre>
    </div>
  );
}
