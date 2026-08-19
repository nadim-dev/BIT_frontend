import { axiosWithCreds } from "./axiosInstances";

export const getPendingDeliveryRequests=()=>
   axiosWithCreds.get("/api/delivery-requests/pending")

export const declineDeliveryRequest=(deliveryRequestId)=>
    axiosWithCreds.patch(`/api/delivery-requests/${deliveryRequestId}/decline`)

export const acceptDeliveryRequest=(deliveryRequestId)=>
   axiosWithCreds.patch(`/api/delivery-requests/${deliveryRequestId}/accept`)

