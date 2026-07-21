import {createBrowserRouter, Navigate, Outlet, RouterProvider,} from "react-router-dom";
import Register from "./pages/Register";
import { Login } from "./pages/Login";

const router=createBrowserRouter([
{
    path: "/register",
    element: <Register />,
},
{
   path:"/login",
   element: <Login />,
}
])


function App() {
  return <RouterProvider router={router} />;
}

export default App;

