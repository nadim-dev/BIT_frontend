import {createBrowserRouter, Navigate, Outlet, RouterProvider} from "react-router-dom";
import Register from "./pages/Register";
import { Login } from "./pages/Login";
import LandingPage from "./pages/LandingPage";
import { UserDashBoard } from "./pages/UserDashboard";
import { Loader } from "./components/Loader";
import { useAuth } from "./hooks/useAuth";
import { getDashboardPath } from "./utils/dashboardRoutes";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardPlaceholder from "./pages/DashboardPlaceholder";
import { BecomeDonor } from "./pages/BecomeDonor";
import { ContactUs } from "./pages/ContactUs";
import CreateSupportTicket from "./pages/CreateSupportTicket";
import { MyTickets } from "./pages/Myticket";
import { TicketDetails } from "./pages/TicketDetails";
import { ProfilePage } from "./pages/Profile";
import { ForgotPassPage } from "./pages/Forgot.jsx";
import { ResetPasswordPage } from "./pages/Reset.jsx";
import { NotificationPage } from "./pages/NotificationPage.jsx";
import { AdminEnquiryPage } from "./pages/Admin/AdminEnquery.jsx";
import { AdminTicketsPage } from "./pages/Admin/AdminTicket.jsx";
import { AdminTicketDetailsPage } from "./pages/Admin/AdminTicketDetails.jsx";

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
   path:"/forgot-password",
   element:<ForgotPassPage />
},
{
    path:"/dashboard",
    element:<RoleRedirect />,
},
{  path:"/reset-password/:token",
   element:<ResetPasswordPage />
},

  {
    element:<ProtectedLayout />,

    children:[{
          element:<DashboardLayout />,
          children:[
             {
                path:"/user/dashboard",
                element:<UserDashBoard />,
             },
             {path:"/become-donor",
             element:<BecomeDonor />
            },

             { 
                path:"/profile",
                element:<ProfilePage />
             },
             
             {
                   path:"/support",
                   element:<ContactUs />
             },
             {
                   path:"/support/create-ticket",
                   element:<CreateSupportTicket />
             },
             {
                path:"/my-tickets",
                element:<MyTickets/>,
             },
             {
                path:"/notifications",
                element:<NotificationPage />
             },
             {
                path:"/my-tickets/:ticketId",
                element:<TicketDetails/>,
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
               path:"/admin/enquiries",
               element:<AdminEnquiryPage />
             },
             {
               path:"/admin/tickets",
               element:<AdminTicketsPage/>
             },
             {
               path:"/admin/tickets/:ticketId",
               element:<AdminTicketDetailsPage />
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
                path:"/settings",
                element:<DashboardPlaceholder title="Settings" description="Control dashboard preferences and account settings." />,
             },
    ],
       
  }],
   },
])


function App() {
  return <RouterProvider router={router} />;
}

export default App;
