import * as React from 'react';

export interface IHeaderProps {
  userName: string,
  userAvatarUrl?: string,
}

interface IState {
  test: string,
}

export class Header extends React.Component<IHeaderProps, IState> {

  public render() {
    return (
      <header>
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
      </header>
    )
  }

}