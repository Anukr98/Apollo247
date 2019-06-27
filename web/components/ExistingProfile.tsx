import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import Popover from '@material-ui/core/Popover';
import Typography from '@material-ui/core/Typography';
import { AppButton } from 'components/ui/AppButton';
import MenuItem from '@material-ui/core/MenuItem';
import { AppSelectField } from 'components/ui/AppSelectField';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    signUpBar: {
      display: 'flex',
    },
    mascotCircle: {
      marginLeft: 'auto',
      cursor: 'pointer',
      position: 'fixed',
      bottom: 10,
      right: 15,
      '& img': {
        maxWidth: 72,
        maxHeight: 72,
      },
    },
    signUpPop: {
      width: 368,
      borderRadius: 10,
      paddingTop: 36,
      boxShadow: '0 5px 40px 0 rgba(0, 0, 0, 0.3)',
      backgroundColor: theme.palette.common.white,
      '& p': {
        fontSize: 17,
        fontWeight: 500,
        lineHeight: 1.41,
        color: theme.palette.secondary.main,
        marginTop: 20,
      },
    },
    formControl: {
      marginBottom: 20,
      '& label': {
        fontSize: 12,
        fontWeight: 500,
        color: theme.palette.secondary.dark,
      },
    },
    actions: {
      padding: 20,
    },
    btnGroup: {
      paddingTop: 7,
      '& button': {
        width: '100%',
        color: '#00b38e',
        backgroundColor: theme.palette.common.white,
        fontSize: 16,
        fontWeight: 500,
      },
    },
    bottomPopover: {
      overflow: 'initial',
      backgroundColor: 'none',
      boxShadow: 'none',
    },
    mascotIcon: {
      position: 'absolute',
      right: 12,
      top: -40,
      '& img': {
        maxWidth: 80,
      },
    },
    customScrollBar: {
      height: '70vh',
      overflow: 'auto',
    },
    signinGroup: {
      padding: 20,
      paddingTop: 0,
      paddingBottom: 0,
    },
    formGroup: {
      paddingTop: 30,
    },
    profileBox: {
      borderRadius: 5,
      backgroundColor: '#f7f8f5',
      padding: 20,
      marginBottom: 10,
    },
    boxHeader: {
      display: 'flex',
      borderBottom: '1px solid rgba(1,71,91,0.3)',
      paddingBottom: 10,
      fontSize: 12,
      fontWeight: 500,
      color: theme.palette.secondary.dark,
    },
    userId: {
      marginLeft: 'auto',
    },
    boxContent: {
      paddingTop: 15,
    },
    userName: {
      fontSize: 16,
      fontWeight: 500,
      color: theme.palette.secondary.light,
    },
    userInfo: {
      fontSize: 12,
      fontWeight: 500,
      color: theme.palette.secondary.light,
    },
    menuSelected: {
      backgroundColor: 'transparent !important',
      color: '#00b38e !important',
    },
  });
});

export const ExistingProfile: React.FC = (props) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState<HTMLDivElement | null>(null);
  const avatarRef = React.useRef(null);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState<boolean>(false);
  const [userRelation, setUserRelation] = React.useState(5);
  const inputLabel = React.useRef<HTMLLabelElement>(null);

  return (
    <div className={classes.signUpBar}>
      <div
        className={classes.mascotCircle}
        ref={avatarRef}
        onClick={() => setIsPopoverOpen(true)}
      >
        <img src={require('images/ic_mascot.png')} alt="" />
      </div>
      <Popover
        open={isPopoverOpen}
        anchorEl={avatarRef.current}
        onClose={() => setIsPopoverOpen(false)}
        className={classes.bottomPopover}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        classes={{ paper: classes.bottomPopover }}
      >
        <div className={classes.signUpPop}>
          <div className={classes.mascotIcon}>
            <img src={require('images/ic_mascot.png')} alt="" />
          </div>
          <div className={classes.customScrollBar}>
            <div className={classes.signinGroup}>
              <Typography variant="h2">
                welcome
                <br /> to apollo 24/7
              </Typography>
              <p>We have found 2 accounts registered with this mobile number. Please tell
us who is who? :)</p>
              <div className={classes.formGroup}>
                <div className={classes.profileBox}>
                  <div className={classes.boxHeader}>
                    <div>1.</div>
                    <div className={classes.userId}>
                      APD1.0010783329
                    </div>
                  </div>
                  <div className={classes.boxContent}>
                    <div className={classes.userName}>Surj Gupta</div>
                    <div className={classes.userInfo}>Male  |  01 January 1987</div>
                    <AppSelectField
                      value={userRelation}
                      onChange={(e: any) => {
                        setUserRelation(e.currentTarget.value)
                      }}
                    >
                      <MenuItem value={5} classes={{ selected: classes.menuSelected }}>
                        Relation
                      </MenuItem>
                      <MenuItem value={10} classes={{ selected: classes.menuSelected }}>Me</MenuItem>
                      <MenuItem value={20} classes={{ selected: classes.menuSelected }}>Mother</MenuItem>
                      <MenuItem value={30} classes={{ selected: classes.menuSelected }}>Father</MenuItem>
                      <MenuItem value={40} classes={{ selected: classes.menuSelected }}>Sister</MenuItem>
                      <MenuItem value={50} classes={{ selected: classes.menuSelected }}>Brother</MenuItem>
                      <MenuItem value={60} classes={{ selected: classes.menuSelected }}>Cousin</MenuItem>
                      <MenuItem value={70} classes={{ selected: classes.menuSelected }}>Wife</MenuItem>
                      <MenuItem value={80} classes={{ selected: classes.menuSelected }}>Husband</MenuItem>
                    </AppSelectField>
                  </div>
                </div>
                <div className={classes.profileBox}>
                  <div className={classes.boxHeader}>
                    <div>2.</div>
                    <div className={classes.userId}>
                      APJ1.0002284253
                    </div>
                  </div>
                  <div className={classes.boxContent}>
                    <div className={classes.userName}>Preeti Gupta</div>
                    <div className={classes.userInfo}>Female  |  02 January 1987</div>
                    <AppSelectField
                      value={userRelation}
                      onChange={(e: any) => {
                        setUserRelation(e.currentTarget.value)
                      }}
                    >
                      <MenuItem value={5} classes={{ selected: classes.menuSelected }}>
                        Relation
                      </MenuItem>
                      <MenuItem value={10} classes={{ selected: classes.menuSelected }}>Me</MenuItem>
                      <MenuItem value={20} classes={{ selected: classes.menuSelected }}>Mother</MenuItem>
                      <MenuItem value={30} classes={{ selected: classes.menuSelected }}>Father</MenuItem>
                      <MenuItem value={40} classes={{ selected: classes.menuSelected }}>Sister</MenuItem>
                      <MenuItem value={50} classes={{ selected: classes.menuSelected }}>Brother</MenuItem>
                      <MenuItem value={60} classes={{ selected: classes.menuSelected }}>Cousin</MenuItem>
                      <MenuItem value={70} classes={{ selected: classes.menuSelected }}>Wife</MenuItem>
                      <MenuItem value={80} classes={{ selected: classes.menuSelected }}>Husband</MenuItem>
                    </AppSelectField>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={classes.actions}>
            <AppButton
              fullWidth
              disabled
              variant="contained"
              color="primary"
            >
              Submit
            </AppButton>
          </div>
        </div>
      </Popover>
    </div >
  );
};
