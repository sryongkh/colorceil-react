import axios from "axios";

const API_URL = "http://localhost:3000/";

async function register(email, password) {
  const response = await axios.post(API_URL + "user/register", {
    email,
    password,
  });
  return response.data;
}

async function login(email, password) {
  const response = await axios.post(API_URL + "login", {
    email,
    password,
  });
  if (response.data.accessToken) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
}

async function resetPassword(email) {
  const response = await axios.post(API_URL + "reset-password", {
    email,
  });
  return response.data;
}

export { register, login, resetPassword };
