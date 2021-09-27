import { Checkbox, Typography, Paper } from "@material-ui/core";
import React, { useState } from "react";

interface IResourceGridHeaderProps {
  id?: string;
}

const DefaultResourceGridHeaderProps: IResourceGridHeaderProps = {
  id: "header",
};

export const ResourceGridHeader: React.FC<IResourceGridHeaderProps> = ({
  id,
} = DefaultResourceGridHeaderProps) => {
  const [isChecked, setIsChecked] = useState(false);

  const handleChecked = () => {
    setIsChecked(!isChecked);
  };

  return (
    <Paper id={id}>
      <Checkbox onChange={handleChecked} checked={isChecked} />
      <Typography>Title</Typography>
      <Typography>Date Create</Typography>
      <Typography>Date Last Modified</Typography>
    </Paper>
  );
};
