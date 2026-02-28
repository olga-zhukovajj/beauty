export const createService = (data) => {
  return {
    id: crypto.randomUUID(),
    title: data.title,
    duration: data.duration, // минуты
    price: data.price
  };
};
