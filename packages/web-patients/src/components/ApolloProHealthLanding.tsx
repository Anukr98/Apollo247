import React, { useEffect, useRef, useState } from 'react';
import { isEmailValid, isMobileNumberValid, isNameValid } from '@aph/universal/dist/aphValidators';
import { AphButton, AphTextField } from '@aph/web-ui-components';
import { CircularProgress, Theme, Typography, useMediaQuery, Popover } from '@material-ui/core';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { MascotWithMessage } from '../components/MascotWithMessage';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { makeStyles } from '@material-ui/styles';
import { BottomLinks } from 'components/BottomLinks';
import { NavigationBottom } from 'components/NavigationBottom';
import fetchUtil from 'helpers/fetch';
import { Header } from './Header';

const useStyles = makeStyles((theme: Theme) => {
  return {
    aphContainer: {},
    container: {
      width: 1064,
      margin: '0 auto',
      [theme.breakpoints.down('sm')]: {
        width: '100%',
      },
    },
    bottomPopover: {
      overflow: 'initial',
      backgroundColor: 'transparent',
      boxShadow: 'none',
    },
    loader: {
      margin: '20px auto',
      textAlign: 'center',
      display: 'block',
    },
    error: {
      color: '#890000',
      margin: '-15px 0 0',
      fontSize: 12,
    },
    aphContent: {
      background: '#f7f8f5',
      position: 'relative',
    },
    aboutContainer: {
      display: 'grid',
      gridTemplateColumns: 'auto auto',
      [theme.breakpoints.down('sm')]: {
        overflow: 'hidden',
        position: 'relative',
      },
      '& img': {
        width: '100%',
        [theme.breakpoints.down('sm')]: {
          width: 190,
        },
      },
    },
    aboutDetails: {
      padding: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#fff',
      [theme.breakpoints.down('sm')]: {
        padding: 24,
      },
      '& h2': {
        fontSize: 36,
        fontWeight: 600,
        [theme.breakpoints.down('sm')]: {
          fontSize: 16,
        },
        '& span': {
          textTransform: 'uppercase',
          display: 'block',
        },
      },
    },
    aboutContent: {
      width: '80%',

      [theme.breakpoints.down('sm')]: {
        position: 'relative',
        zIndex: 4,
        width: '100%',
        padding: '80px 0',
      },
      '& h2': {
        margin: '0 0 20px',
      },
    },
    textRight: {
      textAlign: 'right',
    },
    fontBold: {
      fontWeight: 700,
    },
    aphStepContainer: {
      padding: 50,
    },
    aphStepContent: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
      },
    },
    aphStepDetail: {
      width: 290,
      position: 'relative',
      height: 350,
      [theme.breakpoints.down('sm')]: {
        margin: '0 0 60px',
        height: 'auto !important',
        '&:last-child': {
          margin: 0,
        },
      },
      '& h2': {
        fontSize: 36,
        lineHeight: '46px',
        fontWeight: 600,
        textTransform: 'uppercase',
        color: '#FCB716',
        padding: '0 36px',
      },
    },
    aphStepList: {
      margin: '20px 0 0',
      position: 'relative',
      zIndex: 4,
      '& li': {
        fontSize: 18,
        lineHeight: '24px',
        padding: '5px 0',

        '& span': {
          fontWeight: 500,
        },
      },
    },
    count: {
      position: 'absolute',
      bottom: -50,
      left: 0,
      right: 0,
      textAlign: 'center',
      fontSize: 230,
      fontWeight: 600,
      lineHeight: '270px',
      color: 'rgba(252,183,22,0.2)',
      zIndex: 0,
    },
    gtContainer: {
      padding: 50,
      position: 'relative',
      [theme.breakpoints.down('sm')]: {
        padding: 24,
        overflow: 'hidden',
      },
    },
    gtContent: {
      padding: '30px 0',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'flex-end',
      [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
        alignItems: 'center',
      },
      '& button': {
        width: 150,
        fontSize: 12,
        zIndex: 3,
        textTransform: 'uppercase',
        [theme.breakpoints.down('sm')]: {
          order: 2,
        },
      },
      '& h2': {
        fontSize: 36,
        lineHeight: '46px',
        fontWeight: 600,
        width: '65%',
        [theme.breakpoints.down('sm')]: {
          order: 1,
          width: '100%',
          fontSize: 24,
          lineHeight: '30px',
          margin: '0 0 50px',
        },
        '& .orange': {
          color: '#FCB716',
          [theme.breakpoints.down('sm')]: {
            // display: 'block',
          },
        },
        '& .uppercase': {
          textTransform: 'uppercase',
        },
      },
    },
    bgText: {
      fontSize: 150,
      fontWeight: 600,
      lineHeight: '150px',
      color: 'rgba(252,183,22,0.2)',
      position: 'absolute',
      bottom: -90,
      left: 0,
      width: '50%',
      zIndex: 0,
      [theme.breakpoints.down('sm')]: {
        fontSize: 92,
        lineHeight: '92px',
        bottom: 0,
      },
    },
    faqContainer: {
      padding: 30,
      position: 'relative',
      zIndex: 4,
      borderRadius: 5,
      [theme.breakpoints.down('sm')]: {
        padding: '0 10px',
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
        textTransform: 'uppercase',
      },
    },
    expansionContainer: {},
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
    fabButton: {
      width: 100,
      height: 100,
      borderRadius: '50%',
      position: 'fixed',
      left: 20,
      bottom: 100,
      zIndex: 9,
      [theme.breakpoints.up(1440)]: {
        left: 50,
      },
      [theme.breakpoints.up(1600)]: {
        left: '8%',
      },
      [theme.breakpoints.up(1920)]: {
        left: '15%',
      },
    },
    aphBanner: {
      position: 'relative',
      [theme.breakpoints.down('sm')]: {
        padding: '0 0 60px',
      },
      '& img': {
        width: '100%',
      },
      '& .web': {
        [theme.breakpoints.down('sm')]: {
          display: 'none',
        },
      },
      '& .mobile': {
        width: '100%',
        display: 'none',
        [theme.breakpoints.down('sm')]: {
          display: 'block',
        },
      },
    },
    bannerContainer: {
      width: 280,
      position: 'absolute',
      top: '20%',
      right: 50,
      background: '#fff',
      borderRadius: 10,
      padding: 20,
      boxShadow: ' 0 5px 20px 0 rgba(0, 0, 0, 0.3)',
      zIndex: 4,
      [theme.breakpoints.down('sm')]: {
        position: 'relative',
        margin: '-30px auto',
        zIndex: 4,
        left: 0,
        right: 0,
      },
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
    proHealth2: {
      [theme.breakpoints.down('sm')]: {
        width: '100% !important',
        opacity: 0.7,
        margin: '0 -20px 0 0',
        position: 'absolute',
        right: -50,
        top: -20,
      },
    },
  };
});

const locationOptions = ['Chennai', 'Hyderabad', 'Mumbai', 'New Delhi'];

const ApolloProHealthLanding: React.FC = (props) => {
  const classes = useStyles({});
  const [expanded, setExpanded] = React.useState<string | false>(false);

  const [location, setLocation] = React.useState('');
  const [service, setService] = React.useState('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [userMobileNumber, setUserMobileNumber] = useState<string>('');
  const [isPostSubmitDisable, setIsPostSubmitDisable] = useState<boolean>(true);
  const [emailValid, setEmailValid] = useState<boolean>(true);
  const [userNameValid, setUserNameValid] = useState<boolean>(true);
  const [mobileNumberValid, setMobileNumberValid] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const scrollToRef = useRef<HTMLDivElement>(null);
  const isDesktopOnly = useMediaQuery('(min-width:768px)');

  const handleChange = (panel: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  useEffect(() => {
    scrollToRef &&
      scrollToRef.current &&
      scrollToRef.current.scrollIntoView({ behavior: 'smooth' });

    window.dataLayer.push({
      event: 'pageviewEvent',
      pagePath: window.location.href,
      pageName: 'Pro Health Page',
      pageLOB: 'Others',
    });
  });

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

  const submitProHealthForm = () => {
    window.dataLayer.push({ event: 'Details Submitted' });
    setIsLoading(true);
    const userData = {
      fullName: userName,
      mobileNumber: userMobileNumber,
      email: userEmail,
      location,
    };
    fetchUtil(process.env.PROHEALTH_FORM_SUBMIT_URL, 'POST', userData, '', true).then(
      (res: any) => {
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
      }
    );
  };

  const handleSelectChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setLocation(event.target.value as string);
  };

  return (
    <div className={classes.aphContainer} ref={scrollToRef}>
      <Header />
      <div className={classes.container}>
        <div className={classes.aphContent}>
          <AphButton
            color="primary"
            className={classes.fabButton}
            onClick={() => {
              window.scrollTo(0, 0);
              window.dataLayer.push({ event: 'Get in Touch Clicked' });
            }}
          >
            Get In Touch
          </AphButton>
          <div className={classes.aphBanner}>
            <img
              src={require('images/pro-health-banner.jpg')}
              className="web"
              alt="Apollo Pro Health Program"
            />
            <img
              src={require('images/ph-banner-mobile.jpg')}
              className="mobile"
              alt="Apollo Pro Health Program"
            />
            <div className={classes.bannerContainer}>
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
                {!mobileNumberValid && <div className={classes.error}>Invalid Mobile Number</div>}

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
                      <MenuItem key={location} value={location}>
                        {location}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {!isLoading ? (
                  <AphButton
                    disabled={isPostSubmitDisable}
                    onClick={() => submitProHealthForm()}
                    variant="contained"
                    color="primary"
                  >
                    Let's Talk
                  </AphButton>
                ) : (
                  <div className={classes.loader}>
                    <CircularProgress />
                  </div>
                )}
              </form>
            </div>
          </div>
          <div className={classes.aboutContainer}>
            <img src={require('images/prohealth-1.jpg')} alt="Apollo Pro Health Program" />
            <div className={classes.aboutDetails}>
              <Typography component="h2" className={classes.textRight}>
                This unique 3-year program is specially designed to help{' '}
                <span>Predict, Prevent, Overcome</span> lifestyle diseases where possible
              </Typography>
            </div>
          </div>
          <div className={classes.aphStepContainer}>
            <div className={classes.aphStepContent}>
              <div className={classes.aphStepDetail}>
                <span className={classes.count}>1</span>
                <Typography component="h2">Predict</Typography>
                <ul className={classes.aphStepList}>
                  <li>
                    <span>Multi-system Body Assessment</span>
                  </li>
                  <li>
                    <span>
                      Health Assessment based on age, gender, diet, personal, past and family
                      history
                    </span>
                  </li>
                  <li>
                    <span>Health Pulse </span>- Analytics for individuals and corporates
                  </li>
                </ul>
              </div>
              <div className={classes.aphStepDetail}>
                <span className={classes.count}>2</span>
                <Typography component="h2">Prevent</Typography>
                <ul className={classes.aphStepList}>
                  <li>
                    <span>Health Mentor for personalised health advice and guidance</span>
                  </li>
                  <li>
                    <span>Pan-India specialist consultation:</span> through the Apollo Hospital and
                    Clinic network
                  </li>
                  <li>
                    <span> Physiotherapy</span> Intervention where needed, for improved functioning
                  </li>
                </ul>
              </div>
              <div className={classes.aphStepDetail}>
                <span className={classes.count}>3</span>
                <Typography component="h2">Overcome</Typography>
                <ul className={classes.aphStepList}>
                  <li>
                    <span>Condition Management:</span> Advice on managing pre-existing conditions{' '}
                  </li>
                  <li>
                    <span>Personalised Health and Lifestyle Modification: </span> Specific advice on
                    Nutrition, Stress, Sleep and Behavioural Changes
                  </li>
                  <li>
                    <span>Habit Optimisation by digital interventions / nudges</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className={classes.aboutContainer}>
            <div className={classes.aboutDetails}>
              <div className={classes.aboutContent}>
                <Typography component="h2">About Us</Typography>
                <Typography>
                  ProHealth is a three-year program that brings together cutting-edge diagnostics,
                  predictive tools and the most advanced personalized care, designed to make real
                  change to one's health metrics.{' '}
                  <span className={classes.fontBold}>
                    A program that's the result of Apollo's pioneering efforts in preventive care
                    for 36 years.
                  </span>{' '}
                  It has been created by a team of medical experts with vast knowledge and deep
                  dedication to creating an NCD free world.
                </Typography>
              </div>
            </div>
            <img
              src={require('images/prohealth-2.jpg')}
              className={classes.proHealth2}
              alt="Apollo Pro Health Program"
            />
          </div>
          <div className={classes.gtContainer}>
            <div className={classes.gtContent}>
              {/* <AphButton color="primary" onClick={() => window.scrollTo(0, 0)}>
              Get in Touch
            </AphButton> */}
              <Typography component="h2" className={classes.textRight}>
                Empowered by <span className="orange">Artificial Intelligence</span>, it can{' '}
                <span className="uppercase">Predict </span> health risks, and help{' '}
                <span className="uppercase">Prevent</span> the preventable ailments where required
                and <span className="uppercase">Overcome </span> lifestyle diseases where possible.
              </Typography>
              <Typography className={classes.bgText}>Predict Prevent Overcome</Typography>
            </div>
          </div>
          <div className={classes.faqContainer}>
            <div className={classes.faq}>
              <Typography component="h6">Frequently Asked Questions</Typography>
              <div className={classes.expansionContainer}>
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
                    <Typography className={classes.panelHeading}>
                      What is Apollo Prohealth programme?
                    </Typography>
                  </ExpansionPanelSummary>
                  <ExpansionPanelDetails className={classes.panelDetails}>
                    <div className={classes.detailsContent}>
                      <Typography>
                        Apollo ProHealth is a unique three year programme that brings cutting edge
                        diagnostics, predictive tools and the most advanced personalized care.
                        Powered by AI and our experts, this program offers a complete clinical
                        assessment (including physical and mental health) and follow-up by a
                        dedicated health mentor. Curated rehabilitation plans to address post
                        Covid-19 health issues is also covered
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
                      What do I get by enrolling in ProHealth?
                    </Typography>
                  </ExpansionPanelSummary>
                  <ExpansionPanelDetails className={classes.panelDetails}>
                    <div className={classes.detailsContent}>
                      <Typography>
                        ProHealth is a combination of Health Risk Assessment, Investigations,
                        Medical Consults, Lifestyle and Mental Health Assessment &amp; Support.
                        Curated rehabilitation plans to address post Covid-19 health issues if
                        required. You will also be followed up by your dedicated health mentor and
                        get access to a ProHealth App to keep track of your health goals.
                      </Typography>
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
                      What are NCDs and why is ProHealth relevant to me in times of Covid 19?
                    </Typography>
                  </ExpansionPanelSummary>
                  <ExpansionPanelDetails className={classes.panelDetails}>
                    <div className={classes.detailsContent}>
                      <Typography>
                        NCDs are non communicable diseases like Diabetes, Hypertension, Obesity,
                        Heart diseases, Cancers and Depression. People with NCDs may show no
                        symptoms until the disease has progressed substantially and the first
                        symptom may be a heart attack or stroke. Infact studies show that the Covid
                        19 complications are severe in those with NCDs, especially if they are not
                        controlled. With Apollo ProHealth, you will be screened for NCD risk factors
                        and put on a pathway to prevent progression of the disease.
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
                      What is the health mentor service in ProHealth?
                    </Typography>
                  </ExpansionPanelSummary>
                  <ExpansionPanelDetails className={classes.panelDetails}>
                    <div className={classes.detailsContent}>
                      <Typography>
                        Through Apollo ProHealth, you will be assigned a dedicated health mentor,
                        who will connect with you every month. The follow up will help you in
                        monitoring your NCD related parameters. For post Covid-19 patients, it will
                        help in recovery and support with customized rehabilitation plans as needed.
                      </Typography>
                    </div>
                  </ExpansionPanelDetails>
                </ExpansionPanel>
              </div>
            </div>
          </div>
        </div>
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
          message="Thank you for contacting Team Apollo ProHealth. We will call you back very soon."
          closeButtonLabel="OK"
          closeMascot={() => {
            setIsPopoverOpen(false);
          }}
          // refreshPage
        />
      </Popover>
      <BottomLinks />
      <NavigationBottom />
    </div>
  );
};

export default ApolloProHealthLanding;
