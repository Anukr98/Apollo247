import { Theme, Drawer, createMuiTheme } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { makeStyles, ThemeProvider } from '@material-ui/styles';
import React from 'react';
import { clientRoutes } from 'helpers/clientRoutes';
import { useAuth } from 'hooks/authHooks';
import { AphButton } from '@aph/web-ui-components';
import MenuIcon from '@material-ui/icons/Menu';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      padding: 0,
    },
    userProfile: {
      width: '100%',
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#f7f8f5',
        boxShadow: '0 15px 20px 0 rgba(0, 0, 0, 0.1)',
        height: '100%',
      },
    },
    profileServices: {
      paddingTop: 5,
      paddingRight: 5,
      [theme.breakpoints.down('xs')]: {
        padding: 15,
        paddingTop: 95,
      },
    },
    servicesSection: {
      paddingRight: 15,
      paddingBottom: 5,
      [theme.breakpoints.down('xs')]: {
        paddingRight: 5,
        paddingBottom: 0,
      },
    },
    sectionGroup: {
      marginBottom: 10,
      paddingLeft: 5,
    },
    serviceType: {
      backgroundColor: '#fff',
      boxShadow: '0 2px 4px 0 rgba(128, 128, 128, 0.3)',
      border: '1px solid #fff',
      borderRadius: 10,
      padding: 10,
      paddingbottom: 8,
      display: 'flex',
      width: '100%',
      height: '100%',
      color: '#02475b',
      fontSize: 14,
      fontWeight: 500,
      cursor: 'pointer',
    },
    menuActive: {
      border: '1px solid #00b38e',
    },
    serviceImg: {
      marginRight: 10,
      '& img': {
        maxWidth: 49,
        verticalAlign: 'middle',
      },
    },
    serviceIcon: {
      marginRight: 10,
      '& img': {
        maxWidth: 24,
        verticalAlign: 'middle',
      },
    },
    rightArrow: {
      width: 24,
      marginLeft: 'auto',
    },
    linkText: {
      letterSpacing: 'normal',
      paddingRight: 10,
    },
    textVCenter: {
      alignItems: 'center',
      minHeight: 54,
      paddingbottom: 10,
    },
    desktopVisible: {
      display: 'none',
      [theme.breakpoints.up(768)]: {
        display: 'block',
      },
    },
    mobileVisible: {
      display: 'block',
      [theme.breakpoints.up(768)]: {
        display: 'none',
      },
    },
    menuToggleBtn: {
      backgroundColor: '#fff',
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      position: 'fixed',
      display: 'flex',
      width: '100%',
      zIndex: 2,
      top: 74,
      '& button': {
        boxShadow: 'none',
        padding: '10px 16px',
        minWidth: 'auto',
        borderRadius: 0,
      },
      [theme.breakpoints.up(768)]: {
        display: 'none',
      },
    },
    pageTitle: {
      textTransform: 'uppercase',
      flexGrow: 1,
      textAlign: 'center',
      marginLeft: -56,
      color: '#01475b',
      fontWeight: 500,
      lineHeight: '56px',
    },
  };
});

const defaultMaterialTheme = createMuiTheme({
  zIndex: {
    drawer: 9,
    modal: 9,
  },
});

export const MyProfile: React.FC = (props) => {
  const classes = useStyles({});
  const currentPath = window.location.pathname;
  const { signOut } = useAuth();
  const [state, setState] = React.useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  });

  type DrawerSide = 'top' | 'left' | 'bottom' | 'right';
  const toggleDrawer = (side: DrawerSide, open: boolean) => (
    event: React.KeyboardEvent | React.MouseEvent
  ) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }

    setState({ ...state, [side]: open });
  };
  const zIndex = {
    drawer: 1200,
  };
  return (
    <div className={classes.root}>
      <div className={classes.menuToggleBtn}>
        <AphButton onClick={toggleDrawer('left', true)}>
          <MenuIcon />
        </AphButton>
        <div className={classes.pageTitle}>
          {currentPath === clientRoutes.myAccount()
            ? 'Manage Profiles'
            : currentPath === clientRoutes.addressBook()
            ? 'Address Book'
            : currentPath === clientRoutes.healthRecords()
            ? 'Health Records'
            : currentPath === clientRoutes.needHelp()
            ? 'Need Help'
            : currentPath === clientRoutes.myPayments()
            ? 'My Payments'
            : 'Manage Profiles'}
        </div>
      </div>
      <div className={`${classes.userProfile} ${classes.desktopVisible}`}>
        <div className={classes.profileServices}>
          <div className={classes.servicesSection}>
            <div className={classes.sectionGroup}>
              <Link
                className={`${classes.serviceType} ${classes.textVCenter} ${
                  currentPath === clientRoutes.myAccount() ? classes.menuActive : ''
                }`}
                to={clientRoutes.myAccount()}
                title={'Manage Profiles'}
              >
                <span className={classes.serviceImg}>
                  <img src={require('images/ic_manageprofile.svg')} alt="" />
                </span>
                <span className={classes.linkText} title={'Manage Profiles'}>
                  Manage Profiles
                </span>
                <span className={classes.rightArrow}>
                  <img src={require('images/ic_arrow_right.svg')} alt="" />
                </span>
              </Link>
            </div>
            <div className={classes.sectionGroup}>
              <Link
                className={`${classes.serviceType} ${classes.textVCenter} ${
                  currentPath === clientRoutes.myPayments() ? classes.menuActive : ''
                }`}
                to={clientRoutes.myPayments()}
                title={'My Payments'}
              >
                <span className={classes.serviceImg}>
                  <img src={require('images/ic_fees.svg')} alt="" />
                </span>
                <span className={classes.linkText} title={'My Payments'}>
                  My Payments
                </span>
                <span className={classes.rightArrow}>
                  <img src={require('images/ic_arrow_right.svg')} alt="" />
                </span>
              </Link>
            </div>
            <div className={classes.sectionGroup}>
              <Link
                className={`${classes.serviceType} ${classes.textVCenter} ${
                  currentPath === clientRoutes.healthRecords() ? classes.menuActive : ''
                }`}
                to={clientRoutes.healthRecords()}
                title={'View health records'}
              >
                <span className={classes.serviceImg}>
                  <img src={require('images/ic_notificaiton_accounts.svg')} alt="" />
                </span>
                <span className={classes.linkText}>Health Records</span>
                <span className={classes.rightArrow}>
                  <img src={require('images/ic_arrow_right.svg')} alt="" />
                </span>
              </Link>
            </div>
            <div className={classes.sectionGroup}>
              <Link
                className={`${classes.serviceType} ${classes.textVCenter} ${
                  currentPath === clientRoutes.addressBook() ? classes.menuActive : ''
                }`}
                to={clientRoutes.addressBook()}
                title={'Address Book'}
              >
                <span className={classes.serviceImg}>
                  <img src={require('images/ic_location.svg')} alt="" />
                </span>
                <span className={classes.linkText} title={'Address Book'}>
                  Address Book
                </span>
                <span className={classes.rightArrow}>
                  <img src={require('images/ic_arrow_right.svg')} alt="" />
                </span>
              </Link>
            </div>
            <div className={classes.sectionGroup}>
              <Link
                className={`${classes.serviceType} ${classes.textVCenter} ${
                  currentPath === clientRoutes.needHelp() ? classes.menuActive : ''
                }`}
                to={clientRoutes.needHelp()}
                title={'Need Help'}
              >
                <span className={classes.serviceImg}>
                  <img src={require('images/ic_location.svg')} alt="" />
                </span>
                <span className={classes.linkText} title={'Need Help'}>
                  Need Help
                </span>
                <span className={classes.rightArrow}>
                  <img src={require('images/ic_arrow_right.svg')} alt="" />
                </span>
              </Link>
            </div>
            {/* <div className={classes.sectionGroup}>
              <Link
                className={`${classes.serviceType} ${classes.textVCenter} ${
                  currentPath === clientRoutes.notificationSettings() ? classes.menuActive : ''
                }`}
                to={clientRoutes.notificationSettings()}
              >
                <span className={classes.serviceImg}>
                  <img src={require('images/ic_notificaiton_accounts.svg')} alt="" />
                </span>
                <span className={classes.linkText}>Notification Settings</span>
                <span className={classes.rightArrow}>
                  <img src={require('images/ic_arrow_right.svg')} alt="" />
                </span>
              </Link>
            </div> */}
            {/* <div className={classes.sectionGroup}>
              <Link className={`${classes.serviceType} ${classes.textVCenter}`} to="#">
                <span className={classes.serviceImg}>
                  <img src={require('images/ic_invoice.svg')} alt="" />
                </span>
                <span className={classes.linkText}>Order Summary</span>
                <span className={classes.rightArrow}>
                  <img src={require('images/ic_arrow_right.svg')} alt="" />
                </span>
              </Link>
            </div> */}
            <div className={`${classes.sectionGroup}`} onClick={() => signOut()} title={'Logout'}>
              <div className={`${classes.serviceType} ${classes.textVCenter}`}>
                <span className={classes.serviceImg}>
                  <img src={require('images/ic_logout.svg')} alt="" />
                </span>
                <span className={classes.linkText} title={'Logout'}>
                  Logout
                </span>
                <span className={classes.rightArrow}>
                  <img src={require('images/ic_arrow_right.svg')} alt="" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ThemeProvider theme={defaultMaterialTheme}>
        <Drawer open={state.left} onClose={toggleDrawer('left', false)}>
          <div className={`${classes.userProfile} ${classes.mobileVisible}`}>
            <div className={classes.profileServices}>
              <div className={classes.servicesSection}>
                <div className={classes.sectionGroup}>
                  <Link
                    className={`${classes.serviceType} ${classes.textVCenter} ${
                      currentPath === clientRoutes.myAccount() ? classes.menuActive : ''
                    }`}
                    to={clientRoutes.myAccount()}
                    title={'Manage Profiles'}
                  >
                    <span className={classes.serviceImg}>
                      <img src={require('images/ic_manageprofile.svg')} alt="" />
                    </span>
                    <span className={classes.linkText} title={'Manage Profiles'}>
                      Manage Profiles
                    </span>
                    <span className={classes.rightArrow}>
                      <img src={require('images/ic_arrow_right.svg')} alt="" />
                    </span>
                  </Link>
                </div>
                <div className={classes.sectionGroup}>
                  <Link
                    className={`${classes.serviceType} ${classes.textVCenter} ${
                      currentPath === clientRoutes.myPayments() ? classes.menuActive : ''
                    }`}
                    to={clientRoutes.myPayments()}
                    title={'My Payments'}
                  >
                    <span className={classes.serviceImg}>
                      <img src={require('images/ic_fees.svg')} alt="" />
                    </span>
                    <span className={classes.linkText} title={'My Payments'}>
                      My Payments
                    </span>
                    <span className={classes.rightArrow}>
                      <img src={require('images/ic_arrow_right.svg')} alt="" />
                    </span>
                  </Link>
                </div>
                <div className={classes.sectionGroup}>
                  <Link
                    className={`${classes.serviceType} ${classes.textVCenter} ${
                      currentPath === clientRoutes.healthRecords() ? classes.menuActive : ''
                    }`}
                    to={clientRoutes.healthRecords()}
                    title={'View health records'}
                  >
                    <span className={classes.serviceImg}>
                      <img src={require('images/ic_notificaiton_accounts.svg')} alt="" />
                    </span>
                    <span className={classes.linkText}>Health Records</span>
                    <span className={classes.rightArrow}>
                      <img src={require('images/ic_arrow_right.svg')} alt="" />
                    </span>
                  </Link>
                </div>
                <div className={classes.sectionGroup}>
                  <Link
                    className={`${classes.serviceType} ${classes.textVCenter} ${
                      currentPath === clientRoutes.addressBook() ? classes.menuActive : ''
                    }`}
                    to={clientRoutes.addressBook()}
                    title={'Address Book'}
                  >
                    <span className={classes.serviceImg}>
                      <img src={require('images/ic_location.svg')} alt="" />
                    </span>
                    <span className={classes.linkText} title={'Address Book'}>
                      Address Book
                    </span>
                    <span className={classes.rightArrow}>
                      <img src={require('images/ic_arrow_right.svg')} alt="" />
                    </span>
                  </Link>
                </div>
                <div className={classes.sectionGroup}>
                  <Link
                    className={`${classes.serviceType} ${classes.textVCenter} ${
                      currentPath === clientRoutes.needHelp() ? classes.menuActive : ''
                    }`}
                    to={clientRoutes.needHelp()}
                    title={'Need Help'}
                  >
                    <span className={classes.serviceImg}>
                      <img src={require('images/ic_location.svg')} alt="" />
                    </span>
                    <span className={classes.linkText} title={'Need Help'}>
                      Need Help
                    </span>
                    <span className={classes.rightArrow}>
                      <img src={require('images/ic_arrow_right.svg')} alt="" />
                    </span>
                  </Link>
                </div>
                {/* <div className={classes.sectionGroup}>
              <Link
                className={`${classes.serviceType} ${classes.textVCenter} ${
                  currentPath === clientRoutes.notificationSettings() ? classes.menuActive : ''
                }`}
                to={clientRoutes.notificationSettings()}
              >
                <span className={classes.serviceImg}>
                  <img src={require('images/ic_notificaiton_accounts.svg')} alt="" />
                </span>
                <span className={classes.linkText}>Notification Settings</span>
                <span className={classes.rightArrow}>
                  <img src={require('images/ic_arrow_right.svg')} alt="" />
                </span>
              </Link>
            </div> */}
                {/* <div className={classes.sectionGroup}>
              <Link className={`${classes.serviceType} ${classes.textVCenter}`} to="#">
                <span className={classes.serviceImg}>
                  <img src={require('images/ic_invoice.svg')} alt="" />
                </span>
                <span className={classes.linkText}>Order Summary</span>
                <span className={classes.rightArrow}>
                  <img src={require('images/ic_arrow_right.svg')} alt="" />
                </span>
              </Link>
            </div> */}
                <div
                  className={`${classes.sectionGroup}`}
                  onClick={() => signOut()}
                  title={'Logout'}
                >
                  <div className={`${classes.serviceType} ${classes.textVCenter}`}>
                    <span className={classes.serviceImg}>
                      <img src={require('images/ic_logout.svg')} alt="" />
                    </span>
                    <span className={classes.linkText} title={'Logout'}>
                      Logout
                    </span>
                    <span className={classes.rightArrow}>
                      <img src={require('images/ic_arrow_right.svg')} alt="" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Drawer>
      </ThemeProvider>
    </div>
  );
};
