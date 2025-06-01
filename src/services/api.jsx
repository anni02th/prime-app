import axios from "axios"

// Create axios instance with base URL
const API_URL = "http://localhost:5000"
// const API_URL = "https://prime-rpu9.onrender.com"
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error("API Error:", error.response?.data || error.message)
    return Promise.reject(error)
  },
)

// Student API functions
export const studentApi = {
  getAll: () => api.get("/api/students"),
  getById: (id) => api.get(`/api/students/${id}`),
  create: (data) => api.post("/api/students", data),
  update: (id, data) => api.put(`/api/students/${id}`, data),
  delete: (id) => api.delete(`/api/students/${id}`),
  getApplications: (id) => api.get(`/api/students/${id}/applications`),
  getDocuments: (id) => api.get(`/api/students/${id}/documents`),
}

// Application API functions
export const applicationApi = {
  getAll: () => api.get("/api/applications"),
  getById: (id) => api.get(`/api/applications/${id}`),
  create: (data) => api.post("/api/applications", data),
  update: (id, data) => api.put(`/api/applications/${id}`, data),
  delete: (id) => api.delete(`/api/applications/${id}`),
  payFee: (id) => api.post(`/api/applications/${id}/pay-fee`),
}

// Document API functions
export const documentApi = {
  getAll: () => api.get("/api/documents"),
  getById: (id) => api.get(`/api/documents/${id}`),
  upload: (data) => {
    const formData = new FormData()
    formData.append("file", data.file)
    formData.append("studentId", data.studentId)
    formData.append("type", data.type)

    return api.post("/api/documents/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  },
  delete: (id) => api.delete(`/api/documents/${id}`),
}

// Chat API functions
export const chatApi = {
  getAll: () => api.get("/api/chats"),
  getById: (id) => api.get(`/api/chats/${id}`),
  create: (data) => api.post("/api/chats", data),
  getMessages: (chatId) => api.get(`/api/chats/${chatId}/messages`),
  sendMessage: (chatId, data) => api.post(`/api/chats/${chatId}/messages`, data),
}

// User API functions
export const userApi = {
  getProfile: () => api.get("/api/users/profile"),
  updateProfile: (data) => api.put("/api/users/profile", data),
  uploadAvatar: (file) => {
    const formData = new FormData()
    formData.append("avatar", file)
    return api.post("/api/users/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  },
  getSettings: () => api.get("/api/users/settings"),
  updateSettings: (data) => api.put("/api/users/settings", data),
  changePassword: (data) => api.put("/api/users/change-password", data),
}
