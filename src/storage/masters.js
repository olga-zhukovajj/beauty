const MASTER_KEY = "masters";
const APPOINTMENT_KEY = "appointments";

export const getMasters = () => {
  return JSON.parse(localStorage.getItem(MASTER_KEY)) || [];
};

export const saveMasters = (masters) => {
  localStorage.setItem(MASTER_KEY, JSON.stringify(masters));
};

export const getAppointments = () => {
  return JSON.parse(localStorage.getItem(APPOINTMENT_KEY)) || [];
};

export const saveAppointments = (appointments) => {
  localStorage.setItem(APPOINTMENT_KEY, JSON.stringify(appointments));
};
