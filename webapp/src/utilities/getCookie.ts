export const getCookiesAsObject = (): Object => {
  let cookies = "; " + document.cookie;
  // split cookies by `;` delimiter. First list element should be empty, thus drop it.
  let cookieList = cookies.split("; ").slice(1);
  return Object.fromEntries(cookieList.map((c) => c.split("=")));
};

export const getCookie = (cookie: string): string => {
  let cookieValue = getCookiesAsObject()[cookie];
  return cookieValue ? cookieValue : "";
};

export default getCookie;
