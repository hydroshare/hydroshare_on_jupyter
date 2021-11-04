import { SetStateAction, useState } from "react";

export default function useArray<T>(defaultValue: T[]) {
  type L = T[];

  const [array, setArray] = useState<L>(defaultValue);

  function push(element: T) {
    setArray((a) => [...a, element]);
  }

  function filter(
    callback: (value: T, index?: number, array?: T[]) => boolean
  ) {
    setArray((a) => a.filter(callback));
  }

  function update(index: number, value: SetStateAction<T>): void {
    setArray((state) => {
      // get value at index
      const currentValue = state.at(index);

      // fail early if invalid index
      if (currentValue === undefined) {
        console.error("Index not found.");
        return state;
      }

      value = value instanceof Function ? value(currentValue) : value;
      return [
        ...state.slice(0, index),
        value,
        ...state.slice(index + 1, state.length),
      ];
    });
  }

  function remove(index: number) {
    setArray((a) => [...a.slice(0, index), ...a.slice(index + 1, a.length)]);
  }

  function clear() {
    setArray([]);
  }

  function useIndex(
    index: number
  ): [T | undefined, (value: SetStateAction<T>) => void] {
    function setArrayIndex(value: SetStateAction<T>): void {
      update(index, value);
    }

    return [array.at(index), setArrayIndex];
  }

  return {
    array,
    set: setArray,
    push,
    useItem: useIndex,
    filter,
    update,
    remove,
    clear,
  };
}
