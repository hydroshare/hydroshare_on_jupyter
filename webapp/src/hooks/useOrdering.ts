import { useState } from "react";

export enum ItemOrderingEnum {
  Ascending,
  Descending,
}

export const useOrdering = () => {
  const [ordering, setOrdering] = useState<ItemOrderingEnum>(
    ItemOrderingEnum.Ascending
  );

  const toggleOrdering = () => {
    setOrdering((currentOrder) =>
      currentOrder === ItemOrderingEnum.Ascending
        ? ItemOrderingEnum.Descending
        : ItemOrderingEnum.Ascending
    );
  };

  return { ordering, toggleOrdering };
};

export default useOrdering;
