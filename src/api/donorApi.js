import { axiosWithCreds } from "./axiosInstances";

export const createDonor = (data) =>
  axiosWithCreds.post("/api/donors", data);

export const getCurrentDonor = () =>
  axiosWithCreds.get("/api/donors/me");

export const updateCurrentDonor = (data) =>
  axiosWithCreds.patch("/api/donors/me", data);

export const updateDonorLocation = (coordinates) =>
  axiosWithCreds.post("/api/donors/location", { coordinates });
