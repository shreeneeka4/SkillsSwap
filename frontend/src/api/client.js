const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch (err) {
    // Network-level failure (backend down, wrong URL, CORS, etc.)
    throw new Error(
      "Could not reach the SkillSwap server. Make sure the backend is running and VITE_API_URL is correct."
    );
  }

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const message = data?.message || `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return data;
}

export const api = {
  // Users
  getUsers: () => request("/users"),
  getUser: (id) => request(`/users/${id}`),
  createUser: (payload) => request("/users", { method: "POST", body: JSON.stringify(payload) }),
  updateUser: (id, payload) =>
    request(`/users/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  getUserStats: (id) => request(`/users/${id}/stats`),

  // Skills
  getSkills: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== "")
    ).toString();
    return request(`/skills${query ? `?${query}` : ""}`);
  },
  getSkill: (id) => request(`/skills/${id}`),
  getSkillMeta: () => request("/skills/meta/categories"),
  createSkill: (payload) => request("/skills", { method: "POST", body: JSON.stringify(payload) }),
  updateSkill: (id, payload) =>
    request(`/skills/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteSkill: (id) => request(`/skills/${id}`, { method: "DELETE" }),

  // Requests
  getRequests: (userId, role) =>
    request(`/requests?user=${userId}${role ? `&role=${role}` : ""}`),
  sendRequest: (payload) => request("/requests", { method: "POST", body: JSON.stringify(payload) }),
  updateRequestStatus: (id, status) =>
    request(`/requests/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  deleteRequest: (id) => request(`/requests/${id}`, { method: "DELETE" }),
};
