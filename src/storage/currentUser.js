const CURRENT_USER_KEY = "currentUser";

export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
};

export const setCurrentUser = (user) => {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
};

export const logout = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};
