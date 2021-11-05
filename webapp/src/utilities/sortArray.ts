import { Sorter } from "./sorters";
import { O } from "./types/Object";

export function sortArray<K extends keyof T, T = O>(
  arr: T[],
  sortBy: K,
  sorter: Sorter<T[K]>
): T[] {
  const sorted = [...arr].sort((a, b) => sorter.sort(a[sortBy], b[sortBy]));
  return sorted;
}

export default sortArray;
