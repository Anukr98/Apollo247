import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Typography } from '@material-ui/core';
import { Header } from './Header';
import { BottomLinks } from 'components/BottomLinks';
import { NavigationBottom } from 'components/NavigationBottom';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import {
  AphSelect,
  AphButton,
  AphInput,
  AphTextField,
  AphDialogTitle,
  AphDialog,
  AphDialogClose,
} from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return {
    aphContainer: {},
    container: {
      width: 1064,
      margin: '0 auto',
    },
    aphContent: {
      background: '#f7f8f5',
      position: 'relative',
    },
    aboutContainer: {
      display: 'grid',
      gridTemplateColumns: 'auto auto',
    },
    aboutDetails: {
      padding: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#fff',
      '& h2': {
        fontSize: 36,
        fontWeight: 600,
        '& span': {
          textTransform: 'uppercase',
          display: 'block',
        },
      },
    },
    aboutContent: {
      width: '80%',
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
    },
    aphStepDetail: {
      width: 290,
      position: 'relative',
      height: 350,
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
      height: 450,
    },
    gtContent: {
      padding: '30px 0',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      '& button': {
        width: 150,
        fontSize: 12,
        textTransform: 'uppercase',
      },
      '& h2': {
        fontSize: 36,
        lineHeight: '46px',
        fontWeight: 600,
        width: '65%',
        '& .orange': {
          color: '#FCB716',
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
    },
    faqContainer: {
      padding: 30,
      position: 'relative',
      zIndex: 4,
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
  };
});

const ApolloProHealthLanding: React.FC = (props) => {
  const classes = useStyles({});
  const [expanded, setExpanded] = React.useState<string | false>(false);

  const handleChange = (panel: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <div className={classes.aphContainer}>
      <Header />
      <div className={classes.container}>
        <div className={classes.aphContent}>
          <AphButton color="primary" className={classes.fabButton}>
            Get In Touch
          </AphButton>
          <div className={classes.aphBanner}>
            <img src={require('images/pro-health-banner.svg')} alt="Apollo Pro Health Program" />
            <div className={classes.bannerContainer}>
              <Typography component="h2">Share your details</Typography>
              <form>
                <AphTextField placeholder="Name" className={classes.formInput} />
                <AphTextField
                  inputProps={{
                    maxLength: 10,
                  }}
                  placeholder="Mobile Number"
                  className={classes.formInput}
                />
                <AphTextField placeholder="Email" className={classes.formInput} />
                <FormControl className={classes.formControl}>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    displayEmpty
                    className={classes.selectEmpty}
                    inputProps={{ 'aria-label': 'Without label' }}
                  >
                    <MenuItem value="" disabled>
                      Select location
                    </MenuItem>
                    <MenuItem value="hyderabad">Hyderaad</MenuItem>
                    <MenuItem value="chennai">Chennai</MenuItem>
                    <MenuItem value="delhi">Delhi</MenuItem>
                    <MenuItem value="mumbai">Mumbai</MenuItem>
                  </Select>
                  <AphButton variant="contained" color="primary">
                    Let's Talk
                  </AphButton>
                </FormControl>
              </form>
            </div>
          </div>

          <div className={classes.aboutContainer}>
            <img src={require('images/prohealth-1.svg')} alt="Apollo Pro Health Program" />
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
                    <span>
                      Health Mentor for personalised health advice and guidance Pan-India specialist
                    </span>
                  </li>
                  <li>
                    <span> consultation:</span> through the Apollo Hospital and Clinic network
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
                    <span>Condition Management:</span> Advice on managing pre—existing conditions{' '}
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
                  About Us ProHealth is a three-year program that brings together cutting-edge
                  diagnostics, predictive tools and the most advanced personalized care, designed to
                  make real change to one’s health metrics.{' '}
                  <span className={classes.fontBold}>
                    A program that's the result of Apollo's pioneering efforts in preventive care
                    for 36 years.
                  </span>{' '}
                  It has been created by a team of medical experts with vast knowledge and deep
                  dedication to creating an NCD free world.
                </Typography>
              </div>
            </div>
            <img src={require('images/prohealth-2.svg')} alt="Apollo Pro Health Program" />
          </div>
          <div className={classes.gtContainer}>
            <div className={classes.gtContent}>
              <AphButton color="primary">Get in Touch</AphButton>
              <Typography component="h2" className={classes.textRight}>
                Empowered by <span className="orange">Artificial Intelligence</span>, it can{' '}
                <span className="uppercase">Predict</span>
                health risks, and help <span className="uppercase">Prevent</span> the preventable
                ailments where required and <span className="uppercase">Overcome </span> lifestyle
                diseases where possible.
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
                      <Typography> Lorem Ipsum</Typography>
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
                      <Typography> Lorem Ipsum</Typography>
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
                      <Typography> Lorem Ipsum</Typography>
                    </div>
                  </ExpansionPanelDetails>
                </ExpansionPanel>
              </div>
            </div>
          </div>
        </div>

        <BottomLinks />
        <NavigationBottom />
      </div>
    </div>
  );
};

export default ApolloProHealthLanding;
