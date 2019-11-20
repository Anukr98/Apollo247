import { Theme, Popover } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import React, { useState, useRef, useEffect } from 'react';
import { clientRoutes } from 'helpers/clientRoutes';
import { ChatWindow } from 'components/ChatRoom/ChatWindow';
import { ConsultDoctorProfile } from 'components/ChatRoom/ConsultDoctorProfile';
import { useParams } from 'hooks/routerHooks';
import { useAuth } from 'hooks/authHooks';
import { GET_DOCTOR_DETAILS_BY_ID } from 'graphql/doctors';
import {
  GetDoctorDetailsById,
  GetDoctorDetailsByIdVariables,
} from 'graphql/types/GetDoctorDetailsById';
import { useQueryWithSkip } from 'hooks/apolloHooks';
import LinearProgress from '@material-ui/core/LinearProgress';
import { ChatMessage } from 'components/ChatRoom/ChatMessage';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      paddingTop: 88,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 101,
      },
    },
    booksLink: {
      color: theme.palette.primary.main,
      textDecoration: 'underline',
    },
    headerSticky: {
      position: 'fixed',
      width: '100%',
      zIndex: 99,
      top: 0,
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    doctorListingPage: {
      borderRadius: '0 0 10px 10px',
      backgroundColor: '#f7f8f5',
      [theme.breakpoints.down('xs')]: {
        backgroundColor: 'transparent',
        paddingBottom: 20,
      },
    },
    breadcrumbs: {
      marginLeft: 20,
      marginRight: 20,
      fontSize: 13,
      paddingTop: 17,
      paddingBottom: 11,
      fontWeight: 600,
      color: '#02475b',
      textTransform: 'uppercase',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      [theme.breakpoints.down('xs')]: {
        position: 'fixed',
        zIndex: 2,
        top: 0,
        width: '100%',
        borderBottom: 'none',
        backgroundColor: theme.palette.common.white,
        margin: 0,
        paddingLeft: 20,
        paddingRight: 20,
      },
    },
    doctorListingSection: {
      [theme.breakpoints.up('sm')]: {
        display: 'flex',
        padding: '20px 3px 20px 20px',
      },
    },
    leftSection: {
      width: 328,
    },
    rightSection: {
      width: 'calc(100% - 328px)',
    },
    backArrow: {
      cursor: 'pointer',
      marginRight: 50,
      [theme.breakpoints.up(1220)]: {
        position: 'absolute',
        left: -82,
        top: 0,
        width: 48,
        height: 48,
        lineHeight: '36px',
        borderRadius: '50%',
        textAlign: 'center',
        backgroundColor: '#02475b',
      },
      '& img': {
        verticalAlign: 'bottom',
      },
    },
    whiteArrow: {
      verticalAlign: 'middle',
      [theme.breakpoints.down(1220)]: {
        display: 'none',
      },
    },
    blackArrow: {
      verticalAlign: 'middle',
      [theme.breakpoints.up(1220)]: {
        display: 'none',
      },
    },
    sectionHeader: {
      color: '#02475b',
      fontSize: 14,
      fontWeight: 500,
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      paddingBottom: 10,
      paddingTop: 10,
      marginBottom: 20,
      display: 'flex',
      alignItems: 'center',
      marginLeft: 20,
      marginRight: 20,
    },
    headerActions: {
      marginLeft: 'auto',
      display: 'flex',
      '& a': {
        display: 'inline-block',
        '& img': {
          verticalAlign: 'middle',
        },
      },
      '& a:last-child': {
        marginLeft: 40,
      },
    },
    bottomPopover: {
      overflow: 'initial',
      backgroundColor: 'transparent',
      boxShadow: 'none',
      [theme.breakpoints.down('xs')]: {
        left: '0px !important',
        maxWidth: '100%',
        width: '100%',
        top: '38px !important',
      },
    },
    successPopoverWindow: {
      display: 'flex',
      marginRight: 5,
      marginBottom: 5,
    },
    windowWrap: {
      width: 368,
      borderRadius: 10,
      paddingTop: 36,
      boxShadow: '0 5px 40px 0 rgba(0, 0, 0, 0.3)',
      backgroundColor: theme.palette.common.white,
    },
    mascotIcon: {
      position: 'absolute',
      right: 12,
      top: -40,
      '& img': {
        maxWidth: 80,
      },
    },
  };
});

type Params = { appointmentId: string; doctorId: string };

export const ChatRoom: React.FC = (props) => {
  const classes = useStyles({});
  const params = useParams<Params>();
  const [hasDoctorJoined, setHasDoctorJoined] = useState<boolean>(false);
  const appointmentId = params.appointmentId;
  const doctorId = params.doctorId;
  const { isSignedIn } = useAuth();
  const mascotRef = useRef(null);
  const [isPopoverOpen] = React.useState<boolean>(true);

  const { data, loading, error } = useQueryWithSkip<
    GetDoctorDetailsById,
    GetDoctorDetailsByIdVariables
  >(GET_DOCTOR_DETAILS_BY_ID, {
    variables: { id: doctorId },
  });

  if (loading) {
    return <LinearProgress />;
  }
  if (error) {
    return <div>Error....</div>;
  }

  return !isSignedIn ? (
    <LinearProgress />
  ) : (
    <div className={classes.root}>
      <div className={classes.headerSticky}>
        <div className={classes.container}>
          <Header />
        </div>
      </div>
      <div className={classes.container}>
        <div className={classes.doctorListingPage}>
          <div className={classes.breadcrumbs}>
            <a onClick={() => (window.location.href = clientRoutes.consultRoom())}>
              <div className={classes.backArrow}>
                <img className={classes.blackArrow} src={require('images/ic_back.svg')} />
                <img className={classes.whiteArrow} src={require('images/ic_back_white.svg')} />
              </div>
            </a>
            Consult Room
          </div>
          <div className={classes.doctorListingSection}>
            <div className={classes.leftSection}>
              {data && (
                <ConsultDoctorProfile
                  doctorDetails={data}
                  appointmentId={appointmentId}
                  hasDoctorJoined={hasDoctorJoined}
                />
              )}
            </div>
            <div className={classes.rightSection}>
              <div className={classes.sectionHeader}>
                <span>Case #362079 </span>
                <div className={classes.headerActions}>
                  <Link to="#">
                    <img src={require('images/ic_casesheet.svg')} alt="" />
                  </Link>
                  <Link to="#">
                    <img src={require('images/ic_followup.svg')} alt="" />
                  </Link>
                </div>
              </div>
              {data && (
                <ChatWindow
                  doctorDetails={data}
                  appointmentId={appointmentId}
                  doctorId={doctorId}
                  hasDoctorJoined={(hasDoctorJoined: boolean) =>
                    setHasDoctorJoined(hasDoctorJoined)
                  }
                />
              )}
            </div>
          </div>
        </div>
      </div>
      {/* <Popover
        open={isPopoverOpen}
        anchorEl={mascotRef.current}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        classes={{ paper: classes.bottomPopover }}
      >
        <div className={classes.successPopoverWindow}>
          <div className={classes.windowWrap}>
            <div className={classes.mascotIcon}>
              <img src={require('images/ic_mascot.png')} alt="" />
            </div>
            <ChatMessage />
          </div>
        </div>
      </Popover> */}
    </div>
  );
};
