import React, { useEffect, useState, useRef } from 'react';
import {
  Theme,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { Header } from 'components/Header';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { BottomLinks } from 'components/BottomLinks';
import { NavigationBottom } from 'components/NavigationBottom';
import { clientRoutes } from 'helpers/clientRoutes';
import { Banner } from 'components/Covid/Banner';
import { Link } from 'react-router-dom';
import { CheckRiskLevel } from 'components/Covid/CheckRiskLevel';
import { ManageProfile } from 'components/ManageProfile';
import { Relation } from 'graphql/types/globalTypes';
import { useAllCurrentPatients } from 'hooks/authHooks';

const useStyles = makeStyles((theme: Theme) => {
  return {
    cdLanding: {},
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    cdContent: {
      // padding: 30,
      background: '#f7f8f5',
      [theme.breakpoints.down('sm')]: {
        padding: '20px 15px',
      },
    },
    pageContainer: {
      marginTop: -72,
      [theme.breakpoints.up('sm')]: {
        marginTop: 0,
      },
    },
    expansionContainer: {},
    expandIcon: {
      margin: 0,
      padding: 0,
      [theme.breakpoints.down('sm')]: {
        color: '#02475b',
      },
    },
    panelExpanded: {
      margin: '0 !important',
    },
    summaryContent: {
      margin: 0,
    },
    panelDetails: {
      borderTop: '1px solid rgba(2, 71, 91, .2)',
      padding: '10px 0',
      margin: '10px 0 0',
      '& p': {
        fontSize: 12,
        fontWeight: 500,
        color: '#67919d',
      },
    },
    panelRoot: {
      padding: '20px 40px',
      boxShadow: '0 0px 10px 0 rgba(208, 205, 205, 0.3)',
      borderRadius: '8px !important',
      margin: '0 0 20px !important',
      '&:before': {
        display: 'none',
      },
      [theme.breakpoints.down('sm')]: {
        padding: 10,
      },
    },
    cdIntro: {
      margin: '20px 0 ',
      borderRadius: 10,
      padding: '30px 50px',
      background: '#fff',
      boxShadow: '0 2px 6px 0 rgba(208, 205, 205, 0.2)',
      '& h4': {
        fontSize: 23,
        color: '#02475b',
        fontWeight: 700,
        margin: '0 0 10px',
      },
      '& p': {
        fontSize: 16,
        color: '#67919d',
        margin: '0 0 20px',
      },
      [theme.breakpoints.down('sm')]: {
        padding: 20,
        '& h4': {
          fontSize: 18,
        },
        '& p': {
          fontSize: 14,
        },
      },
    },
    refList: {
      margin: 0,
      '& li': {
        color: '#67919d',
        '& a': {
          fontSize: 16,
          padding: '5px 0',
          color: '#67919d',
        },
      },
      [theme.breakpoints.down('sm')]: {
        padding: '0 0 0 20px',
        '& li': {
          '& a': {
            fontSize: 14,
          },
        },
      },
    },
    panelHeader: {
      padding: 0,
      display: 'flex',
      alignItems: 'center',
      margin: '0 !important',
      minHeight: 'auto !important',
      '& img': {
        margin: '0 20px 0 0',
      },
    },

    panelHeading: {
      margin: 0,
      fontSize: 23,
      fontWeight: 600,
      [theme.breakpoints.down('sm')]: {
        fontSize: 16,
      },
    },
    detailsContent: {
      width: '100%',
      '& p': {
        fontSize: 16,
        margin: '0 0 10px',
        '&:last-child': {
          margin: 0,
        },
      },
    },
    listStyleNone: {
      listStyle: 'none',
    },
    heightAuto: {
      height: 'auto !important',
    },
    cdList: {
      padding: '0 0 0 25px',
      margin: 0,
      height: 100,
      overflow: 'hidden',
      transition: '0.5s ease',
      '& li': {
        padding: '5px 0',
        color: '#67919d',
      },
    },
    fontBold: {
      fontWeight: 700,
    },
    seemore: {
      textAlign: 'right',
      display: 'block',
      fontSize: 13,
      color: '#fcb716',
      margin: '10px 0 0',
      fontWeight: 'bold',
    },
    conclusionContent: {},
  };
});
export const CovidDiabetesLanding: React.FC = (props: any) => {
  const classes = useStyles({});
  const isDesktopOnly = useMediaQuery('(min-width:768px)');
  const [expanded, setExpanded] = React.useState<string | false>(false);
  const [seemore, setSeemore] = React.useState<boolean>(false);
  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();
  const onePrimaryUser =
    allCurrentPatients && allCurrentPatients.filter((x) => x.relation === Relation.ME).length === 1;

  useEffect(() => {
    if (props && props.location && props.location.search && props.location.search.length) {
      const qParamsArr = props.location.search.split('=');
      if (qParamsArr && qParamsArr.length) {
        const isWebView = qParamsArr.some((param: string) => param.includes('mobile_app'));
        setIsWebView(isWebView);
      }
    }
  });

  const handleChange = (panel: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };
  const [isWebView, setIsWebView] = useState<boolean>(false);
  return (
    <div className={classes.cdLanding}>
      <Header />
      <div className={classes.container}>
        <div className={classes.cdContent}>
          <Banner isWebView={isWebView} />
          <div className={classes.cdIntro}>
            <Typography component="h4">Introduction</Typography>
            <Typography>
              COVID-19 is an infectious disease caused by the newest coronavirus. Scientists across
              the globe are working hard towards developing a vaccine and curb its spread. But right
              now, the only thing that can help prevent coronavirus is by engaging in social
              distancing with proper hand and respiratory hygiene. Symptoms of this virus are fever,
              cough, and shortness of breath that can continue till 2-4 weeks. Some people also
              experience sore throat, body aches, nausea, and diarrhoea. Coronavirus is known to
              spread through person-to-person contact, via small droplets from the mouth or nose of
              a coronavirus infected person. It can also spread from coming in contact with
              virus-infected objects and surfaces and then touching one's own mouth, nose, or eyes.
              Given that coronavirus research is still in its early stages, healthcare organizations
              like the CDC and WHO are doing extensive research about how this virus spreads. Based
              on studies by CDC, people above 65 or older and individuals of any age group with
              other health conditions like diabetes are at high risk of experiencing severe COVID-19
              symptoms. So it is important to remain protected as much as possible and follow
              certain extra precautionary measures. Here's how you can deal with COVID-19 and
              diabetes.
            </Typography>
            <Typography component="h4">Ref: </Typography>
            <ul className={classes.refList}>
              <li>
                <a href="javascript:void(0);">
                  https://www.cdc.gov/coronavirus/2019-ncov/prevent-getting-sick/how-covid-spreads.html
                </a>
              </li>
              <li>
                <a href="javascript:void(0);">https://www.mohfw.gov.in/pdf/FAQ.pdf</a>
              </li>
              <li>
                <a href="javascript:void(0);">
                  https://www.cdc.gov/coronavirus/2019-ncov/need-extra-precautions/people-with-medical-conditions.html
                </a>
              </li>
            </ul>
          </div>

          <div className={` ${classes.expansionContainer} `}>
            <ExpansionPanel
              expanded={true}
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
                <img src={require('images/diet-nutrition.svg')} />
                <Typography className={classes.panelHeading}>Diet &amp; Nutrition </Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails className={classes.panelDetails}>
                <div className={classes.detailsContent}>
                  <ul className={`${classes.cdList} ${seemore ? classes.heightAuto : ''}`}>
                    <li>Limit foods that are high in sugar and salt.</li>
                    <li>
                      Eat a variety of whole-grain foods (high fiber), fruits, vegetables and lean
                      proteins (fish, meat, eggs).
                    </li>
                    <li>Limit foods that are high in sugar and salt.</li>
                    <li>
                      Eat a variety of whole-grain foods (high fiber), fruits, vegetables and lean
                      proteins (fish, meat, eggs).
                    </li>
                  </ul>

                  <a
                    href="javascript:void(0);"
                    className={classes.seemore}
                    onClick={() => setSeemore(!seemore)}
                  >
                    {seemore ? <span>See Less</span> : <span>See More</span>}
                  </a>
                </div>
              </ExpansionPanelDetails>
            </ExpansionPanel>
            <ExpansionPanel
              expanded={true}
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
                <img src={require('images/excercise-activity.svg')} />
                <Typography className={classes.panelHeading}>
                  Physical Exercise &amp; Activity
                </Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails className={classes.panelDetails}>
                <div className={classes.detailsContent}>
                  <ul className={`${classes.cdList} ${seemore ? classes.heightAuto : ''}`}>
                    <li>
                      Try to get minimum of twenty minutes of moderate exercise like yoga, walking,
                      jogging and swimming
                    </li>
                    <li>
                      Avoid long sitting periods and include small walk breaks every 30 minutes
                    </li>
                    <li>
                      Try to get minimum of twenty minutes of moderate exercise like yoga, walking,
                      jogging and swimming
                    </li>
                    <li>
                      Avoid long sitting periods and include small walk breaks every 30 minutes
                    </li>
                  </ul>

                  <a
                    href="javascript:void(0);"
                    className={classes.seemore}
                    onClick={() => setSeemore(!seemore)}
                  >
                    {seemore ? <span>See Less</span> : <span>See More</span>}
                  </a>
                </div>
              </ExpansionPanelDetails>
            </ExpansionPanel>
            <ExpansionPanel
              expanded={true}
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
                <img src={require('images/diagnostics-test.svg')} />
                <Typography className={classes.panelHeading}>Diagnostic Tests</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails className={classes.panelDetails}>
                <div className={classes.detailsContent}>
                  <Typography>
                    High blood sugar levels affect eyes, kidneys, liver, heart, blood vessels,
                    nerves and lungs. Anyone who has diabetes should undergo the following
                    diagnostic and imaging tests to prevent any further health complications.
                  </Typography>

                  <ul
                    className={`${classes.cdList} ${classes.listStyleNone} ${
                      seemore ? classes.heightAuto : ''
                    }`}
                  >
                    <li>
                      <span className={classes.fontBold}>HbA1C test:</span> The HbA1c test measures
                      blood glucose levels from your blood sample. Depending on your diabetes, HbA1c
                      test should be done once every 3 months.
                    </li>
                    <li>
                      <span className={classes.fontBold}>HbA1C test:</span> The HbA1c test measures
                      blood glucose levels from your blood sample. Depending on your diabetes, HbA1c
                      test should be done once every 3 months.
                    </li>
                    <li>
                      <span className={classes.fontBold}>HbA1C test:</span> The HbA1c test measures
                      blood glucose levels from your blood sample. Depending on your diabetes, HbA1c
                      test should be done once every 3 months.
                    </li>
                  </ul>

                  <a
                    href="javascript:void(0);"
                    className={classes.seemore}
                    onClick={() => setSeemore(!seemore)}
                  >
                    {seemore ? <span>See Less</span> : <span>See More</span>}
                  </a>
                </div>
              </ExpansionPanelDetails>
            </ExpansionPanel>
            <ExpansionPanel
              expanded={true}
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
                <img src={require('images/images-test.svg')} />
                <Typography className={classes.panelHeading}>Diagnostic Imaging tests</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails className={classes.panelDetails}>
                <div className={classes.detailsContent}>
                  <ul
                    className={`${classes.cdList} ${classes.listStyleNone} ${
                      seemore ? classes.heightAuto : ''
                    }`}
                  >
                    <li>
                      <span className={classes.fontBold}> 2D echo test: </span>This test examines
                      the heart's structure and helps doctors monitor the functioning of your heart
                      and its valves. Doctors recommend 2D echo tests once every year.
                    </li>
                    <li>
                      <span className={classes.fontBold}>Chest X-Ray:</span>
                      This test examines the pulmonary or lung function. Doctors recommend chest
                      X-Ray screenings once every 6 months.
                    </li>

                    <li>
                      <span className={classes.fontBold}> 2D echo test: </span>This test examines
                      the heart's structure and helps doctors monitor the functioning of your heart
                      and its valves. Doctors recommend 2D echo tests once every year.
                    </li>
                    <li>
                      <span className={classes.fontBold}>Chest X-Ray:</span>
                      This test examines the pulmonary or lung function. Doctors recommend chest
                      X-Ray screenings once every 6 months.
                    </li>
                  </ul>

                  <a
                    href="javascript:void(0);"
                    className={classes.seemore}
                    onClick={() => setSeemore(!seemore)}
                  >
                    {seemore ? <span>See Less</span> : <span>See More</span>}
                  </a>
                </div>
              </ExpansionPanelDetails>
            </ExpansionPanel>
            <ExpansionPanel
              expanded={true}
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
                <img src={require('images/obtain-care.svg')} />
                <Typography className={classes.panelHeading}>
                  When to obtain care/ When to call your doctor + Daily Monitoring
                </Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails className={classes.panelDetails}>
                <div className={classes.detailsContent}>
                  <ul className={`${classes.cdList} ${seemore ? classes.heightAuto : ''}`}>
                    <li>
                      Monitor your blood sugar controls and seek consultation from your doctor in
                      case you notice fluctuations in your sugar levels.
                    </li>
                    <li>
                      Pay attention for potential symptoms of COVID-19- including high fever,
                      shortness of breath, dry cough, sore throat, chills and loss of smell or
                      taste. If you are experiencing these symptoms, contact your doctor
                      immediately.
                    </li>
                    <li>
                      Monitor your blood sugar controls and seek consultation from your doctor in
                      case you notice fluctuations in your sugar levels.
                    </li>
                    <li>
                      Pay attention for potential symptoms of COVID-19- including high fever,
                      shortness of breath, dry cough, sore throat, chills and loss of smell or
                      taste. If you are experiencing these symptoms, contact your doctor
                      immediately.
                    </li>
                  </ul>

                  <a
                    href="javascript:void(0);"
                    className={classes.seemore}
                    onClick={() => setSeemore(!seemore)}
                  >
                    {seemore ? <span>See Less</span> : <span>See More</span>}
                  </a>
                </div>
              </ExpansionPanelDetails>
            </ExpansionPanel>
            <ExpansionPanel
              expanded={true}
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
                <img src={require('images/additional-prevention.svg')} />
                <Typography className={classes.panelHeading}>
                  Additional Preventive Measures
                </Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails className={classes.panelDetails}>
                <div className={classes.detailsContent}>
                  <ul
                    className={`${classes.cdList} ${classes.listStyleNone} ${
                      seemore ? classes.heightAuto : ''
                    }`}
                  >
                    <li>
                      Quit smoking and chewing of tobacco to have better control of your blood sugar
                      levels
                    </li>
                    <li>
                      <span className={classes.fontBold}>Physical</span> - ear, nose and throat
                      infections, injuries, under weight, diagnostic work up &amp; severe
                      respiratory, abdomen symptomsIf you show flu-like symptoms (raised
                      temperature, cough, sore throat, body pain, fatigue, runny nose, difficulty in
                      breathing, loss of smell), then consult a doctor immediately
                    </li>
                    <li>
                      Quit smoking and chewing of tobacco to have better control of your blood sugar
                      levels
                    </li>
                    <li>
                      <span className={classes.fontBold}>Physical</span> - ear, nose and throat
                      infections, injuries, under weight, diagnostic work up &amp; severe
                      respiratory, abdomen symptomsIf you show flu-like symptoms (raised
                      temperature, cough, sore throat, body pain, fatigue, runny nose, difficulty in
                      breathing, loss of smell), then consult a doctor immediately
                    </li>
                  </ul>

                  <a
                    href="javascript:void(0);"
                    className={classes.seemore}
                    onClick={() => setSeemore(!seemore)}
                  >
                    {seemore ? <span>See Less</span> : <span>See More</span>}
                  </a>
                </div>
              </ExpansionPanelDetails>
            </ExpansionPanel>
            <ExpansionPanel
              expanded={true}
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
                <img src={require('images/covid-positive.svg')} />
                <Typography className={classes.panelHeading}>Steps if COVID positive</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails className={classes.panelDetails}>
                <div className={classes.detailsContent}>
                  <ul className={`${classes.cdList} ${seemore ? classes.heightAuto : ''}`}>
                    <li>
                      If your COVID - 19 tests turn positive, consult a physician immediately to
                      assess your condition
                    </li>
                    <li>
                      If admitted in hospital as per doctor's consultation then strict supportive &
                      symptomatic treatment care including iv fluids, oxygen support, assisted prone
                      ventilation, iv medications, immunosuppressive medication, antipyretics would
                      be included in your treatment.
                    </li>
                    <li>
                      If your COVID - 19 tests turn positive, consult a physician immediately to
                      assess your condition
                    </li>
                    <li>
                      If admitted in hospital as per doctor's consultation then strict supportive &
                      symptomatic treatment care including iv fluids, oxygen support, assisted prone
                      ventilation, iv medications, immunosuppressive medication, antipyretics would
                      be included in your treatment.
                    </li>
                  </ul>

                  <a
                    href="javascript:void(0);"
                    className={classes.seemore}
                    onClick={() => setSeemore(!seemore)}
                  >
                    {seemore ? <span>See Less</span> : <span>See More</span>}
                  </a>
                </div>
              </ExpansionPanelDetails>
            </ExpansionPanel>
            <ExpansionPanel
              expanded={true}
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
                <img src={require('images/medication.svg')} />
                <Typography className={classes.panelHeading}>
                  Medications for Coronavirus
                </Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails className={classes.panelDetails}>
                <div className={classes.detailsContent}>
                  <ul className={`${classes.cdList} ${seemore ? classes.heightAuto : ''}`}>
                    <li>
                      Antipyretics (Paracetamol/Ibuprofen/Mefenamic Acid/Acetaminophen) - for fever
                      &amp; muscle pain
                    </li>
                    <li>Decongestants for running nose &amp; sore throat</li>
                  </ul>
                  <a
                    href="javascript:void(0);"
                    className={classes.seemore}
                    onClick={() => setSeemore(!seemore)}
                  >
                    {seemore ? <span>See Less</span> : <span>See More</span>}
                  </a>
                </div>
              </ExpansionPanelDetails>
            </ExpansionPanel>
            <ExpansionPanel
              expanded={true}
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
                <img src={require('images/clinical-resources.svg')} />
                <Typography className={classes.panelHeading}>Useful Clinical Sources</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails className={classes.panelDetails}>
                <div className={classes.detailsContent}>
                  <ul className={`${classes.cdList} ${seemore ? classes.heightAuto : ''}`}>
                    <li>https://www.medicalnewstoday.com/</li>
                    <li>https://www.webmd.com/</li>
                  </ul>
                  <a
                    href="javascript:void(0);"
                    className={classes.seemore}
                    onClick={() => setSeemore(!seemore)}
                  >
                    {seemore ? <span>See Less</span> : <span>See More</span>}
                  </a>
                </div>
              </ExpansionPanelDetails>
            </ExpansionPanel>
            <ExpansionPanel
              expanded={true}
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
                <img src={require('images/conclusion.svg')} />
                <Typography className={classes.panelHeading}>Conclusion</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails className={classes.panelDetails}>
                <div className={classes.detailsContent}>
                  <Typography>
                    All people with diabetes should be aware of the coronavirus infection and take
                    preventive measures to avoid the infection. However, if by chance, you get
                    infected by COVID-19 then first isolate yourself to avoid infecting other family
                    members or friends. Talk to your doctor right away if you test positive for
                    coronavirus. Your doctor will advise you on whether you should:
                  </Typography>

                  <ul className={`${classes.cdList} ${seemore ? classes.heightAuto : ''}`}>
                    <li>Stay home and quarantine yourself</li>
                    <li>Visit hospital for your health assessment</li>

                    <li>Contact emergency unit for urgent medical help</li>
                  </ul>
                  <a
                    href="javascript:void(0);"
                    className={classes.seemore}
                    onClick={() => setSeemore(!seemore)}
                  >
                    {seemore ? <span>See Less</span> : <span>See More</span>}
                  </a>
                </div>
              </ExpansionPanelDetails>
            </ExpansionPanel>
          </div>

          <CheckRiskLevel />
        </div>
      </div>
      {!onePrimaryUser && <ManageProfile />}
      <BottomLinks />
      {!isWebView && <NavigationBottom />}
    </div>
  );
};
