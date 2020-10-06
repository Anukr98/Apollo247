import React, { useState, useEffect, useRef } from 'react';
import {
  Theme,
  Typography,
  Grid,
  CircularProgress,
  Popover,
  useMediaQuery,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import {
  AphSelect,
  AphButton,
  AphInput,
  AphTextField,
  AphDialogTitle,
  AphDialog,
  AphDialogClose,
} from '@aph/web-ui-components';
import { Header } from 'components/Header';
import { BottomLinks } from 'components/BottomLinks';
import { isEmailValid, isNameValid, isMobileNumberValid } from '@aph/universal/dist/aphValidators';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { MascotWithMessage } from '../MascotWithMessage';
import fetchUtil from 'helpers/fetch';
import { Route } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { kavachHelpline } from 'helpers/commonHelpers';
import { MetaTagsComp } from 'MetaTagsComp';

const useStyles = makeStyles((theme: Theme) => {
  return {
    kavachLanding: {
      width: '100%',
    },
    kavachContent: {
      padding: 30,
      background: '#f7f8f5',
      [theme.breakpoints.down('sm')]: {
        padding: '20px 15px',
      },
    },
    container: {
      width: 1064,
      margin: '0 auto',
      [theme.breakpoints.down(1063)]: {
        width: '100%',
      },
      [theme.breakpoints.down('sm')]: {
        width: '100%',
      },
    },
    kavachIntro: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: '#fff',
      borderRadius: 5,
      padding: 15,
      '& h1': {
        fontSize: 50,
        color: '#02475b',
        textTransform: 'uppercase',
        fontWeight: 'bold',
        width: '70%',
        textAlign: 'center',
        '& span': {
          color: '#68919d',
          display: 'block',
          fontSize: 30,
        },
      },
      [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
        justifyContent: 'center',
        '& h1': {
          order: 2,
          width: '100%',
          fontSize: 30,
          '& span': {
            fontSize: 22,
          },
        },
      },
    },
    imgContainer: {
      width: '30%',
      textAlign: 'center',
      '& img': {
        width: 155,
      },
      [theme.breakpoints.down('sm')]: {
        order: 1,
        width: '100%',
      },
    },
    shareDetails: {
      padding: '24px 0',
    },
    kavachBanner: {
      // height: '100%',
      '& img': {
        width: '100%',
        height: '100%',
        borderRadius: 5,
      },
    },
    kavachFormContainer: {
      background: '#fff',
      borderRadius: 10,
      padding: 20,
      boxShadow: ' 0 5px 20px 0 rgba(0, 0, 0, 0.3)',
      '& h2': {
        fontSize: 16,
        fontWeight: 500,
        textAlign: 'center',
        lineHeight: '16px',
      },
      '& button': {
        margin: '20px auto 0',
        width: 180,
        display: 'block',
      },
    },
    formControl: {
      width: '100%',
      margin: '0 0 15px',
      '& svg': {
        color: '#00b38e',
      },
    },
    formInput: {
      margin: '0 0 15px',
    },
    loader: {
      margin: '20px auto',
      textAlign: 'center',
      display: 'block',
    },
    bottomPopover: {
      overflow: 'initial',
      backgroundColor: 'transparent',
      boxShadow: 'none',
    },
    aboutSection: {
      padding: 20,
      background: '#ffffff',
      borderRadius: 5,
      '& h3': {
        fontSize: 23,
        fontWeight: 600,
        margin: '0 0 15px',
      },
      '& p': {
        fontSize: 18,
        fontWeight: 500,
        margin: '0 0 15px',
      },
      '& a': {
        fontSize: 18,
        fontWeight: 700,
        color: '#fc9916',
        textTransform: 'uppercase',
        margin: '10px 0 0',
      },
    },
    covidCare: {
      padding: '20px 0',
    },
    error: {
      color: '#890000',
      margin: '-15px 0 0',
      fontSize: 12,
    },
    card: {
      padding: '20px 15px',
      background: '#ffffff',
      borderRadius: 10,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      minHeight: 210,
      '& h4': {
        fontSize: 18,
        fontWeight: '500',
        margin: '0 0 10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '& img': {
          margin: '0 10px 0 0',
        },
      },
      '& .careList': {
        padding: '0 0 0 20px',
        margin: 0,
        '& li': {
          lineHeight: '20px',
          fontSize: 13,
          fontWeight: 500,
        },
      },
      '& button': {
        margin: '20px auto 0',
        width: '100%',
        display: 'block',
        maxWidth: 300,
      },
    },
    mb20: {
      marginBottom: '20px !important',
    },
    packages: {},
    videoContainer: {
      height: 335,
      borderRadius: 5,
      overflow: 'hidden',
      margin: '20px 0 0',
    },
    embedContainer: {},
    heading: {
      padding: 20,
      background: '#fff',
      borderRadius: 5,
      margin: '20px 0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      '& button': {
        width: 300,
      },
      '& h3': {
        fontSize: 23,
        fontWeight: 700,
        textTransform: 'uppercase',
      },
      [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
        '& h3': {
          margin: '0 0 20px',
        },
      },
    },
    uppercase: {
      textTransform: 'uppercase',
    },
    image: {
      height: 280,
      border: '1px solid #eee',
      borderRadius: 5,
      overflow: 'hidden',
    },
    homeCare: {
      '& h4': {
        fontSize: '23px !important',
        fontWeight: 600,
      },
      '& .careList': {
        padding: '0 0 0 20px',
      },
    },
    gridContainer: {
      [theme.breakpoints.down('sm')]: {
        margin: '20px 0 0',
      },
    },
    gridItem: {
      [theme.breakpoints.down('sm')]: {
        padding: '0 10px !important',
      },
    },
    faq: {
      padding: 20,
      background: '#fff',
      borderRadius: 5,
      margin: '20px 0 0',
      '& h6': {
        fontSize: 14,
        fontWeight: 500,
        margin: '0 0 20px',
      },
    },
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
        fontSize: 12,
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
      '& li': {
        fontSize: 12,
        lineHeight: '20px',
      },
    },
    fontBold: {
      fontWeight: 700,
    },
    expansionContainer: {
      height: 500,
      overflow: 'hidden',
    },
    seeMore: {
      textAlign: 'center',
      display: 'block',
      fontSize: 13,
      color: '#fcb716',
      margin: '10px 0 0',
      fontWeight: 'bold',
    },

    heightAuto: {
      height: 'auto !important',
    },
    selectEmpty: {
      fontSize: 16,
      color: '#02475b',
      fontWeight: 500,
      '& div': {
        '&:focus': {
          background: 'none',
        },
      },
      '&:hover': {
        '&:before': {
          borderColor: ' #00b38e !important',
        },
      },
      '&:before': {
        borderBottom: '2px solid #00b38e',
      },
      '&:after': {
        display: 'none',
      },
    },
    expertBox: {
      padding: 20,
      textAlign: 'center',
      '& h2': {
        fontSize: 16,
        margin: 0,
      },
      '& a': {
        fontSize: 14,
        paddingTop: 5,
        display: 'inline-block',
        color: '#0087ba',
        fontWeight: 500,
      },
      '& button': {
        marginTop: 20,
      },
    },
  };
});

const KavachLanding: React.FC = (props) => {
  const classes = useStyles({});

  interface ServicesLocationsInterface {
    [key: string]: any;
  }

  const [expanded, setExpanded] = React.useState<string | false>(false);
  const [location, setLocation] = React.useState('');
  const [service, setService] = React.useState('');
  const [showmore, setShowmore] = React.useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [userMobileNumber, setUserMobileNumber] = useState<string>('');
  const [isPostSubmitDisable, setIsPostSubmitDisable] = useState<boolean>(true);
  const [emailValid, setEmailValid] = useState<boolean>(true);
  const [userNameValid, setUserNameValid] = useState<boolean>(true);
  const [mobileNumberValid, setMobileNumberValid] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const [serviceOptions, setServiceOptions] = useState<any>([]);
  const [locationOptions, setLocationOptions] = useState<any>([]);
  const [servicesLocations, setServicesLocations] = useState<ServicesLocationsInterface>({});
  const scrollToRef = useRef<HTMLDivElement>(null);
  const [iscoronaDialogOpen, setIscoronaDialogOpen] = useState<boolean>(false);
  const isDesktopOnly = useMediaQuery('(min-width:768px)');

  useEffect(() => {
    fetchUtil(process.env.KAVACH_SERVICES_LOCATIONS_URL, 'GET', {}, '', true)
      .then((res: any) => {
        if (res && res.data) {
          setServicesLocations(res.data);
          const services = Object.keys(res.data);
          setServiceOptions(services);
          const locations = [].concat(...Object.values(res.data));
          const removeDuplicates = (data: {
            filter: (arg0: (value: any, index: any) => boolean) => void;
            indexOf: (arg0: any) => void;
          }) => data.filter((value: any, index: any) => data.indexOf(value) === index);
          setLocationOptions(removeDuplicates(locations));
        }
      })
      .catch((err) => console.log(err));
  }, []);
  useEffect(() => {
    scrollToRef &&
      scrollToRef.current &&
      scrollToRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
  }, []);

  useEffect(() => {
    if (
      isEmailValid(userEmail) &&
      isNameValid(userName) &&
      isMobileNumberValid(userMobileNumber) &&
      location &&
      location.length &&
      service &&
      service.length
    ) {
      setIsPostSubmitDisable(false);
    } else {
      setIsPostSubmitDisable(true);
    }
  }, [userEmail, userName, location, userMobileNumber, service]);

  const handleEmailValidityCheck = () => {
    if (userEmail.length && !isEmailValid(userEmail)) {
      setEmailValid(false);
    } else {
      setEmailValid(true);
    }
  };

  const handleNameChange = (ev: any) => {
    if (isNameValid(ev && ev.target.value)) {
      setUserNameValid(true);
    } else {
      setUserNameValid(false);
    }
    setUserName(ev && ev.target.value);
  };

  const handleMobileNumberChange = (ev: any) => {
    if (isMobileNumberValid(ev && ev.target.value)) {
      setMobileNumberValid(true);
    } else {
      setMobileNumberValid(false);
    }
    setUserMobileNumber(ev && ev.target.value);
  };

  const handleChange = (panel: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleSelectChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setLocation(event.target.value as string);
    const services = Object.keys(servicesLocations).map((service) => {
      if (servicesLocations[service].includes(event.target.value)) {
        return service;
      }
    });
    setServiceOptions(services);
  };

  const handleServiceChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setService(event.target.value as string);
    setLocationOptions(servicesLocations[event.target.value as string]);
  };

  const submitKavachForm = () => {
    setIsLoading(true);
    const userData = {
      fullName: userName,
      mobileNumber: userMobileNumber,
      email: userEmail,
      location,
      stayAt: service,
    };
    fetchUtil(process.env.KAVACH_FORM_SUBMIT_URL, 'POST', userData, '', true).then((res: any) => {
      if (res && res.success) {
        setUserEmail('');
        setUserMobileNumber('');
        setUserName('');
        setLocation('');
        setIsPopoverOpen(true);
        setService('');
      } else {
        alert('something went wrong');
      }
      setIsLoading(false);
    });
  };

  const metaTagProps = {
    title: 'Apollo Project Kavach - Protection from Covid-19, Covid19 Isolation Facilities',
    description:
      'Project Kavach is a comprehensive & an integrated response for Protection against COVID-19. Apollo Group offers medically supervised rooms as isolation facilities at hotels. Apollo will take care of you if you need supervision at home, hotel or at Apollo Fever Clinics. Apollo also offers Corona Kit - which includes Pulse Oximeter, Thermometer, Masks, Sanitizers, Disinfectant Spray & other essential Products.',
    canonicalLink: window && window.location && window.location.href,
    src: process.env.KAVACH_LANDING_SCRIPT_URL || '',
    keywords:
      'Covid Isolation Facilities, Hotel Stay for Covid Patients, Pulse Oximeter, Project Kavach',
  };

  return (
    <div className={classes.kavachLanding}>
      <MetaTagsComp {...metaTagProps} />
      <Header />
      <div className={classes.container}>
        <div className={classes.kavachContent}>
          <div className={classes.kavachIntro} ref={scrollToRef}>
            <Typography component="h1">
              Keeping you safe from Covid. Always
              <span> Helpline No.: 1860-500-0202</span>
            </Typography>
            <div className={classes.imgContainer}>
              <img src={require('images/apollo-kavach.png')} />
            </div>
          </div>
          <div className={classes.shareDetails}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <div className={classes.kavachBanner}>
                  <img src={require('images/corona-banner.png')} />
                </div>
              </Grid>
              <Grid item xs={12} md={4}>
                <div className={classes.kavachFormContainer}>
                  <Typography component="h2">Share your details</Typography>
                  <form>
                    <AphTextField
                      onChange={(event: any) => handleNameChange(event)}
                      value={userName}
                      placeholder="Name"
                      className={classes.formInput}
                    />
                    {!userNameValid && <div className={classes.error}>Invalid name</div>}

                    <AphTextField
                      onChange={(event: any) => handleMobileNumberChange(event)}
                      value={userMobileNumber}
                      inputProps={{
                        maxLength: 10,
                      }}
                      placeholder="Mobile Number"
                      className={classes.formInput}
                    />
                    {!mobileNumberValid && (
                      <div className={classes.error}>Invalid Mobile Number</div>
                    )}

                    <AphTextField
                      placeholder="Email"
                      onChange={(event: { target: { value: React.SetStateAction<string> } }) =>
                        setUserEmail(event.target.value)
                      }
                      value={userEmail}
                      onBlur={handleEmailValidityCheck}
                      className={classes.formInput}
                    />
                    {!emailValid && <div className={classes.error}>Invalid email</div>}

                    <FormControl className={classes.formControl}>
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={location}
                        onChange={(e) => handleSelectChange(e)}
                        displayEmpty
                        className={classes.selectEmpty}
                        inputProps={{ 'aria-label': 'Without label' }}
                      >
                        <MenuItem value="" disabled>
                          Select location
                        </MenuItem>
                        {locationOptions.map((location: string) => (
                          <MenuItem value={location}>{location}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl className={classes.formControl}>
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={service}
                        onChange={(e) => handleServiceChange(e)}
                        displayEmpty
                        className={classes.selectEmpty}
                        inputProps={{ 'aria-label': 'Without label' }}
                      >
                        <MenuItem value="" disabled>
                          Service Type
                        </MenuItem>
                        {serviceOptions.map((service: string) => (
                          <MenuItem value={service}>{service}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {!isLoading ? (
                      <AphButton
                        disabled={isPostSubmitDisable}
                        onClick={() => submitKavachForm()}
                        variant="contained"
                        color="primary"
                      >
                        Get In Touch
                      </AphButton>
                    ) : (
                      <div className={classes.loader}>
                        <CircularProgress />
                      </div>
                    )}
                  </form>
                </div>
                <Popover
                  open={isPopoverOpen}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  classes={{ paper: classes.bottomPopover }}
                >
                  <MascotWithMessage
                    messageTitle=""
                    message="Thank you for contacting Team Kavach. We will call you back very soon. 
                    #ExpertiseIsForEveryone"
                    closeButtonLabel="OK"
                    closeMascot={() => {
                      setIsPopoverOpen(false);
                    }}
                    // refreshPage
                  />
                </Popover>
              </Grid>
            </Grid>
          </div>
          <div className={classes.aboutSection}>
            <Typography component="h3">About Apollo Kavach Program</Typography>
            <Typography>
              As the number of COVID-19 cases continue to rise, so does our effort in combating the
              pandemic. Introducing Project Kavach - a comprehensive and integrated response plan to
              keep you safe against the Coronavirus.
            </Typography>
            <Typography>
              Using our strong digital backbone, our prowess in telemedicine, and robust COVID-19
              protocols, the Apollo Kavach initiative offers you 360-degree protection.
            </Typography>
            <a
              href="https://cms.apollo247.com/sites/default/files/ApolloHomeKavachBrochure.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              Download Apollo Kavach Brochure Here
            </a>
          </div>
          <div className={classes.covidCare}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <div className={`${classes.card} ${classes.mb20}`}>
                  <Typography component="h4">
                    <img src={require('images/stay-i.png')} /> at home
                  </Typography>
                  <ul className="careList">
                    <li>Clinical needs </li>
                    <li>Mobility and lung therapy</li>
                    <li>Nutrition and immunity</li>
                    <li>Mental health and wellness</li>
                    <li>Education to care giver and other family members</li>
                    <li>Motivation and positive thinking to ease anxiety and fears</li>
                    <li>
                      Support services for medications, consumables, diagnostics, and referrals to
                      hospital
                    </li>
                  </ul>
                </div>
                <div className={classes.card}>
                  <Typography component="h4" className={classes.uppercase}>
                    Doctor Connect
                  </Typography>
                  <ul className="careList">
                    <li>Medical advisory service by our doctors</li>
                    <li>Available round the clock</li>
                    <li>
                      Immediate telephone access to Apollo’s physicians for seeking advice on
                      COVID-19
                    </li>
                    <li>Get prescriptions over SMS</li>
                  </ul>
                  <a href={isDesktopOnly ? '#' : `tel:${kavachHelpline}`}>
                    <AphButton
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        isDesktopOnly ? setIscoronaDialogOpen(true) : '';
                      }}
                    >
                      Call Now
                    </AphButton>
                  </a>
                </div>
              </Grid>
              <Grid item xs={12} md={8}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <div className={classes.card}>
                      <Typography component="h4">
                        <img src={require('images/stay-i.png')} /> hotel
                      </Typography>
                      <ul className="careList">
                        <li>Medically supervised rooms</li>
                        <li>All meals in a day covered</li>
                        <li>Round-the-clock care</li>
                        <li>Laundry and maintenance services</li>
                        <li>Ensured early intervention</li>
                        <li>Decreased risk of adverse outcomes</li>
                      </ul>
                    </div>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <div className={classes.card}>
                      <Typography component="h4" className={classes.mb20}>
                        Fever Clinic
                      </Typography>
                      <ul className="careList">
                        <li>Consultations by appointment</li>
                        <li>Efficient screening</li>
                        <li>Fast tracked consultation</li>
                        <li>Accurate diagnosis and effective treatment</li>
                      </ul>
                    </div>
                  </Grid>
                </Grid>
                <div className={classes.packages}></div>
                <div className={classes.embedContainer}>
                  <div className={classes.videoContainer}>
                    <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      allowFullScreen
                      src="https://www.youtube.com/embed/vTEJT52hNRw"
                      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                    ></iframe>
                  </div>
                </div>
              </Grid>
            </Grid>
          </div>
          <div className={classes.heading}>
            <Typography component="h3">Basic &amp; Advanced Packages To Suit All Needs</Typography>
            <a href={isDesktopOnly ? '#' : `tel:${kavachHelpline}`}>
              <AphButton
                color="primary"
                variant="contained"
                onClick={() => {
                  isDesktopOnly ? setIscoronaDialogOpen(true) : '';
                }}
              >
                Call Now
              </AphButton>
            </a>
          </div>
          <div className={classes.homeCare}>
            <div className={classes.card}>
              <Typography component="h4">The Covid Care Home Kit</Typography>
              <Grid container spacing={2} className={classes.gridContainer}>
                <Grid item xs={12} md={4} className={classes.gridItem}>
                  <ul className="careList">
                    <li>Digital thermometer for temperature checks</li>
                    <li>Pulse Oximeter to monitor blood oxygen levels &amp; heart rate</li>
                    <li>Incentive Spirometer for breathing exercises</li>
                    <li>Spiral note pad &amp; pen for record-keeping</li>
                  </ul>
                </Grid>
                <Grid item xs={12} md={4} className={classes.gridItem}>
                  <ul className="careList">
                    <li>3 ply face mask for infection prevention</li>
                    <li>Examination gloves for infection prevention</li>
                    <li>Paper gloves for infection prevention</li>
                    <li>Sanitizer - 500 ML for hand hygiene</li>
                  </ul>
                </Grid>
                <Grid item xs={12} md={4} className={classes.gridItem}>
                  <ul className="careList">
                    <li>Surface disinfectant for surface sanitisation</li>
                    <li>Anti-bacterial wipes for smaller surfaces like mobile phones</li>
                    <li>Waste disposal bags for laundry &amp; waste collection</li>
                  </ul>
                </Grid>
              </Grid>
              <Route
                render={({ history }) => (
                  <AphButton
                    onClick={() =>
                      history.push(clientRoutes.searchByMedicine('corona-virus-care', '1891'))
                    }
                    variant="contained"
                    color="primary"
                  >
                    Buy Now
                  </AphButton>
                )}
              />
            </div>
          </div>
          {/* <div className={classes.image}></div> */}
          <div className={classes.faq}>
            <Typography component="h6" className={classes.uppercase}>
              Frequently Asked Questions
            </Typography>
            <div className={` ${classes.expansionContainer} ${showmore ? classes.heightAuto : ''}`}>
              <ExpansionPanel
                expanded={expanded === 'panel1'}
                onChange={handleChange('panel1')}
                className={classes.panelRoot}
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
                  <Typography className={classes.panelHeading}>What is Stay I@HOME?</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panelDetails}>
                  <div className={classes.detailsContent}>
                    <Typography>
                      Stay I@HOME is a monitored home isolation service offered by Apollo Homecare.
                      The services are based on the latest guidelines from Indian Council of Medical
                      Research (ICMR)/ Ministry of Health and Family Welfare (MoHFW), which
                      recommends home isolation for patients who are pre-symptomatic or have very
                      mild symptoms, and are either positive or suspected of COVID-19.
                    </Typography>
                  </div>
                </ExpansionPanelDetails>
              </ExpansionPanel>
              <ExpansionPanel
                expanded={expanded === 'panel2'}
                onChange={handleChange('panel2')}
                className={classes.panelRoot}
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
                  <Typography className={classes.panelHeading}>
                    What are the benefits of Stay I@HOME?
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panelDetails}>
                  <div className={classes.detailsContent}>
                    <ul className={classes.faqList}>
                      <li>Helps reduce the risk of transmission to family members</li>
                      <li>
                        Monitored home isolation for better compliance, adhering to all the
                        guidelines
                      </li>
                      <li>
                        Ensures early intervention, if any new symptoms or signs are developing
                        throughout the isolation period.
                      </li>
                      <li>Reduces the risk of adverse outcomes</li>
                    </ul>
                  </div>
                </ExpansionPanelDetails>
              </ExpansionPanel>
              <ExpansionPanel
                expanded={expanded === 'panel3'}
                onChange={handleChange('panel3')}
                className={classes.panelRoot}
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
                  <Typography className={classes.panelHeading}>
                    What will I get in the Isolation Kit?
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panelDetails}>
                  <div className={classes.detailsContent}>
                    <Typography>The Isolation Kit contains a</Typography>
                    <ul className={classes.faqList}>
                      <li>Digital Thermometer</li>
                      <li> Pulse Oximeter</li>
                      <li> Incentive Spirometer</li>
                      <li> 3 ply mask</li>
                      <li> Examination gloves</li>
                      <li> Paper gloves</li>
                      <li> Sanitizer (500 ML)</li>
                      <li> Surface disinfectant</li>
                      <li>Anti-bacterial wipes</li>
                      <li>Waste disposal bags</li>
                      <li>Spiral note pad and pen</li>
                    </ul>
                  </div>
                </ExpansionPanelDetails>
              </ExpansionPanel>
              <ExpansionPanel
                expanded={expanded === 'panel4'}
                onChange={handleChange('panel4')}
                className={classes.panelRoot}
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
                  <Typography className={classes.panelHeading}>
                    What is the duration of Stay I@HOME?
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panelDetails}>
                  <div className={classes.detailsContent}>
                    <Typography>The duration of Stay I@HOME is 14 days.</Typography>
                  </div>
                </ExpansionPanelDetails>
              </ExpansionPanel>
              <ExpansionPanel
                expanded={expanded === 'panel5'}
                onChange={handleChange('panel5')}
                className={classes.panelRoot}
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
                  <Typography className={classes.panelHeading}>
                    What is Basic Plan and Advance Plan?
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panelDetails}>
                  <div className={classes.detailsContent}>
                    <Typography>
                      In the<span className={classes.fontBold}> Basic Plan, </span> every alternate
                      day the patient will get consultation with the physician through a video call
                      and a tele-call with the COVID Care Coordinator every day.
                    </Typography>
                    <Typography>
                      In the<span className={classes.fontBold}> Advance Plan, </span> the patient
                      will get consultation with the physician through a video call every alternate
                      day, a tele-call with the COVID Care Coordinator every day, a video call from
                      the Engagement and Motivation Team every alternate day, Tele-Rehab daily in
                      week-1 and alternate day in week-2, and consultation with a Dietician and
                      Counsellor once a week.
                    </Typography>
                  </div>
                </ExpansionPanelDetails>
              </ExpansionPanel>
              <ExpansionPanel
                expanded={expanded === 'panel6'}
                onChange={handleChange('panel6')}
                className={classes.panelRoot}
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
                  <Typography className={classes.panelHeading}>
                    Will there be any physical visit by the doctor?
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panelDetails}>
                  <div className={classes.detailsContent}>
                    <Typography>
                      No. There will be no physical visits by the doctor. Instead, the doctor will
                      speak to you through a video call.
                    </Typography>
                  </div>
                </ExpansionPanelDetails>
              </ExpansionPanel>
              <ExpansionPanel
                expanded={expanded === 'panel7'}
                onChange={handleChange('panel7')}
                className={classes.panelRoot}
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
                  <Typography className={classes.panelHeading}>
                    Will there be any care giver provided to the patient at home?
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panelDetails}>
                  <div className={classes.detailsContent}>
                    <Typography>
                      No, you will have to identify the care giver who will need to follow the
                      guidelines provided.
                    </Typography>
                  </div>
                </ExpansionPanelDetails>
              </ExpansionPanel>
              <ExpansionPanel
                expanded={expanded === 'panel8'}
                onChange={handleChange('panel8')}
                className={classes.panelRoot}
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
                  <Typography className={classes.panelHeading}>
                    Whom can I reach in case of an emergency?
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panelDetails}>
                  <div className={classes.detailsContent}>
                    <Typography>
                      You can reach out to the COVID Care Coordinator for any emergencies. You can
                      also reach out to us at our helpline number - 1800-102-8586.
                    </Typography>
                  </div>
                </ExpansionPanelDetails>
              </ExpansionPanel>
              <ExpansionPanel
                expanded={expanded === 'panel9'}
                onChange={handleChange('panel9')}
                className={classes.panelRoot}
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
                  <Typography className={classes.panelHeading}>
                    In which cities are the services provided?
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panelDetails}>
                  <div className={classes.detailsContent}>
                    <Typography>
                      These services are available in Hyderabad, Delhi, Chennai, Bangalore, and
                      Kolkata.
                    </Typography>
                  </div>
                </ExpansionPanelDetails>
              </ExpansionPanel>
              <ExpansionPanel
                expanded={expanded === 'panel10'}
                onChange={handleChange('panel10')}
                className={classes.panelRoot}
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
                  <Typography className={classes.panelHeading}>
                    What is the payment process?
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panelDetails}>
                  <div className={classes.detailsContent}>
                    <Typography>
                      All online payment modes such as Google Pay, Paytm, PayU Money, etc. are
                      accepted to pay for the services.
                    </Typography>
                  </div>
                </ExpansionPanelDetails>
              </ExpansionPanel>
              <ExpansionPanel
                expanded={expanded === 'panel11'}
                onChange={handleChange('panel11')}
                className={classes.panelRoot}
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
                  <Typography className={classes.panelHeading}>
                    What are the prices of the Basic Plan and Advance Plan?
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panelDetails}>
                  <div className={classes.detailsContent}>
                    <Typography>
                      The <span className={classes.fontBold}>Basic Plan</span> will cost Rs.300 per
                      day (Rs. 4200 for 14 days) and Isolation Kit will cost Rs. 6000. Hence, the
                      total package will cost you Rs. 10200.
                    </Typography>
                    <Typography>
                      The <span className={classes.fontBold}>Advance Plan</span> will cost Rs.600
                      per day (Rs. 8400 for 14 days) and Isolation Kit will cost Rs.6000. Hence, the
                      total package will cost you Rs. 14,400.
                    </Typography>
                  </div>
                </ExpansionPanelDetails>
              </ExpansionPanel>
              <ExpansionPanel
                expanded={expanded === 'panel12'}
                onChange={handleChange('panel12')}
                className={classes.panelRoot}
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
                  <Typography className={classes.panelHeading}>
                    By when will my Isolation Kit be delivered?
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panelDetails}>
                  <div className={classes.detailsContent}>
                    <Typography>
                      Once the payment is received, you will receive your Isolation Kit within 6
                      hours.
                    </Typography>
                  </div>
                </ExpansionPanelDetails>
              </ExpansionPanel>
              <ExpansionPanel
                expanded={expanded === 'panel14'}
                onChange={handleChange('panel14')}
                className={classes.panelRoot}
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
                  <Typography className={classes.panelHeading}>
                    Why should I choose Stay I@HOME?
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panelDetails}>
                  <div className={classes.detailsContent}>
                    <ul className={classes.faqList}>
                      <li>Affordable pricing</li>
                      <li> Package based on ICMR guidelines</li>
                      <li> Highly experienced team of doctors for your care.</li>
                    </ul>
                  </div>
                </ExpansionPanelDetails>
              </ExpansionPanel>
              <ExpansionPanel
                expanded={expanded === 'panel15'}
                onChange={handleChange('panel15')}
                className={classes.panelRoot}
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
                  <Typography className={classes.panelHeading}>
                    What is required from the patient?
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panelDetails}>
                  <div className={classes.detailsContent}>
                    <Typography>
                      A care giver to take care of the patient, a smart phone with good internet
                      connectivity, and an isolation room for patient are the requirements from the
                      patient’s side.
                    </Typography>
                  </div>
                </ExpansionPanelDetails>
              </ExpansionPanel>
              <ExpansionPanel
                expanded={expanded === 'panel16'}
                onChange={handleChange('panel16')}
                className={classes.panelRoot}
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
                  <Typography className={classes.panelHeading}>
                    Why is there a charge when the government hospitals are offering these services
                    for free?
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panelDetails}>
                  <div className={classes.detailsContent}>
                    <Typography>
                      These services are chargeable because these are private hotels that agreed and
                      partnered to increase the capability of controlling the situation. This step
                      has been taken for everyone's comfort. As self-isolation was a suggestion to
                      control the symptoms of COVID-19, in case there is no scope for you to
                      self-quarantine, these facilities will support as quarantine facilities.
                    </Typography>
                  </div>
                </ExpansionPanelDetails>
              </ExpansionPanel>
              <ExpansionPanel
                expanded={expanded === 'panel17'}
                onChange={handleChange('panel17')}
                className={classes.panelRoot}
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
                  <Typography className={classes.panelHeading}>
                    What are the facilities I can expect from the rooms?
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panelDetails}>
                  <div className={classes.detailsContent}>
                    <Typography>
                      The rooms will be clean, hygienic and comfortable. The rooms will be
                      air-conditioned with Wi-fi connectivity. There will be a television for
                      entertainment. Toiletries and consumables for self-cleaning and maintaining
                      hygiene as well as masks and gloves will be provided.
                    </Typography>
                  </div>
                </ExpansionPanelDetails>
              </ExpansionPanel>
              <ExpansionPanel
                expanded={expanded === 'panel18'}
                onChange={handleChange('panel18')}
                className={classes.panelRoot}
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
                  <Typography className={classes.panelHeading}>
                    What are the things I need to carry to the facility?
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panelDetails}>
                  <div className={classes.detailsContent}>
                    <Typography>
                      Upon booking confirmation, you will receive an email with all the
                      pre-requisites and things you will have to carry to the facility.
                    </Typography>
                  </div>
                </ExpansionPanelDetails>
              </ExpansionPanel>
              <ExpansionPanel
                expanded={expanded === 'panel19'}
                onChange={handleChange('panel19')}
                className={classes.panelRoot}
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
                  <Typography className={classes.panelHeading}>
                    What if the guest requires medicines?
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panelDetails}>
                  <div className={classes.detailsContent}>
                    <Typography>
                      Medicines will be delivered to the guest as and when required as per the
                      prescription.
                    </Typography>
                  </div>
                </ExpansionPanelDetails>
              </ExpansionPanel>
              <ExpansionPanel
                expanded={expanded === 'panel20'}
                onChange={handleChange('panel20')}
                className={classes.panelRoot}
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
                  <Typography className={classes.panelHeading}>
                    Will food be provided at the facility? Is home food allowed?
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panelDetails}>
                  <div className={classes.detailsContent}>
                    <Typography>
                      We have tied-up with Zomato as our food delivery partner who will provide 3
                      meals a day - breakfast, lunch and dinner, at the facility (included in room
                      rent).
                    </Typography>
                  </div>
                </ExpansionPanelDetails>
              </ExpansionPanel>
              <ExpansionPanel
                expanded={expanded === 'panel21'}
                onChange={handleChange('panel21')}
                className={classes.panelRoot}
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
                  <Typography className={classes.panelHeading}>
                    Will the room be cleaned on a regular basis during a guest’s stay?
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panelDetails}>
                  <div className={classes.detailsContent}>
                    <Typography>
                      The guest is encouraged to self-clean the room and clean and disinfect
                      surfaces such as bedside tables, bed frames and other bedroom furniture daily
                      with regular household disinfectant containing a diluted bleach solution. For
                      surfaces that cannot be cleaned with bleach, 70% ethanol can be used. Guests
                      should clean and disinfect bathroom and toilet surfaces at least once daily
                      with regular household disinfectant. They should wear disposable gloves when
                      cleaning surfaces or handling clothing or linen soiled with body fluids, and
                      they should perform hand hygiene before putting on and after removing their
                      gloves.
                    </Typography>
                  </div>
                </ExpansionPanelDetails>
              </ExpansionPanel>
              <ExpansionPanel
                expanded={expanded === 'panel22'}
                onChange={handleChange('panel22')}
                className={classes.panelRoot}
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
                  <Typography className={classes.panelHeading}>
                    Will there be a provision for laundry?
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panelDetails}>
                  <div className={classes.detailsContent}>
                    <Typography>
                      There will be no provision for laundry. Guests will have to get clothes for
                      two week stay. At the end of stay, guests will have to bundle the soiled
                      clothing and will be instructed on the washing protocols for washing the
                      garments at home.
                    </Typography>
                  </div>
                </ExpansionPanelDetails>
              </ExpansionPanel>
              <ExpansionPanel
                expanded={expanded === 'panel23'}
                onChange={handleChange('panel23')}
                className={classes.panelRoot}
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
                  <Typography className={classes.panelHeading}>
                    What if the room needs to be cleaned or something needs to be repaired?
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panelDetails}>
                  <div className={classes.detailsContent}>
                    <Typography>
                      The same will be attended to by respective housekeeping or repair and
                      maintenance personnel wearing PPE including disposable gloves, water resistant
                      gown, and N -95 mask. Guests to wear PPE and remain in the room at that time.
                    </Typography>
                  </div>
                </ExpansionPanelDetails>
              </ExpansionPanel>
              <ExpansionPanel
                expanded={expanded === 'panel24'}
                onChange={handleChange('panel24')}
                className={classes.panelRoot}
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
                  <Typography className={classes.panelHeading}>
                    Will rooms be cleaned after the guest checks out?
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panelDetails}>
                  <div className={classes.detailsContent}>
                    <Typography>
                      Yes. After checkout, the room will be completely cleaned and disinfected by
                      trained housekeeping personnel wearing PPE.
                    </Typography>
                  </div>
                </ExpansionPanelDetails>
              </ExpansionPanel>
              <ExpansionPanel
                expanded={expanded === 'panel25'}
                onChange={handleChange('panel25')}
                className={classes.panelRoot}
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
                  <Typography className={classes.panelHeading}>
                    What are the Do’s and Dont’s should the guest observe during the day?
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panelDetails}>
                  <div className={classes.detailsContent}>
                    <ul className={classes.faqList}>
                      <li>
                        Guests are not permitted to step out of the room. If needed, they should
                        contact the on duty staff at the facility and wait for instructions.
                      </li>
                      <li>Guests should switch off the electronic devices if not needed.</li>
                      <li>
                        No visitors will be allowed. In case of an emergency, the in-house nurse /
                        health supervisor to approve and guest to wear the necessary PPE before
                        stepping out.
                      </li>
                      <li>
                        Guests should put the used disposable plates properly inside the disposable
                        bags and keep them outside the room. They must use the dustbins kept in the
                        rooms for collecting all garbage during the day/ night.
                      </li>
                      <li>Guests should keep the doors closed.</li>
                      <li>Guests will not be permitted into the kitchen and washing area</li>
                    </ul>
                  </div>
                </ExpansionPanelDetails>
              </ExpansionPanel>
              <ExpansionPanel
                expanded={expanded === 'panel26'}
                onChange={handleChange('panel26')}
                className={classes.panelRoot}
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
                  <Typography className={classes.panelHeading}>
                    What is the USP of the kit?
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panelDetails}>
                  <div className={classes.detailsContent}>
                    <ul className={classes.faqList}>
                      <li>Addresses the need of both care provider and the patient.</li>
                      <li>
                        It covers all the elements from the point of view of vitals monitoring,
                        infection control, prevention of spread, proper waste disposal elements,
                        education to patient and family members as laid down by the guidelines for
                        home isolation.
                      </li>
                    </ul>
                  </div>
                </ExpansionPanelDetails>
              </ExpansionPanel>
              <ExpansionPanel
                expanded={expanded === 'panel27'}
                onChange={handleChange('panel27')}
                className={classes.panelRoot}
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
                  <Typography className={classes.panelHeading}>
                    Is it mandatory to buy the kit?
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panelDetails}>
                  <div className={classes.detailsContent}>
                    <Typography>
                      Yes. Without this we cannot ensure protection of the patient and the other
                      family members and we will not be able to get the vital parameters data from
                      the patient.
                    </Typography>
                  </div>
                </ExpansionPanelDetails>
              </ExpansionPanel>
              <ExpansionPanel
                expanded={expanded === 'panel28'}
                onChange={handleChange('panel28')}
                className={classes.panelRoot}
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
                  <Typography className={classes.panelHeading}>
                    Can I exclude some components of the kit as per my requirement?
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panelDetails}>
                  <div className={classes.detailsContent}>
                    <Typography>
                      No it is a bundled package. Similarly, the duration of the program cannot be
                      altered to anything less than 14 days.
                    </Typography>
                  </div>
                </ExpansionPanelDetails>
              </ExpansionPanel>
              <ExpansionPanel
                expanded={expanded === 'panel29'}
                onChange={handleChange('panel29')}
                className={classes.panelRoot}
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
                  <Typography className={classes.panelHeading}>
                    How do I choose between Home and Facility isolation options?
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panelDetails}>
                  <div className={classes.detailsContent}>
                    <Typography>
                      <span className={classes.fontBold}>Home - </span> more cost effective,
                      convenient and can be availed if you have:
                    </Typography>
                    <ul className={`${classes.faqList} ${classes.mb20}`}>
                      <li>A separate room for isolation</li>
                      <li>There is a care provider available to assist</li>
                      <li>You have Wi-Fi/net connectivity available to you</li>
                    </ul>
                    <Typography>
                      <span className={classes.fontBold}>Facility - </span> If you are alone or
                      there is no separate room for isolation or there is no support for routine
                      things like meals etc., at home, then it is suggested for you to have facility
                      isolation.
                    </Typography>
                    <Typography>
                      In case there are more than 1 senior citizen’s or at risk family members at
                      home, Stay I@Facility is recommended.
                    </Typography>
                  </div>
                </ExpansionPanelDetails>
              </ExpansionPanel>
            </div>
            <a
              href="javascript:void(0);"
              className={classes.seeMore}
              onClick={() => setShowmore(!showmore)}
            >
              {showmore ? <span>See Less</span> : <span>See More</span>}
            </a>
          </div>
        </div>
      </div>
      <BottomLinks />
      <AphDialog open={iscoronaDialogOpen} maxWidth="sm">
        <AphDialogClose onClick={() => setIscoronaDialogOpen(false)} title={'Close'} />
        <AphDialogTitle></AphDialogTitle>
        <div className={classes.expertBox}>
          <h2>CORONAVIRUS? Talk to our expert.</h2>
          <a href={`tel:${kavachHelpline}`}>Call 1860-500-0202 in emergency</a>
          <AphButton onClick={() => setIscoronaDialogOpen(false)} color="primary">
            Ok, Got It
          </AphButton>
        </div>
      </AphDialog>
    </div>
  );
};

export default KavachLanding;
