import React from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import AccountCircle from "@material-ui/icons/AccountCircle";
import { useLogoutMutation } from "../store/sync-api";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import * as actions from "../store/actions";
import CuahsiLogo from "../assets/logo";
import { useHistory } from "react-router";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    appBar: {
      flexGrow: 1,
    },
    cuahsiIcon: {
      marginRight: theme.spacing(2),
    },
    appBarTitle: {
      flexGrow: 1,
    },
  })
);

export default function ButtonAppBar() {
  const classes = useStyles();
  const auth = useAppSelector(({ login }) => login.status);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [logout] = useLogoutMutation();
  const dispatch = useAppDispatch();
  const history = useHistory();

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpenHydroShare = () => {
    handleClose();
    const hydroshare_url = "https://hydroshare.org/home";
    window.open(hydroshare_url, "_blank")?.focus();
  };

  const handleLogout = () => {
    handleClose();
    // logout logic
    // TODO: close websocket communication if open.
    // post logout request to backend REST api
    logout()
      .unwrap()
      .then((payload) => dispatch(actions.logout()));
  };

  const handleResourceClick = () => {
    // push user to home page
    history.push("/");
  };

  return (
    <div className={classes.appBar}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            className={classes.cuahsiIcon}
            color="inherit"
            aria-label="menu"
          >
            <a href="https://www.hydroshare.org" target="_blank">
              <CuahsiLogo.react height="1em" />
            </a>
          </IconButton>
          <Typography variant="h6" className={classes.appBarTitle}>
            HS Sync
          </Typography>
          <Button color="inherit" onClick={handleResourceClick}>
            Resources
          </Button>
          {auth && (
            <div>
              <IconButton
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleOpenHydroShare}>
                  Open HydroShare
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </div>
          )}
        </Toolbar>
      </AppBar>
    </div>
  );
}
