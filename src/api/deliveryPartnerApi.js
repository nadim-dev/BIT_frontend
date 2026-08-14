import { axiosWithCreds, axiosWithoutCreds } from "./axiosInstances";

export const registerDeliveryPartnerApi = (data) =>
  axiosWithoutCreds.post("/api/delivery-partners/register", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });


export const getStats = () =>
  axiosWithCreds.get("/api/delivery-partners/stats");

export const getDeliveryPartners = () =>
  axiosWithCreds.get("/api/delivery-partners");

export const getDeliveryPartnerById = (partnerId) =>
  axiosWithCreds.get(`/api/delivery-partners/${partnerId}`);

export const updateDeliveryPartnerStatus = (partnerId, accountStatus) =>
  axiosWithCreds.patch(`/api/delivery-partners/${partnerId}/status`, {
    accountStatus,
  });
