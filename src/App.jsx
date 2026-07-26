import {createBrowserRouter, Navigate, Outlet, RouterProvider} from "react-router-dom";
import Register from "./pages/Register";
import { Login } from "./pages/Login";
import LandingPage from "./pages/LandingPage";
import { UserDashBoard } from "./pages/UserDashBoard/UserDashboard";
import { Loader } from "./components/Loader";
import { useAuth } from "./hooks/useAuth";
import { getDashboardPath } from "./utils/dashboardRoutes";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardPlaceholder from "./pages/UserDashBoard/DashboardPlaceholder";


function ProtectedLayout() {
  console.log("Protected layout function is running");
  const {currentUser, authLoading } = useAuth();
  console.log("currentUser",currentUser);
 
  if (authLoading){
    return <Loader />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function RoleRedirect() {
  console.log("role direct layout function is running");
  const { currentUser, authLoading } = useAuth();
  console.log("currentUser",currentUser);

  if (authLoading){
    return <Loader />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDashboardPath(currentUser.role)} replace />;
}


const router=createBrowserRouter([
{
    path:"/",
    element:<LandingPage />
},
{
    path: "/register",
    element: <Register />,
},
{
   path:"/login",
   element: <Login />,
},
{
    path:"/dashboard",
    element:<RoleRedirect />,
},
  {
    element:<ProtectedLayout />,
    children:[
       {
          element:<DashboardLayout />,
          children:[
             {
                path:"/user/dashboard",
                element:<UserDashBoard />,
             },
             {
                path:"/hospital/dashboard",
                element:<UserDashBoard />,
             },
             {
                path:"/blood-bank/dashboard",
                element:<UserDashBoard />,
             },
             {
                path:"/delivery-partner/dashboard",
                element:<UserDashBoard />,
             },
             {
                path:"/admin/dashboard",
                element:<UserDashBoard />,
             },
             {
                path:"/emergency",
                element:<DashboardPlaceholder title="Emergency Help" description="Request urgent blood support and track emergency actions from here." />,
             },
             {
                path:"/requests",
                element:<DashboardPlaceholder title="My Requests" description="View and manage your blood requests in one place." />,
             },
             {
                path:"/become-donor",
                element:<DashboardPlaceholder title="Become a Donor" description="Complete donor details and start helping nearby patients." />,
             },
             {
                path:"/my-donations",
                element:<DashboardPlaceholder title="My Donations" description="Track donation history and upcoming eligibility." />,
             },
             {
                path:"/nearby-hospitals",
                element:<DashboardPlaceholder title="Nearby Hospitals" description="Find hospitals near your location that can help with blood requests." />,
             },
             {
                path:"/nearby-blood-banks",
                element:<DashboardPlaceholder title="Nearby Blood Banks" description="Explore blood banks and availability around you." />,
             },
             {
                path:"/notifications",
                element:<DashboardPlaceholder title="Notifications" description="See important updates, alerts, and account messages." />,
             },
             {
                path:"/profile",
                element:<DashboardPlaceholder title="Profile" description="Manage your personal details and account information." />,
             },
             {
                path:"/settings",
                element:<DashboardPlaceholder title="Settings" description="Control dashboard preferences and account settings." />,
             },
             {
                path:"/support",
                element:<DashboardPlaceholder title="Help & Support" description="Get help with your account, requests, and donor activity." />,
             },
          ],
       },
    ],
  },
])


function App() {
  return <RouterProvider router={router} />;
}

export default App;
