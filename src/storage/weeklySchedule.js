import { getMasters, saveMasters } from "./masters";

export const getWeeklySchedule = (masterId) => {
  const master = getMasters().find((m) => m.id === masterId);
  return master?.weeklySchedule || {};
};

export const saveWeeklySchedule = (masterId, schedule) => {
  const masters = getMasters();

  const updated = masters.map((m) =>
    m.id === masterId
      ? { ...m, weeklySchedule: schedule }
      : m
  );

  saveMasters(updated);
};