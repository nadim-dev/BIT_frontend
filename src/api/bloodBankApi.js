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

export const fetchParticularBloodBank=(bloodBankId)=>
  axiosWithCreds.get(`/api/blood-banks/admin/${bloodBankId}`)

export const updateAdminBloodBankStatus = (bloodBankId, status, reason = "") =>
  axiosWithCreds.patch(`/api/blood-banks/admin/${bloodBankId}/status`, {
    status,
    reason,
  });
