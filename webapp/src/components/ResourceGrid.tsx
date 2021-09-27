import React from "react";
import Paper from "@material-ui/core/Paper";
import { Checkbox, CircularProgress } from "@material-ui/core";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { useListUserHydroShareResourcesQuery } from "../store/sync-api";
import { Switch, Route, Link as RouterLink } from "react-router-dom";
import { ResourcePage } from "./ResourcePage";

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

const formatCreator = (value: string): string => {
  // assumes two naming conventions:
  // 1. John Smith -> John Smith
  // 2. Smith, John -> John Smith
  return value.split(", ").reverse().join(" ");
};

interface Column {
  id: "resource_title" | "creator" | "date_created" | "date_last_updated";
  label: string;
  minWidth?: number;
  align?: "right";
  format?: <T>(value: T) => T;
  link?: boolean;
}

const columns: Column[] = [
  { id: "resource_title", label: "Title", minWidth: 170, link: true },
  {
    id: "creator",
    label: "Creator",
    minWidth: 170,
    format: formatCreator,
  },
  {
    id: "date_created",
    label: "Date Created",
    minWidth: 170,
    format: formatDate,
  },
  {
    id: "date_last_updated",
    label: "Date Last Modified",
    minWidth: 170,
    format: formatDate,
  },
];

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: "100%",
    height: "inherit",
    backgroundColor: theme.palette.background.paper,
  },
  container: {
    height: "inherit",
    overflowY: "scroll",
  },
}));

export const ResourceGrid: React.FC = () => {
  const classes = useStyles();
  const { data, isFetching } = useListUserHydroShareResourcesQuery();
  const selectKey = -1;

  console.log(data);

  return (
    <Paper className={classes.root}>
      <TableContainer className={classes.container}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell key={selectKey}>
                <Checkbox />
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
              data?.map((row, index) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                    <TableCell key={selectKey}>
                      <Checkbox />
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
