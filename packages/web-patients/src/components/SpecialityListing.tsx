import React, { useState, useEffect } from 'react';
import { Theme, Grid, CircularProgress, Popover, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import { NavigationBottom } from 'components/NavigationBottom';
import { AphInput } from '@aph/web-ui-components';
import { Specialities } from 'components/Specialities';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { gtmTracking } from '../gtmTracking';
// import { SearchObject } from 'components/DoctorsFilter';
import { BottomLinks } from 'components/BottomLinks';
import { PastSearches } from 'components/PastSearches';
import { useAuth } from 'hooks/authHooks';
import { clientRoutes } from 'helpers/clientRoutes';
import { Link } from 'react-router-dom';
import { AphButton } from '@aph/web-ui-components';
import { Cities } from './Cities';

const useStyles = makeStyles((theme: Theme) => {
  return {
    slContainer: {},
    slContent: {
      padding: '0 20px 40px',
      background: '#f7f8f5',
      position: 'relative',
      zIndex: 1,
      [theme.breakpoints.down('sm')]: {
        padding: 0,
        '&:after': {
          content: "''",
          position: 'absolute',
          top: 0,
          right: 0,
          left: 0,
          height: 270,
          background: '#fff',
          bottom: 'auto',
          zIndex: -1,
          boxShadow: ' 0 5px 20px 0 rgba(128, 128, 128, 0.3)',
        },
      },
      [theme.breakpoints.down(650)]: {
        '&:after': {
          height: 320,
        },
      },
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    pageHeader: {
      padding: '15px 0',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      [theme.breakpoints.down('sm')]: {
        padding: '15px 20px',
        display: 'flex',
        alignItems: 'center',
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
    breadcrumbs: {
      margin: 0,
      padding: 0,
      listStyle: 'none',
      display: 'flex',
      alignItems: 'center',
      '& li': {
        '& a': {
          fontSize: 13,
          fontWeight: 'bold',
          color: '#fca317',
          textTransform: 'uppercase',
          padding: '0 4px 0 7px',
          position: 'relative',
          '&:after': {
            content: "''",
            position: 'absolute',
            top: 4,
            right: -8,
            border: '4px solid transparent',
            borderLeftColor: '#00889e',
          },
        },
        '&.active': {
          '& a': {
            color: '#007c93',
          },
        },
        '&:first-child': {
          '& a': {
            paddingLeft: 0,
          },
        },
        '&:last-child': {
          '& a:after': {
            display: 'none',
          },
        },
      },
    },
    specialityContent: {
      '& h2': {
        fontSize: 16,
        margin: '10px 0',
        color: '#00a7b9',
        fontWeight: 'bold',
        [theme.breakpoints.down('sm')]: {
          margin: '30px 0 10px',
        },
      },
    },
    slWrapper: {
      padding: '20px 0',
      [theme.breakpoints.down('sm')]: {
        padding: '20px',
      },
    },
    location: {
      display: 'flex',
      alignItems: 'center',
      borderBottom: '2px solid #00b38e',
      padding: '5px 0',
      margin: '0 10px 0 0',
      cursor: 'pointer',
      '& >img': {
        margin: '0 10px 0 0',
      },
      [theme.breakpoints.down(600)]: {
        margin: '0 0 10px',
      },
    },
    userLocation: {
      display: 'flex',
      alignItems: 'center',
      '& p': {
        fontSize: 16,
        color: 'rgba(2,71,91, 0.3)',
        fontWeight: 700,
        margin: '0 10px 0 0',
        width: 120,
      },
    },
    searchInput: {
      padding: '0 0 0 30px',
    },
    searchContainer: {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      position: 'relative',
      '& img': {
        position: 'absolute',
        left: 0,
      },
    },
    pastSearch: {
      padding: '20px 0 0',
      '& h6': {
        fontSize: 14,
        fontWeight: 'bold',
      },
    },
    pastSearchList: {
      margin: 0,
      padding: '20px ',
      listStyle: 'none',
      display: 'flex',
      alignItems: 'center',
      '& li': {
        margin: '0 16px 0 0',
        minWidth: 150,
        textAlign: 'center',
        '& a': {
          padding: 12,
          background: '#ffffff',
          borderRadius: 10,
          boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
          color: '#fc9916',
          fontsize: 13,
          textTransform: 'uppercase',
          display: 'block',
          fontWeight: 'bold',
        },
        '& :last-child': {
          margin: 0,
        },
      },
      [theme.breakpoints.down('sm')]: {
        width: '100%',
        overflowX: 'auto',
      },
    },
    topSpeciality: {},
    sectionHeader: {
      padding: '10px 0',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      '& h2': {
        fontSize: 14,
        fontWeight: 700,
        color: '#02475b',
        textTransform: 'uppercase',
        margin: 0,
      },
    },
    otherSpeciality: {
      '& >div': {
        '& >div': {
          '&:first-child': {
            display: 'block',
          },
        },
      },
    },
    faq: {
      padding: '20px',
      background: '#ffffff',
      borderRadius: 5,
      width: '66%',
      '& h2': {
        fontSize: 16,
        fontWeight: 'bold',
        margin: '0 0 20px',
        color: '#01667c',
      },
      [theme.breakpoints.down('sm')]: {
        width: '100%',
      },
    },
    heading: {},
    panelRoot: {
      boxShadow: 'none',
      borderTop: '1px solid rgba(2, 71, 91, .2)',
      borderRadius: '0 !important',
      '&:before': {
        display: 'none',
      },
    },
    panelHeader: {
      padding: 0,
    },
    summaryContent: {},
    expandIcon: {
      color: '#02475b',
      margin: 0,
    },
    panelExpanded: {
      margin: 0,
    },
    panelDetails: {
      padding: 0,
      '& p': {
        fontSize: 14,
        fontWeight: 500,
      },
    },
    panelHeading: {
      margin: 0,
      fontSize: 14,
      fontWeight: 500,
    },
    detailsContent: {
      width: '80%',
      '& p': {
        margin: '0 0 10px',
        '&:last-child': {
          margin: 0,
        },
      },
    },
    faqList: {
      padding: '0 0 0 20px',
      margin: 0,
      listStyle: 'decimal',
    },
    tsContent: {
      padding: '20px 0',
    },
    osContainer: {
      padding: '20px 0',
    },
    specialityCard: {
      height: 160,
      background: '#fff',
      borderRadius: 10,
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      padding: 10,
      textAlign: 'center',
      position: 'relative',
      '& h3': {
        fontSize: 14,
        fontWeight: 500,
      },
      '& img': {
        width: 40,
        margin: '10px 0',
      },
      '& p': {
        fontSize: 12,
        color: 'rgb(2, 71, 91, 0.6)',
        lineHeight: '12px',
        padding: '0 15px',
        fontWeight: 500,
      },
      [theme.breakpoints.down(700)]: {
        height: 180,
        '& h3': {
          fontSize: 12,
        },
        '& p': {
          padding: '0 10px',
        },
      },
    },
    symptoms: {
      position: 'absolute',
      bottom: 10,
      fontSize: '10px !important',
      margin: '20px 0 0',
      fontWeight: 500,
      color: '#02475b !important',
      padding: '0 !important',
      left: 0,
      right: 0,
      textAlign: 'center',
      [theme.breakpoints.down(700)]: {
        padding: '0 10px !important',
      },
    },
    specialityDetails: {},
    videoContainer: {
      height: 180,
      border: '1px solid #eee',
      borderRadius: 5,
      padding: 10,
    },
    card: {
      background: '#ffffff',
      borderRadius: 5,
      padding: 15,
      margin: '0 0 20px',
      '& h5': {
        fontSize: 16,
        fontWeight: 600,
        margin: '0 0 10px',
        lineHeight: '16px',
      },
    },
    cardList: {
      padding: '0 0 0 20px',
      margin: 0,
      '& li': {
        fontSize: 14,
        fontWeight: 500,
        lineHeight: '24px',
      },
    },
    symptomContainer: {
      display: 'flex',
      alignItems: 'flex-start',
      '& img': {
        margin: '0 10px 0 0',
      },
      '& h6': {
        fontSize: 14,
        fontWeight: 600,
        margin: '0 0 10px',
      },
      '& a': {
        fontSize: 13,
        color: '#fc9916',
        textTransform: 'uppercase',
        display: 'block',
        fontWeight: 700,
      },
    },
    appDetails: {
      '& h6': {
        color: '#0589bb',
        fontSize: 14,
        margin: '0 0 5px',
        fontWeight: 500,
      },
      '& p': {
        fontSize: 12,
        color: 'rgb(2, 71, 91, 0.6)',
        lineHeight: '18px',
      },
    },
    appDownload: {
      display: 'flex',
      alignItems: 'center',
      margin: '10px 0 0',
      fontWeight: 500,
      '& button': {
        color: '#fc9916',
        width: '100%',
        margin: '0 0 0 10px',
        maxWidth: 300,
      },
    },
    tabsContainer: {},
    tabRoot: {
      background: '#f7f8f5',
      padding: 10,
      boxShadow: ' 0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      borderRadius: 5,
      minWidth: 140,
      opacity: 1,
      position: 'relative',
      border: '1px solid transparent',
      minHeight: 'auto',
      overflow: 'visible',
      '&:first-child': {
        margin: '0 10px 0 0',
      },
      '& span': {
        fontSize: 12,
        fontWeight: 600,
        textTransform: 'none',
        lineHeight: '15px',
        position: 'relative',
        zIndex: 5,
      },
      '&:before': {
        content: "''",
        position: 'absolute',
        bottom: -34,
        left: 0,
        right: 0,
        zIndex: 2,
        width: 20,
        height: '100%',
        margin: '0 auto',
        borderRadius: 4,
        borderTop: '10px solid transparent',
        borderBottom: '10px solid transparent',
        borderLeft: ' 40px solid transparent',
        borderRight: '40px solid transparent',
      },
      '&:after': {
        content: "''",
        position: 'absolute',
        bottom: -35,
        left: 0,
        right: 0,
        zIndex: 1,
        width: 20,
        height: '100%',
        margin: '0 auto',
        borderRadius: 4,
        borderTop: '10px solid transparent',
        borderBottom: '10px solid transparent',
        borderLeft: ' 40px solid transparent',
        borderRight: '40px solid transparent',
      },
      [theme.breakpoints.down('sm')]: {
        minWidth: 100,
        '&:first-child': {
          margin: '0 20px 0 0',
        },
      },
    },
    tabSelected: {
      borderColor: '#00b38e',
      '&:before': {
        borderTopColor: '#f7f8f5',
      },
      '&:after': {
        borderTopColor: '#00b38e',
      },
    },
    tabsRoot: {
      '& >div': {
        '& >div': {
          padding: '10px 0 30px',
        },
      },
    },
    tabsIndicator: {
      display: 'none',
    },
    tabContent: {},
    chatContainer: {},
    tabHead: {
      display: 'flex',
      alignItems: 'center',
      '& img': {
        margin: '0 20px 0 0',
      },
      '& h6': {
        color: '#0589bb',
        fontSize: 14,
        textTransform: 'uppercase',
        fontWeight: 600,
      },
    },
    tabBody: {
      padding: '20px 0',
      borderTop: '1px solid #eeeeee',
      borderBottom: '1px solid #eeeeee',
      margin: '20px 0',
    },
    tabList: {
      padding: 0,
      margin: 0,
      listStyle: 'none',
      '& li': {
        padding: '5px 0',
        display: 'flex',
        alignItems: 'center',
        '& p': {
          fontSize: 12,
          color: 'rgb(2, 71, 91, 0.6)',
          margin: '0 0 0 15px',
          fontWeight: 500,
        },
      },
    },
    highlight: {
      '& p': {
        color: '#0589bb !important',
      },
    },
    sHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      '& h1': {
        fontsize: 20,
        color: '#007c93',
        fontWeight: 600,
      },
      [theme.breakpoints.down('sm')]: {
        '& a': {
          position: 'absolute',
          top: 15,
          right: 20,
          zIndex: 2,
        },
      },
      [theme.breakpoints.down(700)]: {
        flexDirection: 'column',
        alignItems: 'flex-start',
      },
    },
    specialitySearch: {
      padding: '10px 0 0',
      display: 'flex',
      alignItems: 'center',
      [theme.breakpoints.down(700)]: {
        flexDirection: 'column',
        alignItems: 'flex-start',
      },
    },
    footerLinks: {
      [theme.breakpoints.down(900)]: {
        display: 'none',
      },
    },
    locationContainer: {
      padding: 30,
      [theme.breakpoints.down(600)]: {
        padding: 20,
      },
    },
    dialogTitle: {
      textAlign: 'left',
      [theme.breakpoints.down(600)]: {
        '& h2': {
          fontSize: 14,
        },
      },
    },
    popularCities: {
      padding: '20px 0',
      '& h6': {
        fontSize: 14,
        fontWeight: 700,
        margin: '0 0 10px',
        color: '#02475b',
      },
      '& button': {
        margin: '0 15px 0 0',
        color: '#00b38e',
        borderRadius: 10,
        fontSize: 12,
        textTransform: 'none',
        [theme.breakpoints.down(500)]: {
          margin: '0 15px 15px 0',
        },
      },
    },
    btnContainer: {
      display: 'flex',
      justifyContent: 'flex-end',
      '& button': {
        width: 180,
        fontSize: 13,
        fontWeight: 700,
      },
    },
    searchContent: {
      position: 'absolute',
      top: 36,
      left: 0,
      right: 0,
      zIndex: 5,
      maxHeight: 300,
      overflow: 'auto',
      padding: 20,
      background: '#fff',
      borderRadius: 5,
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',

      '& h6': {
        fontSize: 12,
        color: 'rgba(1,71,91, 0.6)',
        fontWeight: 700,
        textTransform: 'uppercase',
      },
      '&::-webkit-scrollbar': {
        width: 8,
      },
      '&::-webkit-scrollbar-track': {
        background: '#fff',
      },
      '&::-webkit-scrollbar-thumb': {
        background: '#d8d8d8',
        borderRadius: 4,
      },
    },
    doctorContent: {
      display: 'flex',
      alignItems: 'center',
    },
    dImg: {
      width: 44,
      height: 44,
      borderRadius: '50%',
      border: '1px solid #ccc',
      margin: '0 15px 0 0',
    },
    doctorDetails: {},
    doctorList: {
      padding: 0,
      margin: 0,
      listStyle: 'none',
      '& li': {
        padding: '10px 0',
      },
    },
    docContent: {
      '& h2': {
        fontSize: 16,
        color: '#02475b',
        fontWeight: 500,
        margin: '0 0 5px',
      },
      '& p': {
        fontSize: 12,
        color: 'rgba(2,71,91,0.7)',
        fontWeight: 500,
      },
    },
    sContent: {
      margin: '10px 0 0',
      padding: '15px 0 0',
      borderTop: '1px solid rgba(1,71,91,0.5)',
    },
    sList: {
      padding: 0,
      margin: 0,
      listStyle: 'none',
      '& li': {
        fontSize: 16,
        color: '#02475b',
        padding: '5px 0',
        fontWeight: 500,
      },
    },
  };
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <div>{children}</div>}
    </div>
  );
}
function a11yProps(index: any) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export const SpecialityListing: React.FC = (props) => {
  const classes = useStyles({});
  const { currentPatient } = useAllCurrentPatients();
  const { isSignedIn } = useAuth();
  const [expanded, setExpanded] = React.useState<string | false>(false);
  const [value, setValue] = React.useState(0);
  const prakticeSDKSpecialties = localStorage.getItem('symptomTracker');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [locationPopup, setLocationPopup] = useState<boolean>(false);
  const [searchContent, setSearchcontent] = useState<boolean>(false);

  const handleChange = (panel: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  useEffect(() => {
    /**Gtm code start start */
    gtmTracking({
      category: 'Consultations',
      action: 'Landing Page',
      label: 'Listing Page Viewed',
    });
    /**Gtm code start end */
  }, []);

  return (
    <div className={classes.slContainer}>
      <Header />
      <div className={classes.container}>
        <div className={classes.slContent}>
          <div className={classes.pageHeader}>
            <Link to={clientRoutes.welcome()}>
              <div className={classes.backArrow} title={'Back to home page'}>
                <img className={classes.blackArrow} src={require('images/ic_back.svg')} />
                <img className={classes.whiteArrow} src={require('images/ic_back_white.svg')} />
              </div>
            </Link>
            <ol className={classes.breadcrumbs}>
              <li>
                <Link to={clientRoutes.welcome()}>Home</Link>
              </li>
              <li className="active">
                <a href="javascript:void(0);">Specialities</a>
              </li>
            </ol>
          </div>
          <div className={classes.slWrapper}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <div className={classes.specialityContent}>
                  <div className={classes.sHeader}>
                    <Typography component="h1">Book Doctor Appointments Online</Typography>
                    {/* <a href="javascript:void(0);">
                      <img src={require('images/ic_round-share.svg')} />
                    </a> */}
                  </div>
                  <div className={classes.specialitySearch}>
                    <div className={classes.location} onClick={() => setLocationPopup(true)}>
                      <img src={require('images/location.svg')} alt="" />
                      <div className={classes.userLocation}>
                        <Typography>Select Your City</Typography>
                        <img src={require('images/ic_dropdown_green.svg')} alt="" />
                      </div>
                    </div>
                    <div className={classes.searchContainer}>
                      <img src={require('images/ic-search.svg')} alt="" />
                      <AphInput
                        className={classes.searchInput}
                        placeholder="Search doctors or specialities"
                        onChange={(e) => {
                          const searchValue = e.target.value;
                          setSearchKeyword(searchValue);
                        }}
                      />
                      {searchContent ? (
                        <div className={classes.searchContent}>
                          <div className={classes.docContent}>
                            <Typography component="h6">Doctors</Typography>
                            <ul className={classes.doctorList}>
                              <li>
                                <div className={classes.doctorContent}>
                                  <div className={classes.dImg}></div>
                                  <div className={classes.doctorDetails}>
                                    <Typography component="h2">Dr. Radha Kumar</Typography>
                                    <Typography>
                                      Urogynaecology | Apollo Hospitals Greams Road Chennai
                                    </Typography>
                                  </div>
                                </div>
                              </li>
                              <li>
                                <div className={classes.doctorContent}>
                                  <div className={classes.dImg}></div>
                                  <div className={classes.doctorDetails}>
                                    <Typography component="h2">Dr. Rakesh Gupta</Typography>
                                    <Typography>
                                      Urogynaecology | Apollo Hospitals Greams Road Chennai
                                    </Typography>
                                  </div>
                                </div>
                              </li>
                            </ul>
                          </div>
                          <div className={classes.sContent}>
                            <Typography component="h6">Specialities</Typography>
                            <ul className={classes.sList}>
                              <li>Radiology</li>
                              <li>Reproductive Medicine and Infertility</li>
                            </ul>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className={classes.pastSearch}>
                    <Typography component="h6">{isSignedIn ? 'Past Searches' : ''}</Typography>
                    <div className={classes.pastSearchList}>
                      {currentPatient && currentPatient.id && searchKeyword.length <= 0 && (
                        <PastSearches />
                      )}
                    </div>
                  </div>
                  <Typography component="h2">
                    Start your care now by choosing from 500 doctors and 65 specialities
                  </Typography>
                  <div className={classes.topSpeciality}>
                    <div className={classes.sectionHeader}>
                      <Typography component="h2">Top Specialites</Typography>
                    </div>
                    <div className={classes.tsContent}>
                      <Grid container spacing={2}>
                        <Grid item xs={6} md={3}>
                          <div className={classes.specialityCard}>
                            <Link to={clientRoutes.specialties('paediatrics')}>
                              <Typography component="h3">Paediatrics</Typography>
                              <img src={require('images/ic-baby.svg')} />
                              <Typography>For your child’s health problems</Typography>
                              {/* <Typography className={classes.symptoms}>
                                Fever, cough, diarrhoea
                              </Typography> */}
                            </Link>
                          </div>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <div className={classes.specialityCard}>
                            <Link
                              to={clientRoutes.specialties('general-physician-internal-medicine')}
                            >
                              <Typography component="h3">General Physician</Typography>
                              <img src={require('images/ic_doctor_consult.svg')} />
                              <Typography>For any common health issue</Typography>
                              {/* <Typography className={classes.symptoms}>
                                Fever, headache, asthma
                              </Typography> */}
                            </Link>
                          </div>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <div className={classes.specialityCard}>
                            <Link to={clientRoutes.specialties('dermatology')}>
                              <Typography component="h3">Dermatology</Typography>
                              <img src={require('images/ic-hair.svg')} />
                              <Typography>For skin &amp; hair problems</Typography>
                              {/* <Typography className={classes.symptoms}>
                                Skin rash, acne, skin patch
                              </Typography> */}
                            </Link>
                          </div>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <div className={classes.specialityCard}>
                            <Link to={clientRoutes.specialties('obstetrics--gynaecology')}>
                              <Typography component="h3">Gynaecology</Typography>
                              <img src={require('images/ic-gynaec.svg')} />
                              <Typography>For women’s health </Typography>
                              {/* <Typography className={classes.symptoms}>
                                Irregular periods, pregnancy
                              </Typography> */}
                            </Link>
                          </div>
                        </Grid>
                      </Grid>
                    </div>
                  </div>
                  <div className={classes.otherSpeciality}>
                    <div className={classes.sectionHeader}>
                      <Typography component="h2">Other Specialites</Typography>
                    </div>
                    <div className={classes.osContainer}>
                      <Specialities />
                    </div>
                  </div>
                </div>
              </Grid>
              <Grid item xs={12} md={4}>
                <div className={classes.specialityDetails}>
                  {/* <div className={classes.videoContainer}></div> */}
                  <div className={classes.card}>
                    <div className={classes.symptomContainer}>
                      <img src={require('images/ic-symptomtracker.svg')} />
                      <div>
                        <Typography component="h6">
                          Not sure about which speciality to choose?
                        </Typography>
                        <Link
                          to={
                            isSignedIn
                              ? clientRoutes.symptomsTrackerFor()
                              : clientRoutes.symptomsTracker()
                          }
                        >
                          Track your Symptoms
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className={classes.card}>
                    <Typography component="h5">Why Apollo247</Typography>
                    <ul className={classes.cardList}>
                      <li>Verified doctor listing</li>
                      <li>99% +ve feedback</li>
                      <li>Free follow-up session</li>
                      <li>In hac habitasse platea dictumst. Vivamus adipiscing fermentum </li>
                    </ul>
                  </div>
                  <div className={classes.card}>
                    <Typography component="h5">How it works</Typography>
                    <div className={classes.tabsContainer}>
                      <Tabs
                        value={value}
                        onChange={handleTabChange}
                        aria-label="simple tabs example"
                        classes={{
                          root: classes.tabsRoot,
                          indicator: classes.tabsIndicator,
                        }}
                      >
                        <Tab
                          label="Chat/Audio/Video"
                          {...a11yProps(0)}
                          classes={{
                            root: classes.tabRoot,
                            selected: classes.tabSelected,
                          }}
                        />
                        <Tab
                          label="Meet in Person"
                          {...a11yProps(1)}
                          classes={{
                            root: classes.tabRoot,
                            selected: classes.tabSelected,
                          }}
                        />
                      </Tabs>
                      <div className={classes.tabContent}>
                        <TabPanel value={value} index={0}>
                          <div className={classes.chatContainer}>
                            <div className={classes.tabHead}>
                              <img src={require('images/video-calling.svg')} />
                              <Typography component="h6">
                                How to consult via chat/audio/video?
                              </Typography>
                            </div>
                            <div className={classes.tabBody}>
                              <ul className={classes.tabList}>
                                <li>
                                  <img src={require('images/consult-doc.svg')} />
                                  <Typography>Choose the doctor</Typography>
                                </li>
                                <li>
                                  <img src={require('images/slot.svg')} />
                                  <Typography>Book a slot</Typography>
                                </li>
                                <li>
                                  <img src={require('images/ic-payment.svg')} />
                                  <Typography>Make payment</Typography>
                                </li>
                                <li className={classes.highlight}>
                                  <img src={require('images/ic-video.svg')} />
                                  <Typography>Speak to the doctor via video/audio/chat</Typography>
                                </li>
                                <li>
                                  <img src={require('images/prescription.svg')} />
                                  <Typography>Receive prescriptions instantly </Typography>
                                </li>
                                <li className={classes.highlight}>
                                  <img src={require('images/chat.svg')} />
                                  <Typography>
                                    Chat with the doctor for 6 days after your consult
                                  </Typography>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </TabPanel>
                        <TabPanel value={value} index={1}>
                          <div className={classes.tabHead}>
                            <img src={require('images/ic-specialist.svg')} />
                            <Typography component="h6">How to consult in Person?</Typography>
                          </div>
                          <div className={classes.tabBody}>
                            <ul className={classes.tabList}>
                              <li>
                                <img src={require('images/consult-doc.svg')} />
                                <Typography>Choose the doctor</Typography>
                              </li>
                              <li>
                                <img src={require('images/slot.svg')} />
                                <Typography>Book a slot</Typography>
                              </li>
                              <li>
                                <img src={require('images/ic-payment.svg')} />
                                <Typography>Make payment</Typography>
                              </li>
                              <li className={classes.highlight}>
                                <img src={require('images/hospital.svg')} />
                                <Typography>Visit the doctor at Hospital/Clinic</Typography>
                              </li>
                              <li>
                                <img src={require('images/prescription.svg')} />
                                <Typography>Receive prescriptions instantly </Typography>
                              </li>
                            </ul>
                          </div>
                        </TabPanel>
                      </div>
                    </div>
                    <div className={classes.appDetails}>
                      <Typography component="h6">
                        Consultancy works only on our mobile app
                      </Typography>
                      <Typography>
                        To enjoy enhanced consultation experience download our mobile app
                      </Typography>
                      <div className={classes.appDownload}>
                        <img src={require('images/apollo247.png')} />
                        <AphButton>Download the App</AphButton>
                      </div>
                    </div>
                  </div>
                </div>
              </Grid>
            </Grid>
          </div>
          <div className={classes.faq}>
            <Typography component="h2">Frequently asked questions</Typography>
            <ExpansionPanel
              className={classes.panelRoot}
              expanded={expanded === 'panel1'}
              onChange={handleChange('panel1')}
            >
              <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon />}
                classes={{
                  root: classes.panelHeader,
                  content: classes.summaryContent,
                  expandIcon: classes.expandIcon,
                  expanded: classes.panelExpanded,
                }}
              >
                <Typography className={classes.panelHeading} component="h3">
                  How do I book an online consultation?
                </Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails className={classes.panelDetails}>
                <div className={classes.detailsContent}>
                  <Typography>
                    You can book an online consultation either on the website or mobile app of
                    Apollo 24/7 in two ways.
                  </Typography>
                  <ul className={classes.faqList}>
                    <li>
                      Click on the ‘Find a Doctor’ button on the homepage of the website/app, select
                      a specialty or type the name of the doctor directly. Once you select a doctor,
                      you can click on the “Consult Now’ button to start the online consultation.
                    </li>
                    <li>
                      If you're looking for a doctor based on your symptoms, you may start by going
                      to the homepage of the website/app. Then click on the ‘Track Symptoms’ tab,
                      search for your symptoms or select a few of them based on your health
                      condition. Click ‘Show Doctors’, select a doctor and click on the ‘Consult
                      Now’ button to start the online consultation.
                    </li>
                  </ul>
                </div>
              </ExpansionPanelDetails>
            </ExpansionPanel>
            <ExpansionPanel
              className={classes.panelRoot}
              expanded={expanded === 'panel2'}
              onChange={handleChange('panel2')}
            >
              <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon />}
                classes={{
                  root: classes.panelHeader,
                  content: classes.summaryContent,
                  expandIcon: classes.expandIcon,
                  expanded: classes.panelExpanded,
                }}
              >
                <Typography className={classes.panelHeading} component="h3">
                  For how long can I speak to the doctor??
                </Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails className={classes.panelDetails}>
                <div className={classes.detailsContent}>
                  <Typography>
                    Once you book an online consultation on our app, you will get 15 minutes to
                    speak to the doctor. This window can, however, change according to your health
                    condition and the number of queries you have.
                  </Typography>
                </div>
              </ExpansionPanelDetails>
            </ExpansionPanel>
            <ExpansionPanel
              className={classes.panelRoot}
              expanded={expanded === 'panel3'}
              onChange={handleChange('panel3')}
            >
              <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon />}
                classes={{
                  root: classes.panelHeader,
                  content: classes.summaryContent,
                  expandIcon: classes.expandIcon,
                  expanded: classes.panelExpanded,
                }}
              >
                <Typography className={classes.panelHeading} component="h3">
                  How do I book a follow-up session with the same doctor on the app?
                </Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails className={classes.panelDetails}>
                <div className={classes.detailsContent}>
                  <Typography>
                    To book a follow-up session with the same doctor, select the ‘Active
                    Appointments’ tab on the home page or ‘Appointments’ tab on the bottom menu bar
                    of the app. After that, you can click on the ‘Schedule A Follow-Up’ button to
                    book a follow-up consultation. Alternatively, you can also go to ‘Health
                    Records’ section on the app, select ‘Consults &amp; Rx’, select the appointment
                    card and click on the ‘Schedule A Follow-Up’ button.
                  </Typography>
                </div>
              </ExpansionPanelDetails>
            </ExpansionPanel>
          </div>
        </div>
      </div>
      <NavigationBottom />
      <div className={classes.footerLinks}>
        <BottomLinks />
      </div>
      <Cities locationPopup={locationPopup} setLocationPopup={setLocationPopup} />
    </div>
  );
};
