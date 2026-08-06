import { axiosWithCreds, axiosWithoutCreds } from "./axiosInstances";

export const createEnquiry = (data) =>
  axiosWithoutCreds.post("/api/enquiries", data);

export const getAllEnquiries = () => axiosWithCreds.get("/api/enquiries");

export const replyToEnquiry = (id, data) =>
  axiosWithCreds.patch(`/api/enquiries/${id}/reply`, data);
