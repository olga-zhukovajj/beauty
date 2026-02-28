export const createMaster = (data) => {
  return {
    id: crypto.randomUUID(),
    name: data.name,
    email: data.email,
    password: data.password,
    phone: data.phone,
    role: data.role || "master",
    services: [],
    schedule: [],
    portfolio: []
  };
};
