export const createSchedule = ({ date, startTime, endTime, breaks = [] }) => {
  return {
    id: crypto.randomUUID(),
    date,       // "2026-02-15"
    startTime,  // "09:00"
    endTime,    // "18:00"
    breaks      // [{start: "13:00", end: "14:00"}]
  };
};
