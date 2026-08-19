import { axiosWithCreds, axiosWithoutCreds } from "./axiosInstances";

export const registerHospitalApi = (data) =>
  axiosWithoutCreds.post("/api/hospitals/register", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const getHospitalStats = () =>
  axiosWithCreds.get("/api/hospitals/stats");

export const getHospitals = () =>
  axiosWithCreds.get("/api/hospitals");

export const getHospitalById = (hospitalId) =>
  axiosWithCreds.get(`/api/hospitals/${hospitalId}`);

export const getPublicHospitalById = (hospitalId) =>
  axiosWithCreds.get(`/api/hospitals/public/${hospitalId}`);

export const updateHospitalStatus = (hospitalId, accountStatus) =>
  axiosWithCreds.patch(`/api/hospitals/${hospitalId}/status`, {
    accountStatus,
  });

export const getNearbyHospitals = (coordinates) =>
  axiosWithCreds.get("/api/hospitals/nearby")
