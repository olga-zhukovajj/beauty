import { getWeeklySchedule } from "../storage/weeklySchedule";
import { getAppointmentsForMasterByDate } from "../storage/appointments";

const timeToMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const minutesToTime = (minutes) => {
  const h = String(Math.floor(minutes / 60)).padStart(2, "0");
  const m = String(minutes % 60).padStart(2, "0");
  return `${h}:${m}`;
};

export const getAvailableSlots = (
  masterId,
  date,
  serviceDuration
) => {
  const dayOfWeek = new Date(date).getDay();
  const weeklySchedule = getWeeklySchedule(masterId);

  const daySchedule = weeklySchedule[dayOfWeek];

  if (!daySchedule) return [];

  const startMinutes = timeToMinutes(daySchedule.start);
  const endMinutes = timeToMinutes(daySchedule.end);

  const appointments = getAppointmentsForMasterByDate(masterId, date);

  const slots = [];

  for (
    let time = startMinutes;
    time + serviceDuration <= endMinutes;
    time += 30
  ) {
    const slotStart = time;
    const slotEnd = time + serviceDuration;

    const isBusy = appointments.some((a) => {
      const aStart = timeToMinutes(a.startTime);
      const aEnd = timeToMinutes(a.endTime);

      return slotStart < aEnd && slotEnd > aStart;
    });

    if (!isBusy) {
      slots.push({
        start: minutesToTime(slotStart),
        end: minutesToTime(slotEnd),
      });
    }
  }

  return slots;
};