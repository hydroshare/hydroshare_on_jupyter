import { Checkbox, Typography, Link, Paper } from "@material-ui/core";
import React, { useState, useEffect } from "react";
import { IResourceMetadata } from "../store/sync-api/interfaces";

export interface ResourceProps
  extends Pick<
    IResourceMetadata,
    | "resource_id"
    | "resource_title"
    | "date_created"
    | "date_last_updated"
    | "resource_url"
  > {}

export const Resource: React.FC<ResourceProps> = (props) => {
  const [isChecked, setIsChecked] = useState(false);
  const {
    resource_id,
    resource_title,
    date_created,
    date_last_updated,
    resource_url,
  } = props;

  const handleChecked = () => {
    setIsChecked(!isChecked);
  };

  useEffect(() => {
    console.log(props);
  }, []);

  return (
    <Paper id={resource_id}>
      <Checkbox onChange={handleChecked} checked={isChecked} />
      <Link href={resource_url} target="_blank" rel="noopener">
        <Typography>{resource_title}</Typography>
      </Link>
      <Typography>{date_created}</Typography>
      <Typography>{date_last_updated}</Typography>
    </Paper>
  );
};
