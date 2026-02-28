const APPOINTMENTS_KEY = "appointments";

export const getAppointments = () => {
  return JSON.parse(localStorage.getItem(APPOINTMENTS_KEY)) || [];
};

export const saveAppointments = (appointments) => {
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
};

export const addAppointment = (appointment) => {
  const appointments = getAppointments();
  saveAppointments([...appointments, appointment]);
};

export const getAppointmentsForMasterByDate = (masterId, date) => {
  return getAppointments().filter(
    (a) => a.masterId === masterId && a.date === date
  );
};