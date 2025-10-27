// lib/auth.ts
import axios from "axios";

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://localhost:8000";

export async function getCurrentUser() {
  try {
    const response = await axios.get("/api/v1/auth/me");
    return response.data;
  } catch (error) {
    console.error("Auth check failed:", error);
    return null;
  }
}

export async function logout() {
  try {
    // Call backend logout endpoint if you have one
    await axios.post("/api/v1/auth/logout");
  } catch (error) {
    console.error("Logout error:", error);
  }
  // Redirect to signin
  window.location.href = "/signin";
}