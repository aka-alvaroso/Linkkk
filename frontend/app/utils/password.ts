export const generateRandomPassword = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  const length = 12;
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);

  return Array.from(array, (num) => chars[num % chars.length]).join("");
};
