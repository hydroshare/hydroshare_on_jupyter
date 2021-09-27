import * as React from "react";
import Markdown from "react-markdown";

import "../styles/ReadMeDisplay.scss";

interface IReadMeDisplayProps {
  localReadMe: string;
  resId: string;
}

interface IReadMeDisplayState {
  selectedReadMe: string;
}

/**
 * Component to display a readme if it exists in a user's resource
 */
export default class ReadMeDisplay extends React.Component<
  IReadMeDisplayProps,
  IReadMeDisplayState
> {
  state: IReadMeDisplayState = {
    selectedReadMe: "Workspace",
  };

  selectReadMe = (event: any) => {
    this.setState({ selectedReadMe: event?.currentTarget.textContent });
  };

  public render() {
    const resourceLink = `https://www.hydroshare.org/resource/${this.props.resId}/`;
    const workspaceClassName =
      this.state.selectedReadMe === "Workspace" ? " selected workspace" : "";
    const hydroShareClassName =
      this.state.selectedReadMe === "HydroShare" ? " selected hydroshare" : "";
    const readmes =
      this.state.selectedReadMe === "Workspace" ? (
        <div>
          <Markdown children={this.props.localReadMe} />
        </div>
      ) : (
        <div>
          <a href={resourceLink}>
            Click here to see the HydroShare resource page.
          </a>
        </div>
      );
    return (
      <div className="ReadMeDisplay content-row tile">
        <div className="top-row">
          <div className="title">README</div>
          <div className="location-selector">
            Display from
            <span
              className={"clickable selector" + workspaceClassName}
              onClick={(event) => this.selectReadMe(event)}
            >
              Workspace
            </span>
            <span
              className={"clickable selector" + hydroShareClassName}
              onClick={(event) => this.selectReadMe(event)}
            >
              HydroShare
            </span>
          </div>
        </div>
        <div>{readmes}</div>
      </div>
    );
  }
}
