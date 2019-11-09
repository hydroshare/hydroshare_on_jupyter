import * as React from 'react';
import {connect} from 'react-redux';
import { Dispatch } from 'redux';

import {
  AllActionTypes,
  IRootState
} from '../store/types';

const mapStateToProps = ({ user }: IRootState) => ({
  userName: user.name,
});

const mapDispatchToProps = (dispatch: Dispatch<AllActionTypes>) => ({

});

type ReduxType = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

class Header extends React.Component<ReduxType, never> {

  public render() {
    return (
      <header>
        <div className="header-content">
          {/*TODO: Host this image ourselves*/}
          <img
            src="https://cpb-us-e1.wpmucdn.com/blog.umd.edu/dist/8/416/files/2016/10/logo-20nca6f-300x69.png"
            alt="CUAHSI logo"
          />
          <button>
            View Files in Jupyter
          </button>
          <span className="welcome-message">
            Welcome, <span className="user-name">{this.props.userName}</span>
          </span>
        </div>
      </header>
    )
  }

}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Header);
