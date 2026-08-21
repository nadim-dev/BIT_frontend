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
import { BloodBankPage } from "./pages/NearbyBloodbank.jsx";
import { BloodbankRegisteration } from "./pages/RegisterforBloodBank.jsx";
import { AdminBloodBanks } from "./pages/Admin/AdminBloodBanks.jsx";
import { BloodBankDetails } from "./pages/Admin/AdminBloodBankDetails.jsx";
import { BloodBankPublicDashboard } from "./pages/BloodBankPublicDashboard.jsx";
import { UsersAllRequest } from "./pages/UserRequest.jsx";
import { BloodBankDashbaord } from "./pages/Blood_Bank/BloodbankDashboard.jsx";
import { BloodBankProfile } from "./pages/Blood_Bank/BloodBankProfile.jsx";
import { BloodBankInventory } from "./pages/Blood_Bank/Inventory.jsx";
import { RequestToBloodBank } from "./pages/Blood_Bank/RequestToBloodBank.jsx";
import { DeliveryPartnerRegisteration } from "./pages/Delivery_Partnet/DeliveryPartnerRegistration.jsx";
import { AdminDeliveryPartner } from "./pages/Admin/AdminDeliveryPartner.jsx";
import { DeliveryPartnetDetails } from "./pages/Admin/AdminDeliveryPartnerDetails.jsx";
import { HospitalRegisteration } from "./pages/Hospital/HospitalRegisteration.jsx";
import { AdminHospital } from "./pages/Admin/AdminHospital.jsx";
import { AdminHospitalDetails } from "./pages/Admin/AdminHospitalDetails.jsx";
import { NearByHospital } from "./pages/NearBYHospital.jsx";
import { HospitalPublicDashboard } from "./pages/HospitalPublicDashboard.jsx";
import { DeliveryRequest } from "./pages/Delivery_Partnet/DeliveryReques.jsx";
import { MyDeliveries } from "./pages/Delivery_Partnet/MyDeliveries.jsx";
import { TrackingUserOrder } from "./pages/UserTarckingPage.jsx";
import { RegisteredUsers } from "./pages/Admin/MontinoritngUsrers.jsx";
import { AIdemandPrediction } from "./pages/Blood_Bank/AIdemandPrediction.jsx";

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
{
   path:"/register/blood-bank",
   element:<BloodbankRegisteration/>
},
{
   path:"/register/delivery-partner",
   element:<DeliveryPartnerRegisteration />
},
{  path:"/reset-password/:token",
   element:<ResetPasswordPage />
},
 {
   path:"/delivery-partner/register",
   element:<DeliveryPartnerRegisteration />
 },
{
   path:"/register/hospital",
   element:<HospitalRegisteration/>
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
             {
             path:"/become-donor",
             element:<BecomeDonor />
            },
            {
              path:"/users",
              element:<RegisteredUsers />
            },
            {
              path:"/admin/delivery-partner",
              element:<AdminDeliveryPartner/>
            },
             {
               path:"/admin/hospitals",
               element:<AdminHospital/>
            },
            {
               path:"/admin/hospitals/:hospitalId",
               element:<AdminHospitalDetails/>
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
                    path:"/admin/blood-bank/:bloodBankId",
                    element:<BloodBankDetails/>
             },
             {
                   path:"/admin/delivery-partners/:partnerId",
                   element:<DeliveryPartnetDetails/>
             },
             {
               path:"/my-requests/:bloodrequestId",
               element:<TrackingUserOrder/>
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
                path:"/admin/blood-banks",
                element:<AdminBloodBanks/>
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
                element:<BloodBankDashbaord />,
             },
             { path:"/blood-bank/profile",
               element:<BloodBankProfile />
             },
             {
                path:"/blood-bank/inventory",
                element:<BloodBankInventory/>
             },
             {
                path:"/blood-bank/requests",
                element:<RequestToBloodBank/>,
             },
             {
                path:"/delivery-partner/request",
                element:<DeliveryRequest/>
             },
             {
                path:"/blood-bank/inventory",
                element:<DashboardPlaceholder title="Inventory" description="Update blood stock, component availability, and processing details from here." />,
             },
             {
                path:"/blood-bank/ai-demand-prediction",
                element:<AIdemandPrediction/>
             },
             {
                path:"/blood-bank/:bloodBankId/dashboard",
                element:<BloodBankPublicDashboard />,
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
                path:"/my-requests",
                element:<UsersAllRequest/>,
             },
             {
                path:"/nearby-hospitals",
                element:<NearByHospital />,
             },
             {
                path:"/hospitals/:hospitalId/dashboard",
                element:<HospitalPublicDashboard />,
             },
             {
                path:"/nearby-blood-banks",
                element:<BloodBankPage/>,
             },
             
             {
                path:"/settings",
                element:<DashboardPlaceholder title="Settings" description="Control dashboard preferences and account settings." />,
             },
             {
               path:"/my-deliveries",
               element:<MyDeliveries/>
             }
    ],
       
  }],
   },
])


function App() {
  return <RouterProvider router={router} />;
}

export default App;
