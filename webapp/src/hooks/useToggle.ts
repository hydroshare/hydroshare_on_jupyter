import { useState } from "react";

export const useToggle = (
  initialState: boolean | (() => boolean)
): [boolean, () => void] => {
  const [state, setState] = useState(initialState);
  const setToggle = () => {
    setState((state) => !state);
  };

  return [state, setToggle];
};

export default useToggle;
