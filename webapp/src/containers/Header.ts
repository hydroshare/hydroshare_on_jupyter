import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import {
  Header,
  IHeaderProps,
} from '../components/Header';
import { DemoActions } from '../store/types';

interface IReduxStore {
  user: {
    name: string,
  },
}

const mapStateToProps = (state: IReduxStore): IHeaderProps => ({
  userName: 'Kyle Combes',
});

const mapDispatchToProps = (dispatch: Dispatch<DemoActions>) => ({

});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Header);
