export const formatCreator = (value: string): string => {
  // assumes two naming conventions:
  // 1. John Smith -> John Smith
  // 2. Smith, John -> John Smith
  return value.split(", ").reverse().join(" ");
};
