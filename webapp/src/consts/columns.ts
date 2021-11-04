import {
  DateSorter,
  CaseInsensitiveStringSorter,
  CaseInsensitiveCreatorSorter,
} from "../utilities/sorters";
import { formatDate } from "../utilities/formatDate";
import { IResourceMetadata } from "../store/sync-api/interfaces";
import { Sorter } from "../utilities/sorters";
import { formatCreator } from "../utilities/formatCreator";

export type ColumnKeys = Pick<
  IResourceMetadata,
  "resource_title" | "creator" | "date_created" | "date_last_updated"
>;

export interface Column {
  id: keyof ColumnKeys;
  label: string;
  sorter: Sorter<keyof ColumnKeys>;
  minWidth: number;
  align?: "right";
  format?: <T>(value: T) => T;
  link?: boolean;
}

export const columns: Column[] = [
  {
    id: "resource_title",
    label: "Title",
    sorter: CaseInsensitiveStringSorter,
    minWidth: 170,
    link: true,
  },
  {
    id: "creator",
    label: "Creator",
    sorter: CaseInsensitiveCreatorSorter,
    minWidth: 170,
    format: formatCreator,
  },
  {
    id: "date_created",
    label: "Date Created",
    sorter: DateSorter,
    minWidth: 170,
    format: formatDate,
  },
  {
    id: "date_last_updated",
    label: "Date Last Modified",
    sorter: DateSorter,
    minWidth: 170,
    format: formatDate,
  },
];
