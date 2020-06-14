import React, { useState, useEffect } from 'react';
import { Theme, Typography, Grid, CircularProgress, Popover } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { AphSelect, AphButton, AphInput, AphTextField } from '@aph/web-ui-components';
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

const useStyles = makeStyles((theme: Theme) => {
  return {
    kavachLanding: {},
    kavachContent: {
      padding: 30,
      background: '#f7f8f5',
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
      },
      [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
        justifyContent: 'center',
        '& h1': {
          order: 2,
          width: '100%',
          fontSize: 30,
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
      // height: 310,
      border: '1px solid #eee',
      borderRadius: 5,
      overflow: 'hidden',
      '& img': {
        width: '100%',
        height: '100%',
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
    },
    mb20: {
      marginBottom: 20,
    },
    packages: {},
    videoContainer: {
      height: 360,
      borderRadius: 5,
      overflow: 'hidden',
    },
    embedContainer: {},
    heading: {
      padding: 10,
      background: '#fff',
      borderRadius: 5,
      margin: '20px 0',
      textAlign: 'center',
      '& h3': {
        fontSize: 23,
        fontWeight: 700,
        textTransform: 'uppercase',
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
    stayI: {
      width: 109,
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
  };
});

export const KavachLanding: React.FC = (props) => {
  const classes = useStyles({});
  const [expanded, setExpanded] = React.useState<string | false>(false);
  const [location, setLocation] = React.useState('');
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

  useEffect(() => {
    if (
      isEmailValid(userEmail) &&
      isNameValid(userName) &&
      isMobileNumberValid(userMobileNumber) &&
      location &&
      location.length
    ) {
      setIsPostSubmitDisable(false);
    } else {
      setIsPostSubmitDisable(true);
    }
  }, [userEmail, userName, location, userMobileNumber]);

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
  };

  const submitKavachForm = () => {
    console.log('make api call');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsPopoverOpen(true);
    }, 4000);
  };
  return (
    <div className={classes.kavachLanding}>
      <Header />
      <div className={classes.container}>
        <div className={classes.kavachContent}>
          <div className={classes.kavachIntro}>
            <Typography component="h1">Keeping you safe from Covid. Always</Typography>
            <div className={classes.imgContainer}>
              <img src={require('images/apollo-kavach.png')} />
            </div>
          </div>
          <div className={classes.shareDetails}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <div className={classes.kavachBanner}>
                  <img src={require('images/corona-banner.jpg')} />
                </div>
              </Grid>
              <Grid item xs={12} md={4}>
                <div className={classes.kavachFormContainer}>
                  <Typography component="h2">Share your details</Typography>
                  <form>
                    <AphTextField
                      onChange={(event) => handleNameChange(event)}
                      value={userName}
                      placeholder="Name"
                      className={classes.formInput}
                    />
                    {!userNameValid && <div className={classes.error}>Invalid name</div>}

                    <AphTextField
                      onChange={(event) => handleMobileNumberChange(event)}
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
                      onChange={(event) => setUserEmail(event.target.value)}
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
                        <MenuItem value={'Hyderabad'}>Hyderabad</MenuItem>
                        <MenuItem value={'Chennai'}>Chennai</MenuItem>
                        <MenuItem value={'Delhi'}>New Delhi</MenuItem>
                        <MenuItem value={'Bengaluru'}>Bengaluru</MenuItem>
                        <MenuItem value={'Kolkata'}>Kolkata</MenuItem>
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
              As COVID-19 cases continue to rise So does our effort in combating the pandemic
              Introducing Project Kavach with curated protective plans to keep you safe.
            </Typography>
            <Typography>
              Using our strong digital backbone, our prowess in telemedicine and robust COVID 19
              protocols, the Apollo Kavach initiative gives you 360-degree protection.
            </Typography>
          </div>
          <div className={classes.covidCare}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <div className={`${classes.card} ${classes.mb20}`}>
                  <Typography component="h4">
                    <img className={classes.stayI} src={require('images/stay-i.png')} /> at home
                  </Typography>
                  <ul className="careList">
                    <li>Clinical needs </li>
                    <li>Mobility and Lung therapy</li>
                    <li>Nutrition and immunity</li>
                    <li>Mental health and wellness</li>
                    <li>Education to care giver and other family members</li>
                    <li>Motivation and positive thinking allaying anxiety and fears</li>
                    <li>
                      Support service for medications, consumables, diagnostics, referral to
                      hospital
                    </li>
                  </ul>
                </div>
                <div className={classes.card}>
                  <Typography component="h4" className={classes.uppercase}>
                    The Covid Care Home Kit
                  </Typography>
                  <ul className="careList">
                    <li>Digital Thermometer to check temperature</li>
                    <li>Pulse Oximeter to monitor blood oxygen levels &amp; Heart rate</li>
                    <li>Incentive Spirometer for breathing exercises</li>
                    <li>3 ply Mask Infection Prevention</li>
                    <li>Examination gloves for Infection Prevention</li>
                    <li>Paper gloves for Infection Prevention</li>
                    <li>Sanitizer - 500 ML for Hand Hygiene</li>
                    <li>Surface Disinfectant for Surface Sanitisation</li>
                    <li>
                      Anti-Bacterial Wipe for Smaller surfaces to be cleaned like Mobile Phones
                    </li>
                    <li>Waste Disposal Bags for Laundry &amp; waste collection</li>
                    <li>Spiral Note pad &amp; pen for records</li>
                  </ul>
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
                        <li>Medically Supervised Rooms</li>
                        <li>All Meals in a day</li>
                        <li>Round the clock Care</li>
                        <li>Laundry &amp; Maintenance Provided</li>
                        <li>Ensured Early Intervention</li>
                        <li>Decreased Risk of adverse outcomes</li>
                      </ul>
                    </div>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <div className={classes.card}>
                      <Typography component="h4">COVID Mangement</Typography>
                      <ul className="careList">
                        <li> Specialist Consultation</li>
                        <li>All Protocols under ICMR Guidelines</li>
                        <li>International Infection Control Protocols</li>
                        <li>Patient Segregation to prevent cross infection</li>
                        <li>Covid Testing</li>
                        <li>In Hospital Treatment</li>
                      </ul>
                    </div>
                  </Grid>
                </Grid>
                <div className={classes.packages}></div>
                <div className={classes.embedContainer}>
                  <div className={classes.heading}>
                    <Typography component="h3">
                      Basic &amp; Advanced Packages To Suit All Needs
                    </Typography>
                  </div>
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
                  <Typography className={classes.panelHeading}>What is Stay I @HOME</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panelDetails}>
                  <div className={classes.detailsContent}>
                    <Typography>
                      Stay I @HOME is a monitored Home Isolation service offered by Apollo Homecare.
                      The services are based on the latest guidelines from Indian Council of Medical
                      Research (ICMR)/ Ministry of Health and Family Welfare (MoHFW), which
                      recommends Home Isolation for patients who are pre-symptomatic or have very
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
                    What are the Benefits of Stay I @HOME?
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panelDetails}>
                  <div className={classes.detailsContent}>
                    <ul className={classes.faqList}>
                      <li> Helps reduce the risk of transmission to family members</li>
                      <li>
                        Monitored Home Isolation for better compliance, adhering to all the
                        guidelines
                      </li>
                      <li>
                        Ensures early intervention, if any new symptoms or signs are developing
                        throughout the Isolation period.
                      </li>
                      <li>Reduces the risk of adverse outcome</li>
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
                    What will I get in Isolation Kit?
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panelDetails}>
                  <div className={classes.detailsContent}>
                    <Typography>
                      Digital Thermomter, Pulse Oxymeter, Incentive Spiromter, 3 ply Mask,
                      Examination gloves, Paper gloves, Sanitizer - 500 ML, Surface Disinfectant,
                      Aniti Bacterial Wipe, Waste Disposal Bags, Spiral Note pad &amp; pen.
                    </Typography>
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
                    What is duration of Stay I @ HOME?
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panelDetails}>
                  <div className={classes.detailsContent}>
                    <Typography>Package duration is 14 days.</Typography>
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
                      <span className={classes.fontBold}>In Basic Plan</span> every alternate day
                      patient will get Physician consultation through Video call and COVID Care
                      Coordinator Tele-Call every day.{' '}
                    </Typography>
                    <Typography>
                      <span className={classes.fontBold}>In Advance Plan </span> every alternate day
                      patient will get Physician consultation through Video call, COVID Care
                      Coordinator Tele-Call every day, Video call from Engagement and Motivation
                      Team every alternate day, Tele-Rehab daily in week-1 and alternate day in
                      week-2. Dietician and Counsellor once a week.
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
                    Will there be any physical visit by Physician?
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panelDetails}>
                  <div className={classes.detailsContent}>
                    <Typography>
                      No. Physician will be available only through Video call.
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
                    Will there be any care giver provided to patient at Home?
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panelDetails}>
                  <div className={classes.detailsContent}>
                    <Typography>
                      No. The caregiver must be identified by the family and will follow guidelines
                      given.
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
                    Whom can I reach in case of Emergency?
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panelDetails}>
                  <div className={classes.detailsContent}>
                    <Typography>
                      COVID Care Coordinator will be available for any emergency and patient can
                      also reach at 1800-102-8586
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
                    In which cities services are provided?
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panelDetails}>
                  <div className={classes.detailsContent}>
                    <Typography>Hyderabad, Delhi, Chennai, Bangalore and Kolkata.</Typography>
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
                      Online payments modes are accepted. Pay U Money, Paytm, Google Pay etc.
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
                    What are prices of Basic and Advance package?
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panelDetails}>
                  <div className={classes.detailsContent}>
                    <Typography>
                      Basic Plan will cost Rs. 300/- per day which cost to Rs. 4200/- and Isolation
                      KIT will cost Rs. 6000/- (Total Rs, 10,200/-). Advance Plan will cost Rs.
                      600/- per day which cost Rs, 8400/- and Isolation KIT will cost Rs. 6000/-
                      (Total Rs, 14,400/-).
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
                    By when Isolation kit will be delivered?
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panelDetails}>
                  <div className={classes.detailsContent}>
                    <Typography>
                      Once payment is received, Isolation KIT will be delivered within 6 hours.
                    </Typography>
                  </div>
                </ExpansionPanelDetails>
              </ExpansionPanel>
              {/* <ExpansionPanel
                expanded={expanded === 'panel13'}
                onChange={handleChange('panel13')}
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
                    How to download Ask Apollo app? Can I get a demo?
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panelDetails}>
                  <div className={classes.detailsContent}>
                    <Typography>
                      Ask Apollo app can be download from Google Play store and IOS. Navigation
                      queries will be answered by Apollo Home Care team.
                    </Typography>
                  </div>
                </ExpansionPanelDetails>
              </ExpansionPanel>*/}
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
                    Why I should choose Stay I @HOME?
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panelDetails}>
                  <div className={classes.detailsContent}>
                    <ul className={classes.faqList}>
                      <li>Affordable pricing, </li>
                      <li> Package based on ICMR guidelines,</li>
                      <li> Highly Experienced team of Doctor’s for your care.</li>
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
                    What is required from patient?
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panelDetails}>
                  <div className={classes.detailsContent}>
                    <Typography>
                      A care giver to take care of patient, A smart phone with good internet
                      connectivity, Isolation room for patient.
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
                    Why are charging when the government is giving out these services at hospital
                    for free?
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panelDetails}>
                  <div className={classes.detailsContent}>
                    <Typography>
                      Sir – These are the best suited for individuals who had a travel history, been
                      in contact with Covid-19 patient or asked to be in isolation by authorities.
                    </Typography>
                    <Typography>
                      These are private hotels that agreed and partnered to increase the capability
                      of controlling the situation. For everyone's comfort, we are taking this step.
                      As self-isolation was the suggestion to ensure the symptoms of covid-19 are
                      controlled, in case there is no scope for you to self-quarantine, these
                      facilities will support as quarantine facilities.
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
                    What facilities will the rooms have?
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panelDetails}>
                  <div className={classes.detailsContent}>
                    <Typography>
                      The rooms will be clean, hygienic and comfortable. The rooms will be
                      air-conditioned with wi-fi connectivity. There will a television for
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
                    What are the things that I have to carry with me!
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panelDetails}>
                  <div className={classes.detailsContent}>
                    <Typography>
                      Sir – you will receive an email with all the pre-requisites and things you
                      will have to carry to the facility upon booking confirmation. Rest be assured,
                      I will be more than happy to help in case you need any additional information.
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
                    What in case the guest requires medicine?
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panelDetails}>
                  <div className={classes.detailsContent}>
                    <Typography>
                      Medicines will be delivered to the guest as required as per the prescription.
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
                    What about food? Will home food be allowed?
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panelDetails}>
                  <div className={classes.detailsContent}>
                    <Typography>
                      Third party delivery – Zomato will be the food delivery partner; three meals a
                      day, breakfast, lunch and dinner, delivery at facility. (included in room
                      rent)
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
                    Will there be provision for laundry?
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
                    What in case the room needs to be cleaned, something needs to be repaired?
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
                    What will happen to the room after a guest checks out?
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panelDetails}>
                  <div className={classes.detailsContent}>
                    <Typography>
                      After checkout, the room will be completely cleaned and disinfected by trained
                      housekeeping personnel wearing PPE.
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
                    What Dos and Dont’s should the guest observe during the stay?
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panelDetails}>
                  <div className={classes.detailsContent}>
                    <ul className={classes.faqList}>
                      <li>
                        Guests are not permitted to step out of the room. If needed, they should
                        contact the on duty staff at the facility and wait for instructions.
                      </li>
                      <li>Guests should switch off the electronic devices if not needed. </li>
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
                      <li>
                        Guests should keep the doors to be kept closed.Guests will not be permitted
                        into the kitchen and washing area
                      </li>
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
                    What is the USP of the Kit?
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panelDetails}>
                  <div className={classes.detailsContent}>
                    <ul className={classes.faqList}>
                      <li>Addresses the need of both care provider and the patient.</li>
                      <li>
                        {' '}
                        It covers all the elements from the point of view of vitals monitoring
                        ,infection control , prevention of spread ,proper waste disposal elements ,
                        education to patient and family members as laid down by the guidelines for
                        home isolation{' '}
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
                    Is it mandatory to buy a kit?
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panelDetails}>
                  <div className={classes.detailsContent}>
                    <Typography>
                      Yes. Without this we cannot ensure protection of the patient and the other
                      family members and we will not be able to get the vital parameters data from
                      the patient
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
                    Can we exclude some components of kit based on Customer’s requirement?
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panelDetails}>
                  <div className={classes.detailsContent}>
                    <ul className={classes.faqList}>
                      <li>No it is a bundled package</li>
                      <li>
                        Similarly the duration of the program cannot be altered to anything less
                        than 14 days
                      </li>
                    </ul>
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
                    If Customer asks which one to choose from Home / Facility – which product should
                    be pushed first and why?
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panelDetails}>
                  <div className={classes.detailsContent}>
                    <Typography>
                      <span className={classes.fontBold}>Home-</span> more cost effective ,
                      convenient and can be availed if you have
                    </Typography>
                    <ul className={classes.faqList}>
                      <li>A separate room for isolation</li>
                      <li>.There is a care provider available to assist</li>
                      <li> You have Wi-Fi /net connectivity available to you</li>
                    </ul>
                    <Typography>
                      <span className={classes.fontBold}>Facility-</span> If you are alone or there
                      is no separate room for isolation or there is no support for routine things
                      like meals etc., at home -then in that case it is suggested for you to have
                      facility isolation.
                    </Typography>
                    <Typography>
                      In case there are more than 1 senior citizen’s or at risk family members at
                      home-Stay I facility is recommended
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
    </div>
  );
};
