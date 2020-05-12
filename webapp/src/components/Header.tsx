import * as React from 'react';
import {connect} from 'react-redux';

import {
  goHome,
  loadInitData,
} from "../store/actions/App";
import {
  IRootState
} from '../store/types';
import {
  ThunkDispatch,
} from "redux-thunk";

// @ts-ignore
const ASSETS_URL = (window.FRONTEND_URL || '') + '/assets';

const mapStateToProps = ({ user }: IRootState) => {
  return {};
};

const mapDispatchToProps = (dispatch: ThunkDispatch<{}, {}, any>) => ({
  goHome: () => dispatch(goHome()),
  loadInitData: () => dispatch(loadInitData()),
});

type ReduxType = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

/**
 * Compnent that contains the logo and the return to all my resources button
 * Appears at the top of every page
 */
class Header extends React.Component<ReduxType, never> {

  public componentDidMount(): void {
    // TODO: Move this somewhere better
    this.props.loadInitData();
  }

  public render() {
    return (
      <header>
        <div className="header-content">
          {/*TODO: Host this image ourselves*/}
          <img
            src={ASSETS_URL + '/CUAHSI-logo-small.png'}
            alt="CUAHSI logo"
          />
          <div className="buttons-container">
            <button className="go-home clickable" onClick={this.props.goHome}>
              Back to all my Resources
            </button>
          </div>
        </div>
      </header>
    )
  }

}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Header);
