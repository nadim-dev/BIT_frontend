import { axiosWithCreds } from "./axiosInstances";

export const getNotifications = () =>
  axiosWithCreds.get("/api/notifications");

export const getUnreadNotificationCount = () =>
  axiosWithCreds.get("/api/notifications/unread-count");

export const readAllNotification=()=>
  axiosWithCreds.patch("/api/notifications/read-all")

