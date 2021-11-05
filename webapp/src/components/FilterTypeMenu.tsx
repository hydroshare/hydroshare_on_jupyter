import React, { useState } from "react";
import { IconButton, IconButtonProps, Menu, MenuItem } from "@material-ui/core";
import { ColumnIdAndLabel, OrderingState } from "../contexts/SorterContext";
import { ColumnKeys } from "../consts/columns";

export type FilterTypeMenuProps = OrderingState<ColumnKeys, ColumnIdAndLabel>;

export const FilterTypeMenu = (
  props: FilterTypeMenuProps & IconButtonProps
) => {
  const {
    columns,
    sortingColumn,
    setSortingColumn,
    ...iconButtonProps
  } = props;

  const [menuRef, setMenuRef] = useState<null | HTMLElement>(null);

  const handleOpeningMenu = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setMenuRef(e.currentTarget);
  };
  const handleClosingMenu = () => {
    setMenuRef(null);
  };

  const handleMenuItemClick = (item: keyof ColumnKeys) => {
    handleClosingMenu();
    setSortingColumn(item);
  };

  return (
    <>
      <IconButton {...iconButtonProps} onClick={handleOpeningMenu}>
        <MenuItem>{columns[sortingColumn]}</MenuItem>
      </IconButton>
      <Menu
        open={Boolean(menuRef)}
        // keepMounted
        onClose={handleClosingMenu}
        anchorEl={menuRef}
      >
        {/* use keys (id's) of columns */}
        {Object.entries(columns).map(([k, v]) => (
          <MenuItem onClick={() => handleMenuItemClick(k as keyof ColumnKeys)}>
            {v}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default FilterTypeMenu;
