import api from "./axios";

export const getProfile = async (role, userId) => {
  const response = await api.get(`/profile/${role}/${userId}`);
  return response.data;
};

export const updateProfile = async (role, userId, profileData) => {
  const response = await api.patch(
    `/profile/${role}/${userId}`,
    profileData,
  );

  return response.data;
};
