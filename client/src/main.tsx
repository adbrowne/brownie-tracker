import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App.tsx'
import Root from './Root.tsx'
import { Day, loader as dayLoader } from './Day.tsx'
import Login from './Login.tsx'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google"
import './index.css'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Root />,
      },
      {
        path: "/day/:date",
        element: <Day />,
        loader: dayLoader
      },
      {
        path: "/login",
        element: <Login />,
      }
    ]
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId='16380431687-kegt0p4veft5blk4oqvdb7hblputaqdq.apps.googleusercontent.com'>
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>,
  </GoogleOAuthProvider>
)
