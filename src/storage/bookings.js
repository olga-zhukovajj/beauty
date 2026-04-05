export const getBookings = () => {
  return JSON.parse(localStorage.getItem("bookings")) || [];
};

export const saveBookings = (bookings) => {
  localStorage.setItem("bookings", JSON.stringify(bookings));
};

export const addBooking = (booking) => {
  const bookings = getBookings();
  bookings.push(booking);
  saveBookings(bookings);
};