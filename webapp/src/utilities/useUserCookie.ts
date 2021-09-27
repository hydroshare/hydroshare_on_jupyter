import { useState } from "react";
import getCookie from "./getCookie";

const initialState = null;

const useUserCookie = (cookieName: string) => {
  const [state, setState] = useState<string | null>(initialState);
  const cookie_value = getCookie(cookieName);

  if (cookie_value && cookie_value !== state) {
    // logout
  }
};
