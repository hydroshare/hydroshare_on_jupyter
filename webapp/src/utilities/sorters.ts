import { formatCreator } from "../utilities/formatCreator";

const simpleSort = <T>(a: T, b: T): number => {
  if (a === b) return 0;
  if (a < b) return -1;
  return 1;
};

export interface Sorter<T> {
  // negative if a < b
  // zero if a == b
  // positive if a > b
  sort: (a: T, b: T) => number;
}

/* Implemented Sorters */

export const NumberSorter: Sorter<number> = {
  sort: (a, b) => a - b,
};

export const StringSorter: Sorter<string> = {
  sort: (a, b) => {
    return simpleSort(a, b);
  },
};

export const CaseInsensitiveStringSorter: Sorter<string> = {
  sort: (a, b) => {
    return simpleSort(a.toLowerCase(), b.toLowerCase());
  },
};

export const DateSorter: Sorter<string | number | Date> = {
  sort: (a, b) => {
    const aDate = new Date(a);
    const bDate = new Date(b);
    return simpleSort(aDate, bDate);
  },
};

export const CaseInsensitiveCreatorSorter: Sorter<string> = {
  sort: (a, b) => {
    const l = a.toLowerCase();
    const r = b.toLowerCase();
    return simpleSort(formatCreator(l), formatCreator(r));
  },
};
