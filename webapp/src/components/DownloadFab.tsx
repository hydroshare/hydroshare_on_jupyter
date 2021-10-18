import { Fab, Theme } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import GetAppIcon from "@material-ui/icons/GetApp";
import React, { useState } from "react";
import useToggle from "../hooks/useToggle";

export interface DownloadFabProps {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  opacity?: number;
}

const defaultProps: DownloadFabProps = {
  opacity: 0.5,
};

const useStyles = makeStyles((theme: Theme) => ({
  fab: {
    position: "absolute",
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
}));

export const DownloadFab = (props: DownloadFabProps = defaultProps) => {
  const classes = useStyles();
  const [opacityState, toggleOpacityState] = useToggle(false);
  const { opacity, onClick } = props;

  return (
    <Fab
      className={classes.fab}
      color="primary"
      aria-label="download"
      size="medium"
      style={{ opacity: opacityState ? 1 : opacity }}
      onMouseOver={toggleOpacityState}
      onClick={onClick}
    >
      <GetAppIcon />
    </Fab>
  );
};
