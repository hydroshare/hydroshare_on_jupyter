export const resolveInput = <T>(input: T | (() => T)): T => {
  if (input instanceof Function) {
    return input();
  }
  return input;
};

export default resolveInput;
