import * as React from "react";
import { connect } from "react-redux";

import { goHome, loadInitData, displayUserProfile } from "../store/actions/App";
import { IRootState } from "../store/types";
import { ThunkDispatch } from "redux-thunk";
import {
  logoutToHydroShare,
  getUserInfo,
  viewUserProfile,
} from "../store/async-actions";
import { UserInfoActions } from "../store/actions/action-names";
import * as UserActions from "../store/async-actions";
import ResourcePage from "../pages/ResourcePage";
// @ts-ignore
const ASSETS_URL = (window.FRONTEND_URL || "") + "/assets";

const mapStateToProps = ({ user }: IRootState) => {
  return {};
};

const mapDispatchToProps = (dispatch: ThunkDispatch<{}, {}, any>) => ({
  goHome: () => dispatch(goHome()),
  loadInitData: () => dispatch(loadInitData()),
  logout: () => dispatch(logoutToHydroShare()),
  viewProfile: () => dispatch(displayUserProfile()),
});

type ReduxType = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;
const elementPreferences = {
  options: [
    { id: 1, value: "Preferences" },
    { id: 2, value: "View Profile" },
    { id: 3, value: "logout" },
  ],
  value: "",
};

/**
 * Compnent that contains the logo and the return to all my resources button
 * Appears at the top of every page
 */
class Header extends React.Component<ReduxType, never> {
  public componentDidMount(): void {
    // TODO: Move this somewhere better
    this.props.loadInitData();
  }
  onClicking(event: React.ChangeEvent<HTMLSelectElement>) {
    console.log(event);
    const e = event.target.value;
    console.log(e);
    if (e === "1") {
      this.props.logout();
    } else if (e == "2") {
      this.props.viewProfile();
    } else {
      this.props.logout();
    }
  }

  public render() {
    return (
      <header>
        <div className="header-content">
          {/*TODO: Host this image ourselves*/}
          <img src={ASSETS_URL + "/CUAHSI-logo-small.png"} alt="CUAHSI logo" />
          <div className="buttons-container">
            <button className="go-home clickable" onClick={this.props.goHome}>
              Back to all my Resources
            </button>
            <select onChange={(event) => this.onClicking(event)}>
              {elementPreferences.options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.value}
                </option>
              ))}{" "}
            </select>
          </div>
        </div>
      </header>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Header);
