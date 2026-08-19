import { axiosWithCreds, axiosWithoutCreds } from "./axiosInstances";

export const registerBloodBankApi = (data) =>
  axiosWithoutCreds.post("/api/blood-banks/register", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const getAllAdminBloodBanks = () =>
  axiosWithCreds.get("/api/blood-banks/admin/all");

export const getNearbyBloodBanks = (coordinates) =>
  axiosWithCreds.get("/api/blood-banks/nearby", {
    params: coordinates,
  });

export const getPublicBloodBank = (bloodBankId) =>
  axiosWithCreds.get(`/api/blood-banks/${bloodBankId}`);

export const createBloodRequest = (bloodBankId, data) =>
  axiosWithCreds.post(`/api/blood-banks/${bloodBankId}/requests`, data);

export const getMyBloodRequests = () =>
  axiosWithCreds.get("/api/blood-banks/requests/my");

export const getMyBloodRequestTracking = (bloodRequestId) =>
  axiosWithCreds.get(`/api/blood-banks/requests/my/${bloodRequestId}/tracking`);

export const generateDeliveryOtp = (bloodRequestId) =>
  axiosWithCreds.post(`/api/blood-banks/requests/my/${bloodRequestId}/delivery-otp`);

export const confirmDelivery = (bloodRequestId, otp, collectionMethod) =>
  axiosWithCreds.patch(`/api/delivery-requests/${bloodRequestId}/confirm-delivery`, { otp, collectionMethod });

export const getIncomingBloodBankRequests = () =>
  axiosWithCreds.get("/api/blood-banks/requests/incoming");

export const approveIncomingBloodBankRequest = (requestId) =>
  axiosWithCreds.patch(`/api/blood-banks/requests/incoming/${requestId}/approve`);

export const markIncomingBloodBankRequestReadyToDispatch = (requestId) =>
  axiosWithCreds.patch(`/api/blood-banks/requests/incoming/${requestId}/ready-to-dispatch`);

export const rejectIncomingBloodBankRequest = (requestId, reason = "") =>
  axiosWithCreds.patch(`/api/blood-banks/requests/incoming/${requestId}/reject`, {
    reason,
  });

export const getMyBloodBankProfile = () =>
  axiosWithCreds.get("/api/blood-banks/me/profile");

export const updateMyBloodBankProfile = (profileData) =>
  axiosWithCreds.patch("/api/blood-banks/me/profile", profileData);

export const addMyBloodBankInventory = (inventoryData) =>
  axiosWithCreds.post("/api/blood-banks/me/inventory", inventoryData);

export const updateMyBloodBankInventory = (inventoryId, inventoryData) =>
  axiosWithCreds.patch(`/api/blood-banks/me/inventory/${inventoryId}`, inventoryData);

export const deleteMyBloodBankInventory = (inventoryId) =>
  axiosWithCreds.delete(`/api/blood-banks/me/inventory/${inventoryId}`);

export const cancelMyBloodRequest = (requestId) =>
  axiosWithCreds.patch(`/api/blood-banks/requests/${requestId}/cancel`);

export const fetchParticularBloodBank=(bloodBankId)=>
  axiosWithCreds.get(`/api/blood-banks/admin/${bloodBankId}`)

export const updateAdminBloodBankStatus = (bloodBankId, status, reason = "") =>
  axiosWithCreds.patch(`/api/blood-banks/admin/${bloodBankId}/status`, {
    status,
    reason,
  });


export const getAllInventory=()=>
  axiosWithCreds.get("/api/blood-bank")

export const getActiveRequest=()=>
   axiosWithCreds.get("/api/blood-requests/my/active-delivery")

export const getCompletedDeliveries = () =>
  axiosWithCreds.get("/api/blood-requests/my/completed-deliveries");

export const startJourney=(bloodRequestId)=>
  axiosWithCreds.patch(`/api/blood-requests/${bloodRequestId}/start-journey`)

export const generatePickupOtp = (bloodRequestId) =>
  axiosWithCreds.post(`/api/blood-requests/${bloodRequestId}/pickup-otp`);

export const confirmPickup = (bloodRequestId, otp) =>
  axiosWithCreds.patch(`/api/blood-requests/${bloodRequestId}/confirm-pickup`, { otp });

export const startDelivery = (requestId) =>
  axiosWithCreds.patch(`/api/delivery-requests/${requestId}/start-delivery`);


export const completeDelivery=(requestId)=>
  axiosWithCreds.patch(`/delivery-requests/${requestId}/complete`)
