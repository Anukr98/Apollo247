import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React, { useEffect } from 'react';
import Typography from '@material-ui/core/Typography';
import { AppButton } from 'components/ui/AppButton';
import MenuItem from '@material-ui/core/MenuItem';
import { AppSelectField } from 'components/ui/AppSelectField';
import { ProtectedWithLoginPopup } from 'components/ProtectedWithLoginPopup';
import { useCurrentUser } from 'hooks/authHooks';

const useStyles = makeStyles((theme: Theme) => {
  return {
    heroBanner: {
      borderRadius: '0 0 10px 10px',
      backgroundColor: theme.palette.text.primary,
      padding: 40,
      position: 'relative',
      [theme.breakpoints.up('lg')]: {
        display: 'flex',
      },
      [theme.breakpoints.down('xs')]: {
        padding: '40px 20px',
      },
      [theme.breakpoints.between('sm', 'md')]: {
        paddingTop: 60,
      },
    },
    bannerInfo: {
      [theme.breakpoints.up('lg')]: {
        width: '50%',
      },
      '& p': {
        fontSize: 17,
        lineHeight: 1.47,
        fontWeight: 500,
        color: theme.palette.secondary.main,
        marginTop: 16,
        marginBottom: 20,
        [theme.breakpoints.between('sm', 'md')]: {
          paddingRight: 400,
        },
      },
      '& h1': {
        display: 'flex',
        [theme.breakpoints.down('xs')]: {
          fontSize: 36,
        },
        '& >div': {
          marginLeft: 10,
          paddingTop: 0,
          marginTop: -10,
          width: 'auto',
        },
      },
    },
    bannerImg: {
      marginBottom: -190,
      textAlign: 'right',
      [theme.breakpoints.up('lg')]: {
        width: '50%',
        marginLeft: 'auto',
      },
      [theme.breakpoints.between('sm', 'md')]: {
        width: 400,
        position: 'absolute',
        right: 40,
        bottom: 0,
        marginBottom: -150,
      },
      '& img': {
        marginTop: -15,
        maxWidth: '100%',
        [theme.breakpoints.down('xs')]: {
          maxWidth: 281,
          marginTop: -50,
        },
      },
    },
    button: {
      [theme.breakpoints.up('sm')]: {
        minWidth: 200,
      },
    },
    menuSelected: {
      backgroundColor: 'transparent !important',
      color: '#00b38e !important',
    },
    selectMenuRoot: {
      '& svg': {
        color: '#00b38e',
        fontSize: 30,
      },
    },
    selectMenuItem: {
      color: theme.palette.secondary.dark,
      fontSize: 56,
      fontWeight: 600,
      lineHeight: '66px',
      [theme.breakpoints.down('xs')]: {
        fontSize: 36,
        lineHeight: '46px',
      },
      backgroundColor: 'transparent',
      '&:focus': {
        backgroundColor: 'transparent',
      },
    },
    addMemberBtn: {
      boxShadow: 'none',
      backgroundColor: 'transparent',
      minWidth: 100,
      marginLeft: 30,
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
  };
});

function capitalizeFirstLetter(sentense: string) {
  const words = sentense.split(' ');
  if (words.length > 0) {
    const newWords = words.map((word: string, index) => {
      if (word.trim().length > 0) {
        return word.charAt(0).toUpperCase() + words[index].substr(1).toLowerCase();
      }
    });
    return newWords.join(' ');
  } else {
    return sentense;
  }
}

export const HeroBanner: React.FC = (props) => {
  const classes = useStyles();
  const [userName, setUserName] = React.useState('');
  const [uhidsAvailable, setUhidsAvailable] = React.useState<boolean>(false);
  const userDetails = useCurrentUser();

  useEffect(() => {
    if (userDetails && userDetails[0].uhid !== '') {
      setUserName(userDetails[0].uhid);
      setUhidsAvailable(true);
    }
  }, [userDetails]);

  const handleUserNameChange = (event: React.ChangeEvent<{ value: string }>) => {
    setUserName(event.target.value as string);
  };

  interface uhidInfoObject {
    firstName: string;
    id: string;
    lastName: string;
    mobileNuber: string;
    sex: string;
    uhid: string;
  }

  const welcomeText = () => {
    if (uhidsAvailable) {
      return (
        <AppSelectField
          value={userName}
          onChange={handleUserNameChange}
          classes={{ root: classes.selectMenuRoot, selectMenu: classes.selectMenuItem }}
        >
          {userDetails.map((uhidInfo: uhidInfoObject) => (
            <MenuItem
              selected
              value={uhidInfo.uhid}
              classes={{ selected: classes.menuSelected }}
              key={uhidInfo.uhid}
            >
              {capitalizeFirstLetter(uhidInfo.firstName)}
            </MenuItem>
          ))}
          <MenuItem classes={{ selected: classes.menuSelected }}>
            <AppButton color="primary" classes={{ root: classes.addMemberBtn }}>
              Add Member
            </AppButton>
          </MenuItem>
        </AppSelectField>
      );
    } else {
      return null;
    }
  };

  return (
    <div className={classes.heroBanner}>
      <div className={classes.bannerInfo}>
        <Typography variant="h1">
          <span>{uhidsAvailable ? 'hello' : 'hello there!'}</span>
          {welcomeText()}
        </Typography>
        <p>Not feeling well today? Don’t worry. We will help you find the right doctor :)</p>
        <ProtectedWithLoginPopup>
          {({ protectWithLoginPopup }) => (
            <AppButton
              variant="contained"
              color="primary"
              classes={{ root: classes.button }}
              onClick={() => protectWithLoginPopup()}
            >
              Consult a doctor
            </AppButton>
          )}
        </ProtectedWithLoginPopup>
      </div>
      <div className={classes.bannerImg}>
        <img src={require('images/ic_doctor.svg')} alt="" />
      </div>
    </div>
  );
};
