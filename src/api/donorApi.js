import { axiosWithCreds } from "./axiosInstances";

export const createDonor = (data) =>
  axiosWithCreds.post("/api/donors", data);

export const updateDonorLocation = (coordinates) =>
  axiosWithCreds.post("/api/donors/location", { coordinates });
