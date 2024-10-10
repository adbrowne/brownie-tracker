import {
    DefaultError,
    useMutation,
  useQuery,
} from '@tanstack/react-query'
import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { DayData, Exercise, ExerciseList, get_day as get_day_data } from './api.ts'
import axios from 'axios';


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

  function update_data(updated_data : DayData) {
    setDayData(updated_data);
    mutation.mutate(updated_data);
  }

  function update_exercise_list_item(item: ExerciseList, index: number) {
    const updated_data = Object.assign({}, dayData, {}) as DayData;
    updated_data.items[index] = item;
    update_data(updated_data);
  }

  const mutation = useMutation<DayData, DefaultError, DayData>({
    mutationFn: (updateDay) => {
      const body = { "content": JSON.stringify(updateDay)};
      const headers = {headers: {
            'Content-Type': 'application/json',
        }};
      return axios.post(`/api/day/${route_date}`, body, headers);
    },
  })
  // Queries
  const { isPending, isError, data, error } = useQuery({
    queryKey: ['daydatas', route_date],
    queryFn: async () => {
      if (route_date) {
        return axios
          .get(`/api/day/${route_date}`, {
            headers: {
              Accept: 'application/json'
            }
          })
      }
      else {
        return Promise.reject(new Error('No route_date'))
      }
    },
    networkMode: 'offlineFirst'
  })

  if (isPending) {
    return <span>Loading...</span>
  }

  if (isError) {
    return <span>Error: {error.message}</span>
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
      <pre>
        {JSON.stringify(data.data, null, 2)}
      </pre>
    </div>
  );
}
