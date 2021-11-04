import React, { useContext, useState } from "react";
import { Toolbar, IconButton, makeStyles } from "@material-ui/core";
import RefreshRoundedIcon from "@material-ui/icons/RefreshRounded";
import ItemOrdering from "./ItemOrdering";
import FilterTypeMenu from "./FilterTypeMenu";
import { SorterContext } from "../contexts/SorterContext";

const useStyles = makeStyles({
  spacer: {
    flexGrow: 1,
  },
  refresh: {
    paddingLeft: "0px",
    paddingRight: "0px",
  },
  ordering: {
    paddingLeft: "0px",
    paddingRight: "0px",
  },
});

export const AppToolBar = () => {
  const {
    ordering,
    sortingColumn,
    columns,
    toggleOrdering,
    setSortingColumn,
  } = useContext(SorterContext);

  const classes = useStyles();

  return (
    <Toolbar>
      <div className={classes.spacer}></div>

      <FilterTypeMenu
        columns={columns}
        sortingColumn={sortingColumn}
        setSortingColumn={setSortingColumn}
      />

      <ItemOrdering
        title="Reverse sort direction"
        className={classes.ordering}
        ordering={ordering}
        toggleOrdering={toggleOrdering}
      />

      <IconButton title="Refresh Resources" className={classes.refresh}>
        {/* todo: implement onClick */}
        <RefreshRoundedIcon />
      </IconButton>
    </Toolbar>
  );
};
