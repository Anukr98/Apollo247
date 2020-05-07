import { Theme, Avatar, Popover } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import React from 'react';
import { AphButton } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      paddingTop: 65,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 65,
      },
    },
    headerSticky: {
      position: 'fixed',
      width: '100%',
      zIndex: 9999,
      top: 0,
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    pageContainer: {
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      backgroundColor: '#f7f7f7',
      marginTop: 28,
    },
    pageHeader: {
      backgroundColor: theme.palette.common.white,
      display: 'flex',
    },
    patientSection: {
      width: '50%',
      display: 'flex',
    },
    doctorSection: {
      marginLeft: 'auto',
      display: 'flex',
      alignItems: 'flex-end',
      padding: 15,
    },
    patientImage: {
      paddingRight: 7,
      '& img': {
        verticalAlign: 'middle',
      },
    },
    patientInfo: {
      padding: 15,
    },
    patientName: {
      fontSize: 22,
      fontWeight: 600,
      color: '#02475b',
      borderBottom: '1px solid #00b38e',
      '& span': {
        color: 'rgba(2, 71, 91, 0.6)',
      },
      marginBottom: 5,
    },
    patientTextInfo: {
      fontSize: 14,
      color: '#02475b',
      fontWeight: 500,
      '& label': {
        opacity: 0.8,
        color: '#02475b',
        fontSize: 12,
      },
    },
    doctorImg: {
      paddingRight: 12,
    },
    avatar: {
      width: 60,
      height: 60,
    },
    contentGroup: {
      display: 'flex',
    },
    leftSection: {
      width: 'calc(50% - 1px)',
      borderRight: '1px solid rgba(2,71,91,0.2)',
    },
    rightSection: {
      width: '50%',
    },
    blockGroup: {
      width: '100%',
    },
    blockHeader: {
      boxShadow: '0 2px 10px 0 rgba(128, 128, 128, 0.2)',
      backgroundColor: theme.palette.common.white,
      padding: 12,
      fontSize: 16,
      fontWeight: 500,
      textAlign: 'center',
      color: '#02475b',
    },
    blockBody: {
      padding: 30,
      paddingBottom: 20,
    },
    customScroll: {
      padding: '0 20px',
    },
    boxGroup: {
      boxShadow: '0 2px 5px 0 rgba(128, 128, 128, 0.3)',
      backgroundColor: theme.palette.common.white,
      borderRadius: 10,
      padding: '30px 30px 10px 30px',
      marginBottom: 10,
    },
    doctorInfo: {
      paddingRight: 55,
      fontWeight: 500,
    },
    assign: {
      fontSize: 12,
      color: '#02475b',
      opacity: 0.8,
    },
    doctorName: {
      fontSize: 16,
      color: '#01475b',
      paddingTop: 5,
    },
    doctorType: {
      fontSize: 10,
      opacity: 0.6,
      color: '#01475b',
      textTransform: 'uppercase',
      paddingTop: 2,
    },
    doctorContact: {
      color: '#0087ba',
      fontSize: 14,
      paddingTop: 8,
    },
    pageSubHeader: {
      padding: '24px 20px',
      display: 'flex',
    },
    headerLeftGroup: {
      display: 'flex',
      alignItems: 'center',
    },
    headerRightGroup: {
      marginLeft: 'auto',
      display: 'flex',
      alignItems: 'center',

      '& >div': {
        paddingLeft: 20,
      },
      '& >button': {
        marginLeft: 20,
      },
    },
    callIcon: {
      cursor: 'pointer',
      '& img': {
        verticalAlign: 'middle',
      },
    },
    moreAction: {
      cursor: 'pointer',
      '& img': {
        verticalAlign: 'middle',
      },
    },
    saveBtn: {
      backgroundColor: theme.palette.common.white,
      minWidth: 175,
      borderRadius: 10,
      color: '#fc9916',
    },
    submitBtn: {
      minWidth: 216,
      borderRadius: 10,
    },
    consultName: {
      fontSize: 13,
      fontWeight: 600,
      color: '#02475b',
      textTransform: 'uppercase',
    },
    consultDur: {
      fontSize: 12,
      fontWeight: 500,
      borderLeft: 'solid 1px rgba(2, 71, 91, 0.6)',
      paddingLeft: 12,
      marginLeft: 12,
      color: 'rgba(2, 71, 91, 0.6)',
      '& span': {
        fontWeight: 'bold',
      },
    },
    caseSheetBody: {
      paddingLeft: 74,
      paddingRight: 15,
    },
    chatBody: {
      paddingRight: 74,
    },
    menuPopover: {
      minWidth: 160,
      borderRadius: 10,
      boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.4)',
      backgroundColor: theme.palette.common.white,
      marginTop: 14,
    },
    menuBtnGroup: {
      padding: '5px 16px',
      '& button': {
        boxShadow: 'none',
        borderRadius: 0,
        backgroundColor: 'transparent',
        fontSize: 18,
        fontWeight: 500,
        color: '#01475b',
        padding: '5px 0',
        display: 'block',
        textTransform: 'none',
        borderBottom: '0.5px solid rgba(1,71,91,0.3)',
        width: '100%',
        textAlign: 'left',
        '&:last-child': {
          borderBottom: 0,
        },
      },
    },
  };
});

export const PatientDetails: React.FC = (props) => {
  const classes = useStyles({});
  const [moreActionsDialog, setMoreActionsDialog] = React.useState<null | HTMLElement>(null);
  const moreActionsopen = Boolean(moreActionsDialog);

  function handleClick(event: React.MouseEvent<HTMLElement>) {
    setMoreActionsDialog(event.currentTarget);
  }

  return (
    <div className={classes.root}>
      <div className={classes.headerSticky}>
        <Header />
      </div>
      <div className={classes.container}>
        <div className={classes.pageContainer}>
          <div className={classes.pageHeader}>
            <div className={classes.patientSection}>
              <div className={classes.patientImage}>
                <img src="https://via.placeholder.com/132x132" alt="" />
              </div>
              <div className={classes.patientInfo}>
                <div className={classes.patientName}>
                  Rahul Mehta <span>(28, M)</span>
                </div>
                <div className={classes.patientTextInfo}>
                  <label>UHID:</label> 012345 | <label>Relation:</label> Self
                </div>
                <div className={classes.patientTextInfo}>
                  <label>Appt ID:</label> 98765
                </div>
                <div className={classes.patientTextInfo}>
                  <label>Appt Date:</label> 02/08/2019, 11.55 AM
                </div>
              </div>
            </div>
            <div className={classes.doctorSection}>
              <div className={classes.doctorImg}>
                <Avatar src={require('images/doctor_02.png')} alt="" className={classes.avatar} />
              </div>
              <div className={classes.doctorInfo}>
                <div className={classes.assign}>Assigned to:</div>
                <div className={classes.doctorName}>Dr. Seema Rao</div>
                <div className={classes.doctorType}>General Physician</div>
                <div className={classes.doctorContact}>+91 98765 43210</div>
              </div>
            </div>
          </div>
          <div className={classes.pageSubHeader}>
            <div className={classes.headerLeftGroup}>
              <div className={classes.consultName}>Consult Room</div>
              <div className={classes.consultDur}>
                Consultation Duration <span>04:25</span>
              </div>
            </div>
            <div className={classes.headerRightGroup}>
              <AphButton className={classes.saveBtn}>Save</AphButton>
              <AphButton className={classes.submitBtn} color="primary">
                Submit case sheet
              </AphButton>
              <div className={classes.callIcon}>
                <img src={require('images/ic_round-call.svg')} alt="" />
              </div>
              <div className={classes.moreAction} onClick={handleClick}>
                <img src={require('images/ic_more.svg')} alt="" />
              </div>
            </div>
          </div>
          <div className={classes.contentGroup}>
            <div className={classes.leftSection}>
              <div className={classes.blockGroup}>
                <div className={classes.blockHeader}>Case Sheet</div>
                <div className={`${classes.blockBody} ${classes.caseSheetBody}`}></div>
              </div>
            </div>
            <div className={classes.rightSection}>
              <div className={classes.blockGroup}>
                <div className={classes.blockHeader}>Chat</div>
                <div className={`${classes.blockBody} ${classes.chatBody}`}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Popover
        anchorEl={moreActionsDialog}
        keepMounted
        open={moreActionsopen}
        onClick={() => setMoreActionsDialog(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        classes={{ paper: classes.menuPopover }}
      >
        <div className={classes.menuBtnGroup}>
          <AphButton>Transfer Consult</AphButton>
        </div>
      </Popover>
    </div>
  );
};
