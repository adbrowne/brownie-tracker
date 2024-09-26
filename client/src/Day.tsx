import { Form, useLoaderData, Link } from "react-router-dom";
import { format_date } from "./utils";



export async function loader({ params }: { params: any }) {
  const date: Date = new Date(params.date);
  var next_date = new Date();
  next_date.setDate(date.getDate() + 1);
  var prev_date = new Date();
  prev_date.setDate(date.getDate() - 1);

  const day_data = {
    "date": format_date(date),
    "next_date": format_date(next_date),
    "prev_date": format_date(prev_date),
  };
  return { day_data };
}

export function Day() {
  const { day_data } = useLoaderData() as any;
  const contact = {
    id: 0,
    first: "Your",
    last: "Name",
    avatar: "https://robohash.org/you.png?size=200x200",
    twitter: "your_handle",
    notes: "Some notes",
    favorite: true,
  };

  return (
    <div id="contact">
      <Link to={'/day/' + day_data.prev_date}>Prev</Link>
      {day_data.date}
      <Link to={'/day/' + day_data.next_date}>Next</Link>
      <div>
        <img
          key={contact.avatar}
          src={
            contact.avatar ||
            `https://robohash.org/${contact.id}.png?size=200x200`
          }
        />
      </div>

      <div>
        <h1>
          {contact.first || contact.last ? (
            <>
              {contact.first} {contact.last}
            </>
          ) : (
            <i>No Name</i>
          )}{" "}
        </h1>

        {contact.twitter && (
          <p>
            <a
              target="_blank"
              href={`https://twitter.com/${contact.twitter}`}
            >
              {contact.twitter}
            </a>
          </p>
        )}

        {contact.notes && <p>{contact.notes}</p>}

        <div>
          <Form action="edit">
            <button type="submit">Edit</button>
          </Form>
          <Form
            method="post"
            action="destroy"
            onSubmit={(event) => {
              if (
                !confirm(
                  "Please confirm you want to delete this record."
                )
              ) {
                event.preventDefault();
              }
            }}
          >
            <button type="submit">Delete</button>
          </Form>
        </div>
      </div>
    </div>
  );
}
