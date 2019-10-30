import { connect } from 'react-redux';
import App from '../App';
import {

} from '../redux/actions';

const mapStateToProps = (state, containerProps) => {
  return {
    loaded: state.general.loaded,
  }
};

const mapDispatchToProps = dispatch => {
  return {

  }
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(App);
