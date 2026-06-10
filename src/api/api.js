const API_URL = "http://localhost:5000/api";

// ===== Пользователи / Мастера =====
export async function getMasters(token) {
  const res = await fetch(`${API_URL}/masters`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Ошибка при получении мастеров");
  return res.json();
}

export async function getMasterById(id, token) {
  const res = await fetch(`${API_URL}/masters/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Мастер не найден");
  return res.json();
}

// ===== Auth =====
export async function registerUser(data) {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message);
  return result;
}

export async function loginUser(data) {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message);
  return result;
}

// ===== Услуги =====
export async function getServices(masterId, token) {
  const res = await fetch(`${API_URL}/masters/${masterId}/services`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Ошибка при получении услуг");
  return res.json();
}

export async function addService(masterId, data, token) {
  const res = await fetch(`${API_URL}/masters/${masterId}/services`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Ошибка при добавлении услуги");
  return res.json();
}

export async function removeService(masterId, serviceId, token) {
  const res = await fetch(
    `${API_URL}/masters/${masterId}/services/${serviceId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!res.ok) throw new Error("Ошибка при удалении услуги");
  return res.json();
}

// ===== Расписание =====
export async function getSchedule(masterId, token) {
  const res = await fetch(`${API_URL}/masters/${masterId}/schedule`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Ошибка при получении расписания");
  return res.json();
}

export async function saveSchedule(masterId, schedule, token) {
  const res = await fetch(`${API_URL}/masters/${masterId}/schedule`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(schedule),
  });
  if (!res.ok) throw new Error("Ошибка при сохранении расписания");
  return res.json();
}


export async function getAvailableSlots(masterId, date, duration = 60) {
  const res = await fetch(
    `${API_URL}/masters/${masterId}/available-slots?date=${date}&duration=${duration}`
  );

  if (!res.ok) throw new Error("Ошибка получения слотов");

  return res.json();
}


export async function createAppointment(data) {
  const payload = {
    master_id: data.masterId,
    services: data.services,
    appointment_date: data.date,
    start_time: data.time,
    client_id: data.clientId,
    client_name: data.clientName,
    client_comment: data.clientComment
  };
  console.log("SEND:", payload);

  const response = await fetch("http://localhost:5000/api/appointments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Ошибка создания записи");
  }

  return response.json();
}

export async function getMasterAppointments(masterId) {

  const response = await fetch(
    `http://localhost:5000/api/masters/${masterId}/appointments`
  );

  if (!response.ok) {
    throw new Error("Ошибка получения записей");
  }

  return response.json();
}

export async function getAppointmentsByDate(masterId, date) {
  const res = await fetch(
    `${API_URL}/masters/${masterId}/appointments-by-date?date=${date}`
  );

  if (!res.ok) throw new Error("Ошибка получения расписания");

  return res.json();
}

export async function completeAppointment(id) {

  const response = await fetch(
    `http://localhost:5000/api/appointments/${id}/complete`,
    {
      method: "PATCH"
    }
  );

  if (!response.ok) {
    throw new Error("Ошибка обновления статуса");
  }

  return response.json();
}

export async function getPortfolio(masterId) {
  const res = await fetch(`http://localhost:5000/api/portfolio/${masterId}`);
  return res.json();
}

export async function addPortfolio(masterId, file) {

  const formData = new FormData();
  formData.append("masterId", masterId);
  formData.append("image", file);

  const res = await fetch("http://localhost:5000/api/portfolio", {
    method: "POST",
    body: formData
  });

  return res.json();
}

export async function deletePortfolio(id) {
  await fetch(`http://localhost:5000/api/portfolio/${id}`, {
    method: "DELETE"
  });
}