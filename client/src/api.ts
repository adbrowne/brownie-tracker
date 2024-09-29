import { format_date } from "./utils";

export interface Exercise {
  name: string,
  reps: number,
  sets: number,
  done: number
}

export interface ExerciseList {
  name: string
  items: Exercise[]
}

export interface DayData {
  date: string
  next_date: string
  prev_date: string
  items: ExerciseList[]
}

export async function get_day(date: Date) {
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
