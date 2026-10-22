const API_BASE = (import.meta.env.VITE_API_BASE_URL || "/api/v1").replace(/\/$/, "");

function readableError(payload, status) {
  if (typeof payload === "string" && payload.trim()) return payload;
  if (payload?.detail) return payload.detail;
  if (payload && typeof payload === "object") {
    const first = Object.values(payload).flat().find((item) => typeof item === "string");
    if (first) return first;
  }
  return `تعذر إكمال الطلب (رمز ${status}).`;
}

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error("تعذر الاتصال بالخادم. تحقق من تشغيل الواجهة الخلفية وإعداد عنوانها.");
  }

  const text = await response.text();
  let payload = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }
  if (!response.ok) throw new Error(readableError(payload, response.status));
  return payload;
}

export async function getTasks({ status = "all", search = "", page = 1 } = {}) {
  const query = new URLSearchParams();
  if (status !== "all") query.set("status", status);
  if (search.trim()) query.set("search", search.trim());
  if (page > 1) query.set("page", String(page));
  const suffix = query.size ? `?${query.toString()}` : "";
  const payload = await request(`/tasks/${suffix}`);
  if (Array.isArray(payload)) return { results: payload, hasNext: false };
  return { results: payload?.results || [], hasNext: Boolean(payload?.next) };
}

export async function getAllTasks() {
  const results = [];
  let page = 1;
  let hasNext = true;
  while (hasNext) {
    const response = await getTasks({ page });
    results.push(...response.results);
    hasNext = response.hasNext;
    page += 1;
  }
  return results;
}

export function getCalendarTasks(month) {
  const query = new URLSearchParams({ month });
  return request(`/calendar/?${query.toString()}`);
}

export function getSummary() {
  return request("/summary/");
}

export function getFocusSessions() {
  return request("/focus-sessions/");
}

export function createFocusSession({ task_id, duration_minutes }) {
  return request("/focus-sessions/", {
    method: "POST",
    body: JSON.stringify({ task_id, duration_minutes }),
  });
}

export function createTask(values) {
  return request("/tasks/", { method: "POST", body: JSON.stringify(values) });
}

export function updateTask(id, values) {
  return request(`/tasks/${id}/`, { method: "PATCH", body: JSON.stringify(values) });
}

export function deleteTask(id) {
  return request(`/tasks/${id}/`, { method: "DELETE" });
}
