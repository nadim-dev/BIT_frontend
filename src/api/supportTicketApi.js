import { axiosWithCreds } from "./axiosInstances";

export const createSupportTicket = (data) =>
  axiosWithCreds.post("/api/support-tickets", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });


export const getMyTicketsAll=()=>
  axiosWithCreds.get("/api/support-tickets/mine")


export const getTicketByTicketId = (id) =>
  axiosWithCreds.get(`/api/support-tickets/${id}`);

export const sendTicketMessage = (id, data) =>
  axiosWithCreds.post(`/api/support-tickets/${id}/messages`, data, {
    headers:
      data instanceof FormData
        ? {
            "Content-Type": "multipart/form-data",
          }
        : undefined,
  });
