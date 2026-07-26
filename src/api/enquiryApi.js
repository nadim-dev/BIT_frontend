import { axiosWithoutCreds } from "./axiosInstances";

export const createEnquiry = (data) =>
  axiosWithoutCreds.post("/api/enquiries", data);