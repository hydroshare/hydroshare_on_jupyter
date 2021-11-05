export const toTitleCase = (s: string): string =>
  // make string title cased
  s.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1));

export default toTitleCase;
