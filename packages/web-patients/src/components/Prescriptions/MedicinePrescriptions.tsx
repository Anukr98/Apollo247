import { makeStyles } from '@material-ui/styles';
import { Theme, Typography, RadioGroup, FormControlLabel } from '@material-ui/core';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from 'components/Header';
import { ManageProfile } from 'components/ManageProfile';
import { hasOnePrimaryUser } from '../../helpers/onePrimaryUser';
import { AphButton, AphRadio, AphTextField } from '@aph/web-ui-components';
import { PHRCard } from 'components/Prescriptions/PHRCard';
import { clientRoutes } from 'helpers/clientRoutes';
import { BottomLinks } from 'components/BottomLinks';
import { NavigationBottom } from 'components/NavigationBottom';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
    },
    mHide: {
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
    },
    breadcrumbs: {
      marginLeft: 20,
      marginRight: 20,
      fontSize: 14,
      paddingTop: 17,
      paddingBottom: 11,
      fontWeight: 'bold',
      color: '#02475b',
      textTransform: 'uppercase',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      [theme.breakpoints.down('xs')]: {
        borderBottom: 'none',
        backgroundColor: theme.palette.common.white,
        boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
        margin: 0,
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 16,
        position: 'fixed',
        top: 0,
        width: '100%',
        zIndex: 99,
      },
    },
    backArrow: {
      cursor: 'pointer',
      marginRight: 20,
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
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    pageContainer: {
      backgroundColor: '#f7f8f5',
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#f0f1ec',
        paddingBottom: 20,
        marginTop: -15,
      },
    },
    sectionContainer: {
      [theme.breakpoints.up('sm')]: {
        display: 'flex',
        padding: 20,
        paddingTop: 15,
      }
    },
    leftGroup: {
      [theme.breakpoints.up('sm')]: {
        width: 'calc(100% - 328px)',
      }
    },
    rightSideBar: {
      textAlign: 'center',
      paddingTop: 20,
      [theme.breakpoints.up('sm')]: {
        paddingTop: 0,
        width: 328,
        textAlign: 'right',
      }
    },
    priscriptionBox: {
      [theme.breakpoints.up('sm')]: {
        borderRadius: 10,
        boxShadow: '0 2px 5px 0 rgba(128, 128, 128, 0.3)',
        backgroundColor: '#ffffff',
        padding: '16px 20px',
      }
    },
    cardGroup: {
      paddingBottom: 20,
      [theme.breakpoints.down('xs')]: {
        paddingBottom: 0,
      },
    },
    titleHeader: {
      fontSize: 14,
      color: '#02475b',
      fontWeight: 500,
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      paddingBottom: 10,
      marginBottom: 20,
    },
    addMore: {
      textAlign: 'right',
      [theme.breakpoints.down('xs')]: {
        paddingTop: 20,
        paddingRight: 20,
      },
      '& button': {
        backgroundColor: 'transparent',
        boxShadow: 'none',
        color: '#fc9916',
        paddingRight: 0,
        '&:hover': {
          backgroundColor: 'transparent',
        },
      },
    },
    medicineDetails: {
      borderRadius: 5,
      backgroundColor: '#fff',
      [theme.breakpoints.up('sm')]: {
        boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
        backgroundColor: '#f7f8f5',
      }
    },
    radioGroup: {
      '& label': {
        margin: 0,
        fontSize: 16,
        fontWeight: 500,
        padding: '16px 20px',
        borderBottom: '0.5px solid rgba(2,71,91,0.3)',
        [theme.breakpoints.up('sm')]: {
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.2)',
        },
        '& span': {
          paddingRight: 2,
          '&:last-child': {
            paddingLeft: 10,
            fontWeight: 500,
          },
        },
        '&:last-child': {
          borderBottom: 'none',
        },
      }
    },
    specifiedSection: {
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      marginTop: -2,
      fontSize: 13,
      fontWeight: 500,
      [theme.breakpoints.up('sm')]: {
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.2)',
      },
    },
    infoText: {
      boxShadow: '0 4px 13px 0 rgba(128, 128, 128, 0.3)',
      backgroundColor: '#ffffff',
      color: '#00b38e',
      padding: '12px 20px 12px 58px',
      display: 'flex',
      alignItems: 'center',
      '& button': {
        backgroundColor: 'transparent',
        boxShadow: 'none',
        marginLeft: 'auto',
        minWidth: 'auto',
        padding: 0,
      },
    },
    duration: {
      color: '#02475b',
      padding: '12px 20px 12px 58px',
      display: 'flex',
      alignItems: 'center',
    },
    textField: {
      paddingLeft: 5,
      paddingRight: 5,
      width: 50,
      '& input': {
        textAlign: 'center',
        paddingTop: 0,
        paddingBottom: 3,
        fontSize: 13,
        opacity: 0.3,
      },
    },
    sectionGroup: {
      [theme.breakpoints.down('xs')]: {
        boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
        backgroundColor: '#f7f8f5',
        padding: 20,
        marginTop: 20,
      },
    },
  };
});

const TabContainer: React.FC = (props) => {
  return <Typography component="div">{props.children}</Typography>;
};

export const MedicinePrescriptions: React.FC = (props) => {
  const classes = useStyles({});
  const [value, setValue] = React.useState('');
  const onePrimaryUser = hasOnePrimaryUser();
  const [error, setError] = React.useState(false);
  const [helperText, setHelperText] = React.useState('Choose wisely');
  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue((event.target as HTMLInputElement).value);
    setHelperText(' ');
    setError(false);
  };

  return (
    <div className={classes.root}>
      <div className={classes.mHide}>
        <Header />
      </div>
      <div className={classes.container}>
        <div className={classes.pageContainer}>
          <div className={classes.breadcrumbs}>
            <Link to={clientRoutes.medicinesCart()}>
              <div className={classes.backArrow} title={'Back to home page'}>
                <img className={classes.blackArrow} src={require('images/ic_back.svg')} />
                <img
                  className={classes.whiteArrow}
                  src={require('images/ic_back_white.svg')}
                />
              </div>
            </Link>
            Upload Prescription
          </div>
          <div className={classes.sectionContainer}>
            <div className={classes.leftGroup}>
              <div className={classes.priscriptionBox}>
                <div className={classes.sectionGroup}>
                  <div className={classes.titleHeader}>
                    Physical Prescriptions (02)
                  </div>
                  <div className={classes.cardGroup}>
                    <PHRCard />
                    <PHRCard />
                  </div>
                </div>
                <div className={classes.sectionGroup}>
                  <div className={classes.titleHeader}>
                    Prescriptions From Health Records (01)
                  </div>
                </div>
                <div className={classes.addMore}>
                  <AphButton>Add more prescriptions</AphButton>
                </div>
                <div className={classes.sectionGroup}>
                  <div className={classes.titleHeader}>
                    Specify Your Medicine Details
                  </div>
                  <div className={classes.medicineDetails}>
                    <RadioGroup className={classes.radioGroup} aria-label="quiz" name="quiz" value={value} onChange={handleRadioChange}>
                      <FormControlLabel value="addmedicine" control={<AphRadio color="primary" />} label="Search and add medicine" />
                      <FormControlLabel value="prescription" control={<AphRadio color="primary" />} label="All medicine from prescription" />
                      <div className={classes.specifiedSection}>
                        <div className={classes.infoText}>
                          <span>As specified in prescription</span>
                          <AphButton>
                            <img src={require("images/ic_tickmark.svg")} alt="" />
                          </AphButton>
                        </div>
                        <div className={classes.duration}><span>Duration -</span> <div className={classes.textField}><AphTextField /></div> <span>Days</span></div>
                      </div>
                      <FormControlLabel value="callme" control={<AphRadio color="primary" />} label="Call me" />
                    </RadioGroup>
                  </div>
                </div>
              </div>
            </div>
            <div className={classes.rightSideBar}>
              <AphButton color="primary">Submit to confirm order</AphButton>
            </div>
          </div>
        </div>
      </div>
      {!onePrimaryUser && <ManageProfile />}
      <BottomLinks />
      <NavigationBottom />
    </div>
  );
};