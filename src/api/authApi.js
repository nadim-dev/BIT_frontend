import { axiosWithCreds,axiosWithoutCreds } from "./axiosInstances";

export const registerApi=(userData)=> axiosWithoutCreds.post("/api/auth/register",userData);

export const loginApi=(payload)=> axiosWithCreds.post("/api/auth/login",payload);

export const currentUserApi=()=> axiosWithCreds.get("/api/auth/me");

export const updateProfileApi=(profileData)=> axiosWithCreds.patch("/api/auth/profile",profileData);

export const updateProfilePictureApi=(file)=> {
  const formData = new FormData();
  formData.append("picture", file);

  return axiosWithCreds.patch("/api/auth/profile-picture", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const updatePasswordApi=(passwordData)=> axiosWithCreds.patch("/api/auth/password",passwordData);

export const deleteAccountApi=()=> axiosWithCreds.delete("/api/auth/account");

export const logoutApi=()=>axiosWithCreds.post("/api/auth/logout");

export const loginWithGoogle = async (id_token) =>
  axiosWithCreds.post("/api/auth/google-login", { id_token });
