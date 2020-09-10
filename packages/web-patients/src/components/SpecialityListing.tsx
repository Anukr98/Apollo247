import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Theme, Grid, CircularProgress, Popover, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import { NavigationBottom } from 'components/NavigationBottom';
import { AphInput, AphButton } from '@aph/web-ui-components';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { gtmTracking } from '../gtmTracking';
// import { SearchObject } from 'components/DoctorsFilter';
import { BottomLinks } from 'components/BottomLinks';
import { PastSearches } from 'components/PastSearches';
import { useAuth } from 'hooks/authHooks';
import { clientRoutes } from 'helpers/clientRoutes';
import { Link } from 'react-router-dom';
import fetchUtil from 'helpers/fetch';
import { SpecialtyDivision } from './SpecialtyDivision';
import {
  SearchDoctorAndSpecialtyByNameVariables,
  SearchDoctorAndSpecialtyByName,
  SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_doctors as DoctorsType,
  SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_specialties as SpecialtyType,
  SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_doctorsNextAvailability as NextAvailability,
} from 'graphql/types/SearchDoctorAndSpecialtyByName';
import { SEARCH_DOCTORS_AND_SPECIALITY_BY_NAME } from 'graphql/doctors';
import { useApolloClient } from 'react-apollo-hooks';
import { SpecialtySearch } from './SpecialtySearch';
import { WhyApollo } from 'components/Doctors/WhyApollo';
import { HowItWorks } from './Doctors/HowItWorks';
import { ManageProfile } from 'components/ManageProfile';
import { Relation } from 'graphql/types/globalTypes';
import { MetaTagsComp } from 'MetaTagsComp';
import { SchemaMarkup } from 'SchemaMarkup';
import { _debounce } from 'lodash';

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
          height: 170,
        },
      },
    },
    slCotent1: {
      [theme.breakpoints.down(650)]: {
        '&:after': {
          height: 280,
        },
      },
    },
    slnoDoctor: {
      [theme.breakpoints.down(650)]: {
        '&:after': {
          height: 400,
        },
      },

      [theme.breakpoints.down(340)]: {
        '&:after': {
          height: 440,
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
      '& >h2': {
        fontSize: 16,
        margin: '10px 0',
        color: '#00a7b9',
        fontWeight: 'bold',
        [theme.breakpoints.down('sm')]: {
          margin: '20px 0 10px',
        },
      },
    },
    slWrapper: {
      padding: '20px 0',
      [theme.breakpoints.down('sm')]: {
        padding: '20px',
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
      [theme.breakpoints.down('sm')]: {
        width: '100%',
      },
    },
    faqTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      margin: '0 0 20px',
      color: '#01667c',
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
      width: '95%',
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
      height: 180,
      background: '#fff',
      borderRadius: 10,
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      padding: 10,
      textAlign: 'center',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexDirection: 'column',
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
      fontSize: '10px !important',
      fontWeight: 500,
      color: '#02475b !important',
      padding: '0 !important',
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
    noDoctorContent: {
      padding: '10px 0',
      '& h2': {
        fontSize: 16,
        margin: '10px 0',
        color: '#00a7b9',
        fontWeight: 'bold',
      },
      '& p': {
        fontSize: 14,
        fontWeight: 700,
      },
      [theme.breakpoints.down(769)]: {
        padding: 0,
      },
    },
  };
});

const SpecialityListing: React.FC = (props) => {
  const classes = useStyles({});
  const scrollToRef = useRef<HTMLDivElement>(null);
  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();
  const apolloClient = useApolloClient();
  const { isSignedIn } = useAuth();
  const [expanded, setExpanded] = React.useState<string | false>(false);
  const prakticeSDKSpecialties = localStorage.getItem('symptomTracker');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [locationPopup, setLocationPopup] = useState<boolean>(false);
  const [searchSpecialty, setSearchSpecialty] = useState<SpecialtyType[] | null>(null);
  const [searchDoctors, setSearchDoctors] = useState<DoctorsType[] | null>(null);
  const [searchDoctorsNextAvailability, setSearchDoctorsNextAvailability] = useState<
    NextAvailability[] | null
  >(null);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [faqs, setFaqs] = useState<any | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [faqSchema, setFaqSchema] = useState(null);
  const onePrimaryUser =
    allCurrentPatients && allCurrentPatients.filter((x) => x.relation === Relation.ME).length === 1;

  const handleChange = (panel: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
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

  const createFaqSchema = (faqData: any) => {
    const mainEntity: any[] = [];
    faqData &&
      faqData.onlineConsultation &&
      faqData.onlineConsultation.length > 0 &&
      Object.values(faqData.onlineConsultation).map((faqs: any) => {
        mainEntity.push({
          '@type': 'Question',
          name: faqs.faqQuestion,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faqs.faqAnswer,
          },
        });
      });
    setFaqSchema({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity,
    });
  };

  useEffect(() => {
    if (!faqs) {
      scrollToRef &&
        scrollToRef.current &&
        scrollToRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
      fetchUtil(process.env.SPECIALTY_LISTING_FAQS, 'GET', {}, '', true).then((res: any) => {
        if (res && res.success === 'true' && res.data && res.data.length > 0) {
          setFaqs(res.data[0]);
          createFaqSchema(res.data[0]);
        }
      });
    }
  }, [faqs]);

  const fetchData = (searchKeyword: any, selectedCity: any) => {
    apolloClient
      .query<SearchDoctorAndSpecialtyByName, SearchDoctorAndSpecialtyByNameVariables>({
        query: SEARCH_DOCTORS_AND_SPECIALITY_BY_NAME,
        variables: {
          searchText: searchKeyword,
          patientId: currentPatient ? currentPatient.id : '',
          city: selectedCity,
        },
        fetchPolicy: 'no-cache',
      })
      .then((response) => {
        const specialtiesAndDoctorsList =
          response && response.data && response.data.SearchDoctorAndSpecialtyByName;
        if (specialtiesAndDoctorsList) {
          const doctorsArray = specialtiesAndDoctorsList.doctors || [];
          const specialtiesArray = specialtiesAndDoctorsList.specialties || [];
          setSearchSpecialty(specialtiesArray);
          setSearchDoctors(doctorsArray);
          setSearchDoctorsNextAvailability(specialtiesAndDoctorsList.doctorsNextAvailability || []);
        }
      })
      .catch((e) => {
        console.log(e);
        setSearchSpecialty([]);
        setSearchDoctors([]);
        setSearchDoctorsNextAvailability([]);
      })
      .finally(() => {
        setSearchLoading(false);
      });
  };
  const debounceLoadData = useCallback(_debounce(fetchData, 300), []);
  useEffect(() => {
    if (searchKeyword.length > 2 || selectedCity.length) {
      setSearchLoading(true);
      debounceLoadData(searchKeyword, selectedCity);
    }
  }, [searchKeyword, selectedCity]);

  const metaTagProps = {
    title: 'Online Doctor Consultation via Video Call / Audio / Chat - Apollo 247',
    description:
      'Online doctor consultation in 15 mins with 1000+ Top Specialist Doctors. Video Call or Chat with a Doctor from 100+ Specialties including General Physicians, Pediatricians, Dermatologists, Gynaecologists & more.',
    canonicalLink: window && window.location && window.location.href,
  };

  const breadcrumbJSON = {
    '@context': 'https://schema.org/',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'HOME', item: 'https://www.apollo247.com/' },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'SPECIALTIES',
        item: 'https://www.apollo247.com/specialties',
      },
    ],
  };

  return (
    <div className={classes.slContainer}>
      <MetaTagsComp {...metaTagProps} />
      <SchemaMarkup structuredJSON={breadcrumbJSON} />
      {faqSchema && <SchemaMarkup structuredJSON={faqSchema} />}
      <Header />
      <div className={classes.container}>
        <div className={`${classes.slContent} ${currentPatient ? classes.slCotent1 : ''}`}>
          {/* Please add a class slnoDoctor here when showing up noDoctor Content */}
          <div className={classes.pageHeader} ref={scrollToRef}>
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
                    <Typography component="h1">Online Doctor Consultation</Typography>
                  </div>
                  <SpecialtySearch
                    setSearchKeyword={setSearchKeyword}
                    searchKeyword={searchKeyword}
                    selectedCity={selectedCity}
                    searchSpecialty={searchSpecialty}
                    searchDoctors={searchDoctors}
                    searchLoading={searchLoading}
                    setLocationPopup={setLocationPopup}
                    locationPopup={locationPopup}
                    setSelectedCity={setSelectedCity}
                    searchDoctorsNextAvailability={searchDoctorsNextAvailability}
                  />
                  {currentPatient && currentPatient.id && searchKeyword.length <= 0 && (
                    <PastSearches />
                  )}
                  {selectedCity !== '' && searchDoctors && searchDoctors.length === 0 && (
                    <div className={classes.noDoctorContent}>
                      <Typography component="h2">
                        No Specialties/Doctors found near {selectedCity}. Don’t worry, now you can
                        consult doctors from any city using Chat/Audio/Video.
                      </Typography>
                      <Typography>
                        How ? Choose a doctor &gt; Book a slot &gt; Make a payment &gt; Consult via
                        video/audio/chat &gt; Receive prescription instantly &gt; Chat with the
                        doctor for 6 days after your consult
                      </Typography>
                    </div>
                  )}
                  <SpecialtyDivision
                    selectedCity={selectedCity}
                    doctorsCount={searchDoctors ? searchDoctors.length : 0}
                  />
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
                  <WhyApollo />
                  <HowItWorks />
                </div>
              </Grid>
            </Grid>
          </div>
          {faqs && faqs.onlineConsultation && faqs.onlineConsultation.length > 0 && (
            <div className={classes.faq}>
              <div className={classes.faqTitle}>Frequently asked questions</div>
              {faqs.onlineConsultation.map((que: any) => (
                <ExpansionPanel
                  key={que.id}
                  className={classes.panelRoot}
                  expanded={expanded === que.id}
                  onChange={handleChange(que.id)}
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
                      {que.faqQuestion}
                    </Typography>
                  </ExpansionPanelSummary>
                  <ExpansionPanelDetails className={classes.panelDetails}>
                    <div className={classes.detailsContent}>{que.faqAnswer}</div>
                  </ExpansionPanelDetails>
                </ExpansionPanel>
              ))}
            </div>
          )}
        </div>
      </div>
      {!onePrimaryUser && <ManageProfile />}
      <NavigationBottom />
      <div className={classes.footerLinks}>
        <BottomLinks />
      </div>
    </div>
  );
};

export default SpecialityListing;
