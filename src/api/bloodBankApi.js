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

export const getMyBloodBankProfile = () =>
  axiosWithCreds.get("/api/blood-banks/me/profile");

export const updateMyBloodBankProfile = (profileData) =>
  axiosWithCreds.patch("/api/blood-banks/me/profile", profileData);

export const cancelMyBloodRequest = (requestId) =>
  axiosWithCreds.patch(`/api/blood-banks/requests/${requestId}/cancel`);

export const fetchParticularBloodBank=(bloodBankId)=>
  axiosWithCreds.get(`/api/blood-banks/admin/${bloodBankId}`)

export const updateAdminBloodBankStatus = (bloodBankId, status, reason = "") =>
  axiosWithCreds.patch(`/api/blood-banks/admin/${bloodBankId}/status`, {
    status,
    reason,
  });
