import React from "react";
import { IconButton, IconButtonProps } from "@material-ui/core";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import { ItemOrderingEnum } from "../hooks/useOrdering";

export interface ItemOrderingProps {
  ordering: ItemOrderingEnum;
  toggleOrdering: () => void;
}

export const ItemOrdering = (props: ItemOrderingProps & IconButtonProps) => {
  const { ordering, toggleOrdering, ...iconButtonProps } = props;

  return (
    <IconButton {...iconButtonProps} onClick={toggleOrdering}>
      {ordering === ItemOrderingEnum.Ascending ? (
        <ArrowUpwardIcon />
      ) : (
        <ArrowDownwardIcon />
      )}
    </IconButton>
  );
};

export default ItemOrdering;
