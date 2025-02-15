import axios from "axios";

const API_URL = "http://localhost:5000/api/users";

export const getUsers = async (search = "", page = 1, limit = 10) => {
  const { data } = await axios.get(`${API_URL}?search=${search}&page=${page}&limit=${limit}`);
  return data;
};

export const createUser = async (user: any) => {
  const { data } = await axios.post(API_URL, user);
  return data;
};

export const updateUser = async (id: string, user: any) => {
  const { data } = await axios.put(`${API_URL}/${id}`, user);
  return data;
};

export const deleteUser = async (id: string) => {
  await axios.delete(`${API_URL}/${id}`);
};
