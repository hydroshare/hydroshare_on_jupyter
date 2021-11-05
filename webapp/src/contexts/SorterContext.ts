import { createContext } from "react";
import { ItemOrderingEnum } from "../hooks/useOrdering";
import { Records } from "../utilities/types/Object";
import { columns, Column, ColumnKeys } from "../consts/columns";

export interface ItemOrderState {
  ordering: ItemOrderingEnum;
  toggleOrdering: () => void;
}

export type ColumnIdAndLabel = Record<
  Pick<Column, "id">["id"],
  Pick<Column, "label">["label"]
>;

export interface OrderingState<T extends Records, U extends Records> {
  // U is subset of T
  sortingColumn: keyof T;
  setSortingColumn: React.Dispatch<React.SetStateAction<keyof T>>;
  columns: U;
}

export type SorterContext<
  T extends Records,
  U extends Records
> = ItemOrderState &
  // U is subset of T
  OrderingState<T, U>;

const DefaultSorterContext: SorterContext<ColumnKeys, ColumnIdAndLabel> = {
  ordering: ItemOrderingEnum.Ascending,
  sortingColumn: "resource_title", // ids
  columns: columns
    // extract id and label. use id as key and label as value
    .map(({ id, label }) => ({ [id]: label }))
    // spread [{[id]: label}...] to {[id]: label, ...}
    .reduce((x, xs) => ({ ...x, ...xs })) as ColumnIdAndLabel,
  setSortingColumn: () => "resource_title", // noop
  toggleOrdering: () => ItemOrderingEnum.Ascending, // noop
};

export const SorterContext = createContext<
  SorterContext<ColumnKeys, ColumnIdAndLabel>
>(DefaultSorterContext);
export default SorterContext;
