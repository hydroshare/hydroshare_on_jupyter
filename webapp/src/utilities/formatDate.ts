export const formatDate = (value: string): string => {
  /* Create Date object from string representation. 
  If provided date string representation is unparseable, throw Error.

  Return date string in format: "%b %e,%Y %I:%M %p" (i.e. Sep 10,2021 11:06 AM)
  See: date manual for format control details (https://man7.org/linux/man-pages/man1/date.1.html)
  */
  const parsedDate = new Date(value);

  if (isNaN(parsedDate.getDate())) {
    const errorMessage = `failed to format date: ${value}`;
    throw new Error(errorMessage);
  }

  const formattedTime = parsedDate.toLocaleString("en-US", {
    timeStyle: "short",
  });
  const formattedDate = parsedDate.toLocaleString("en-US", {
    dateStyle: "medium",
  });

  return `${formattedDate} ${formattedTime}`;
};
