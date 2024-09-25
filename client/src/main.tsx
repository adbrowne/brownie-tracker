import React from 'react'
import ReactDOM from 'react-dom/client'
import { App, loader as appLoader } from './App.tsx'
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
    loader: appLoader
  },
  {
    path: "/day/:date",
    element: <Day />,
    loader: dayLoader
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
