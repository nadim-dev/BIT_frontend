import { axiosWithCreds,axiosWithoutCreds } from "./axiosInstances";

export const registerApi=(userData)=> axiosWithoutCreds.post("/auth/register",userData);