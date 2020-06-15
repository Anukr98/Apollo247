import React, { useRef } from "react";
import { makeStyles } from "@material-ui/styles";
import { Theme, CircularProgress } from "@material-ui/core";
import { Link } from "react-router-dom";
import Popover from "@material-ui/core/Popover";
import Paper from "@material-ui/core/Paper";
import { SignIn } from "components/SignIn";
import { ProtectedWithLoginPopup } from "components/ProtectedWithLoginPopup";
import { locationRoutesBlackList } from "helpers/commonHelpers";

import { useLoginPopupState, useAuth } from "hooks/authHooks";

const useStyles = makeStyles((theme: Theme) => {
  return {
    header: {
      display: "flex",
      alignItems: "center",
      boxShadow: "0 2px 10px 0 rgba(0, 0, 0, 0.1)",
      backgroundColor: theme.palette.common.white,
      padding: "0 0 0 20px",
      [theme.breakpoints.down("xs")]: {
        padding: "0 0 0 20px",
      },
      [theme.breakpoints.down(900)]: {
        paddingRight: 0,
      },
    },
    headerSticky: {
      position: "fixed",
      width: "100%",
      zIndex: 99,
      top: 0,
    },
    container: {
      maxWidth: 1064,
      margin: "auto",
    },
    logo: {
      paddingTop: 20,
      paddingBottom: 11,
      [theme.breakpoints.down("xs")]: {
        paddingTop: 12,
        paddingBottom: 9,
      },
      "& a": {
        display: "block",
      },
      "& img": {
        maxWidth: 77,
        verticalAlign: "middle",
        [theme.breakpoints.down("xs")]: {
          maxWidth: 67,
        },
      },
    },
    userAccount: {
      padding: "20px 16px",
      position: "relative",
      [theme.breakpoints.down("xs")]: {
        marginLeft: "auto",
        padding: 16,
      },
    },
    userAccountActive: {
      backgroundColor: "#f7f8f5",
      "&:after": {
        position: "absolute",
        content: '""',
        bottom: 0,
        left: 0,
        height: 5,
        width: "100%",
        backgroundColor: "#00b38e",
      },
    },
    userAccountLogin: {
      display: "flex",
      alignItems: "center",
    },
    userCircle: {
      display: "flex",
      width: 48,
      height: 48,
      backgroundColor: "#afc3c9",
      borderRadius: "50%",
      textAlign: "center",
      cursor: "pointer",
      alignItems: "center",
      justifyContent: "center",
      [theme.breakpoints.down("xs")]: {
        width: 40,
        height: 40,
      },
    },
    userActive: {
      backgroundColor: theme.palette.secondary.dark,
    },
    loginForm: {
      width: 280,
      padding: 20,
      borderRadius: 10,
      boxShadow: "0 5px 40px 0 rgba(0, 0, 0, 0.3)",
      backgroundColor: theme.palette.common.white,
    },
    topPopover: {
      overflow: "initial",
      backgroundColor: "none",
      boxShadow: "none",
    },
    logoutModal: {
      padding: "12px 0",
      "& h3": {
        fontSize: 18,
        fontWeight: 500,
        margin: 0,
      },
    },
    bottomActions: {
      textAlign: "right",
      paddingTop: 20,
      "& button": {
        marginLeft: 15,
      },
    },
    headerRightGroup: {
      display: "flex",
      alignItems: "center",
    },
    appLogin: {
      marginLeft: 0,
    },
    appDownloadBtn: {
      paddingLeft: 20,
      paddingRight: 20,
      textAlign: "center",
      "& a": {
        backgroundColor: "#fcb716",
        boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.2)",
        borderRadius: 5,
        color: "#fff",
        fontSize: 13,
        fontWeight: "bold",
        padding: "4px 12px",
        display: "block",
      },
    },
    preAppLogin: {
      paddingRight: 0,
    },
    loginLinks: {
      color: "#02475b",
      fontSize: 13,
      fontWeight: "bold",
      paddingRight: 10,
      cursor: "pointer",
      [theme.breakpoints.down(520)]: {
        display: "none",
      },
    },
    hideVisibility: {
      visibility: "hidden",
    },
  };
});

export const Header: React.FC = (props) => {
  const classes = useStyles({});
  const avatarRef = useRef(null);
  const { isSigningIn, isSignedIn, setVerifyOtpError } = useAuth();
  const { isLoginPopupVisible, setIsLoginPopupVisible } = useLoginPopupState();
  const [mobileNumber, setMobileNumber] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const currentPath = window.location.pathname;
  const isMobileView = screen.width <= 768;

  const checkIfDisabled = () => {
    const x = locationRoutesBlackList.some((v) => {
      return currentPath.indexOf(v) > -1;
    });
    return !x;
  };
  return (
    <div className={classes.headerSticky}>
      <div className={classes.container}>
        <header className={classes.header} data-cypress="Header">
          <div className={classes.logo}>
            <Link to="/">
              <img
                src={require("images/ic_logo.png")}
                title={"Open the home page"}
              />
            </Link>
          </div>
          <div
            className={`${classes.headerRightGroup} ${
              isSignedIn ? classes.appLogin : ""
            }`}
          >
            <div
              className={`${classes.userAccount} ${
                isSignedIn ? "" : classes.userAccountLogin
              }`}
            >
              {isSignedIn ? (
                <Link
                  className={`${classes.userCircle} ${
                    isSignedIn ? classes.userActive : ""
                  }`}
                  to={""}
                  title={"Control profile"}
                >
                  {isSigningIn ? (
                    <CircularProgress />
                  ) : (
                    <img src={require("images/ic_account.svg")} />
                  )}
                </Link>
              ) : (
                <ProtectedWithLoginPopup>
                  {({ protectWithLoginPopup }) => (
                    <>
                      {/* <div
                        onClick={() => {
                          isSignedIn ? clientRoutes.medicinesCart() : protectWithLoginPopup();
                        }}
                        className={classes.loginLinks}
                        title={'Login/SignUp'}
                      >
                        Login/SignUp
                      </div> */}
                      <div
                        id="loginPopup"
                        className={`${classes.userCircle} ${classes.userActive}`}
                        onClick={() =>
                          isSignedIn ? "" : protectWithLoginPopup()
                        }
                        ref={avatarRef}
                        title={"Login/SignUp"}
                      >
                        {isSigningIn ? (
                          <CircularProgress />
                        ) : (
                          <img
                            src={require("images/ic_account.svg")}
                            title={"Login/SignUp"}
                          />
                        )}
                      </div>
                    </>
                  )}
                </ProtectedWithLoginPopup>
              )}
              {isSignedIn ? (
                ""
              ) : (
                <Popover
                  open={isLoginPopupVisible}
                  anchorEl={avatarRef.current}
                  onClose={() => {
                    const otpAfterCleaning = otp.replace(/,/g, "");
                    if (
                      mobileNumber.length === 0 ||
                      (mobileNumber.length === 10 &&
                        otpAfterCleaning.length === 0) ||
                      otpAfterCleaning.length === 6
                    ) {
                      setIsLoginPopupVisible(false);
                      setVerifyOtpError(false);
                    }
                  }}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  classes={{ paper: classes.topPopover }}
                >
                  <Paper className={classes.loginForm}>
                    <SignIn
                      setMobileNumber={(mobileNumber: string) =>
                        setMobileNumber(mobileNumber)
                      }
                      setOtp={(otp: string) => setOtp(otp)}
                      mobileNumber={mobileNumber}
                      otp={otp}
                    />
                  </Paper>
                </Popover>
              )}
            </div>
          </div>
        </header>
      </div>
    </div>
  );
};