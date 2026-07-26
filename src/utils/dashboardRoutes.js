const dashboardRoutes = {
  User: "/user/dashboard",
  Hospital: "/hospital/dashboard",
  BloodBank: "/blood-bank/dashboard",
  DeliveryPartner: "/delivery-partner/dashboard",
  Admin: "/admin/dashboard",
};

export const getDashboardPath = (role) => dashboardRoutes[role] || "/user/dashboard";
