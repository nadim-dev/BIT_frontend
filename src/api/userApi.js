import { axiosWithCreds,axiosWithoutCreds } from "./axiosInstances";

export const registerApi=(userData)=> axiosWithoutCreds.post("/auth/register",userData);

export const loginApi=(payload)=> axiosWithCreds.post("/auth/login",payload);