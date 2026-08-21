import { axiosWithCreds } from "./axiosInstances";

export const createDonor = (data) =>
  axiosWithCreds.post("/api/donors", data);

export const getCurrentDonor = () =>
  axiosWithCreds.get("/api/donors/me");

export const updateCurrentDonor = (data) =>
  axiosWithCreds.patch("/api/donors/me", data);

export const updateDonorLocation = (coordinates) =>
  axiosWithCreds.post("/api/donors/location", { coordinates });


export const getAllUsersStats=()=>
  axiosWithCreds.get("/api/donors/users/stat");

export const getAllUsers = (params) =>
  axiosWithCreds.get("/api/donors/users", { params });

export const suspendUser=(userId)=>
   axiosWithCreds.patch(`/api/donors/users/${userId}/suspend`);


export const getAdminUserDetails = (userId) =>
  axiosWithCreds.get(`/api/donors/users/${userId}`)