import { axiosWithCreds,axiosWithoutCreds } from "./axiosInstances";

export const registerApi=(userData)=> axiosWithoutCreds.post("/api/auth/register",userData);

export const loginApi=(payload)=> axiosWithCreds.post("/api/auth/login",payload);

export const currentUserApi=()=> axiosWithCreds.get("/api/auth/me");

export const logoutApi=()=>axiosWithCreds.post("/api/auth/logout");

export const loginWithGoogle = async (id_token) =>
  axiosWithCreds.post("/api/auth/google-login", { id_token });