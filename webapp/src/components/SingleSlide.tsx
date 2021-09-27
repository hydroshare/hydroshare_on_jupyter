import React from "react";
import Slide, { SlideProps } from "@material-ui/core/Slide";

export const SingleSlide = (props: Omit<SlideProps, "children">) => {
  return <Slide {...props} />;
};

export default SingleSlide;
