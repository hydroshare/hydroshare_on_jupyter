import { useState } from "react";
import { useOrdering } from "./useOrdering";
import { ColumnKeys, columns } from "../consts/columns";
import { SorterContext, ColumnIdAndLabel } from "../contexts/SorterContext";

export const useSorterContext = (): SorterContext<
  ColumnKeys,
  ColumnIdAndLabel
> => {
  // defaults:
  //  ordering: ascending
  //  sorting column: "resource_title"

  const cols = columns
    // extract id and label. use id as key and label as value
    .map(({ id, label }) => ({ [id]: label }))
    // spread [{[id]: label}...] to {[id]: label, ...}
    .reduce((x, xs) => ({ ...x, ...xs })) as ColumnIdAndLabel;

  const { ordering, toggleOrdering } = useOrdering();
  const [sortingColumn, setSortingColumn] = useState<keyof ColumnKeys>(
    "resource_title"
  );

  return {
    ordering,
    sortingColumn,
    columns: cols,
    toggleOrdering,
    setSortingColumn,
  };
};

export default useSorterContext;
