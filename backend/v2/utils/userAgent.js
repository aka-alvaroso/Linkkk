const sanitizeUserAgent = (ua) => {
  if (!ua) return "Unknown";
  // Remove potentially dangerous characters
  return ua.replace(/[<>\"']/g, "").substring(0, 500);
};
