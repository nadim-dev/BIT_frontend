import {createBrowserRouter, RouterProvider,} from "react-router-dom";
import Register from "./pages/Register";
import { Login } from "./pages/Login";
import LandingPage from "./pages/LandingPage";

const router=createBrowserRouter([
{
    path: "/register",
    element: <Register />,
},
{
  path:"/",
  element:<LandingPage />
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
