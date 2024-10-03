import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App.tsx'
import Root, { rootLoader } from './Root.tsx'
import { Day, loader as dayLoader } from './Day.tsx'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import './index.css'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Root />,
        loader: rootLoader
      },
      {
        path: "/day/:date/",
        element: <Day />,
        loader: dayLoader
      },
    ]
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
