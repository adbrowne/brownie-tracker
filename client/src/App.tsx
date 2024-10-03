import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import './App.css'
import { Outlet, Link } from "react-router-dom";
import PWABadge from './PWABadge';

const queryClient = new QueryClient()

export const loader = async () => {
};

export function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <PWABadge />
        <Link to="/">Home</Link>
        <Link to="/login">Login</Link>
        <div id="detail">
          <Outlet />
        </div>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </>
  )
}
