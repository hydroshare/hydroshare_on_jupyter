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
import {
  logoutToHydroShare
} from '../store/async-actions';
// @ts-ignore
const ASSETS_URL = (window.FRONTEND_URL || '') + '/assets';

const mapStateToProps = ({ user }: IRootState) => {
  return {};
};

const mapDispatchToProps = (dispatch: ThunkDispatch<{}, {}, any>) => ({
  goHome: () => dispatch(goHome()),
  loadInitData: () => dispatch(loadInitData()),
  logout: () => dispatch(logoutToHydroShare())
});

type ReduxType = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

const elementPreferences = {
  options: [
   
   {id : 1, value : 'Preferences'},
   {id : 2, value : 'Change directory'},
   {id : 3, value : 'Update Config'},
   {id : 4, value : 'logout'}
 ] ,
 value : ''
 }

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
     if (e === '1') {
      console.log('yet to be defined')
     }
     else if (e == '2') {
       console.log('yet to be defined')
     }
     else if (e == '3'){
       console.log('wait, we are getting close!')
     }
     else {
      this.props.logout()
     }
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
            <select onChange={(event) => this.onClicking(event)}>{elementPreferences.options.map(option => (
              <option key = {option.id} value={option.id}>{option.value}</option>
              ))} </select>
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
