import { axiosWithCreds } from "./axiosInstances";

export const createSupportTicket = (data) =>
  axiosWithCreds.post("/api/support-tickets", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });


export const getMyTicketsAll=()=>
  axiosWithCreds.get("/api/support-tickets/mine")
