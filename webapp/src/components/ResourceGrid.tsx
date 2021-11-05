import {
  Checkbox,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core";
import { makeStyles, Theme } from "@material-ui/core/styles";
import React, { useContext, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Column } from "../consts/columns";
import { SorterContext } from "../contexts/SorterContext";
import useArray from "../hooks/useArray";
import { ItemOrderingEnum } from "../hooks/useOrdering";
import { useListUserHydroShareResourcesQuery } from "../store/sync-api";
import { IResourceMetadata } from "../store/sync-api/interfaces";
import { ResourceId } from "../store/sync-api/types";
import downloadResourcesAndToastResults from "../utilities/downloadResourcesAndToastResults";
import { DownloadFab } from "./DownloadFab";
import { ColumnKeys } from "../consts/columns";
import { Sorter, CaseInsensitiveStringSorter } from "../utilities/sorters";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: "100%",
    height: "inherit",
    backgroundColor: theme.palette.background.paper,
  },
  container: {
    // will need to change if size of second application bar changes
    height: "calc(100% - 128px)", // 2 x 64px = height of application bar. Used to fit table in widget area. Likely "better" way to do this.
    overflowY: "scroll",
  },
}));

interface ResourceCheckbox extends IResourceMetadata {
  checked: boolean;
}

export interface ResourceGridProps {
  columns: Column[];
}

const sortResourceListingByColumnId = <T extends keyof ColumnKeys>(
  arr: ResourceCheckbox[],
  columnId: T,
  sorter: Sorter<T>,
  ordering?: ItemOrderingEnum
): ResourceCheckbox[] => {
  // NOTE: shallow copy, might not be desired depending on use
  let arrCpy = [...arr];

  // sort and reverse are both in place methods
  arrCpy.sort((a, b) =>
    sorter.sort(a[columnId as string], b[columnId as string])
  );

  if (ordering === ItemOrderingEnum.Descending) {
    arrCpy.reverse();
  }
  return arrCpy;
};

export const ResourceGrid = ({ columns }: ResourceGridProps) => {
  const classes = useStyles();
  const { data, isFetching } = useListUserHydroShareResourcesQuery();

  const { ordering, sortingColumn } = useContext(SorterContext);

  const selectKey = -1;

  const { array, set: setArray, update } = useArray<ResourceCheckbox>([]);
  const [allChecked, setAllChecked] = useState<boolean>(false);

  useMemo(() => {
    data
      ? setArray(
          // default sort columns ascending by resource_title
          sortResourceListingByColumnId(
            data.map((res) => ({
              ...res,
              checked: false,
            })),
            "resource_title",
            CaseInsensitiveStringSorter
          )
        )
      : setArray([]);
  }, [data]);

  useMemo(() => {
    if (array.length > 0) {
      // get sorter
      const { sorter } = columns.find(({ id }) => id === sortingColumn)!;

      // sort column
      setArray((arr) =>
        sortResourceListingByColumnId(arr, sortingColumn, sorter, ordering)
      );
    }
  }, [data, sortingColumn, ordering, columns]);

  const getCheckedResources = (): ResourceId[] => {
    // return a list of resource id's where checked is true.
    return array.flatMap(({ checked, resource_id }) =>
      checked ? resource_id : []
    );
  };

  return (
    <Paper className={classes.root}>
      {/* display download fab if one or more checkboxes is clicked. */}
      {array.some(({ checked }) => checked === true) && (
        <DownloadFab
          onClick={() => {
            const checkedResources = getCheckedResources();
            downloadResourcesAndToastResults(checkedResources);
          }}
        />
      )}
      <TableContainer className={classes.container}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell key={selectKey}>
                <Checkbox
                  onChange={() => {
                    setAllChecked((state) => {
                      const newState = !state;
                      // update all buttons with new state
                      setArray((arrayState) =>
                        arrayState.map((res) => ({
                          ...res,
                          checked: newState,
                        }))
                      );
                      return newState;
                    });
                  }}
                  checked={allChecked}
                />
              </TableCell>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isFetching ? (
              // display progress ring if fetching data
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  style={{ textAlign: "center" }}
                >
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : (
              // display resource table
              array?.map((row, index) => {
                // NOTE: this should probably be memoized
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                    <TableCell key={selectKey}>
                      <Checkbox
                        onChange={() => {
                          update(index, ({ checked, ...rest }) => ({
                            ...rest,
                            checked: !checked,
                          }));
                        }}
                        checked={(() => {
                          return array.length > 0
                            ? array[index].checked
                            : false;
                        })()}
                      />
                    </TableCell>
                    {columns.map((column) => {
                      // format value if format field specified in column definition
                      const value = column.format
                        ? column.format(row[column.id])
                        : row[column.id];

                      return (
                        <TableCell key={column.id} align={column.align}>
                          {column.link ? (
                            <RouterLink to={`/resources/${row.resource_id}`}>
                              {value}
                            </RouterLink>
                          ) : (
                            value
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};
