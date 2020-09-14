import React from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import { HeroBanner } from 'components/HeroBanner';
import { ManageProfile } from 'components/ManageProfile';
import { NavigationBottom } from 'components/NavigationBottom';
import { useAuth, useAllCurrentPatients } from 'hooks/authHooks';
import { PatientsOverview } from 'components/PatientsOverview';
import { Relation } from 'graphql/types/globalTypes';
import { WeAreHelpYou } from 'components/WeAreHelpYou';
import { BottomLinks } from 'components/BottomLinks';
import { SchemaMarkup } from 'SchemaMarkup';
import { MetaTagsComp } from 'MetaTagsComp';

const useStyles = makeStyles((theme: Theme) => {
  return {
    welcome: {
      paddingBottom: 0,
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    pageContainer: {
      overflow: 'hidden',
      [theme.breakpoints.up('sm')]: {
        boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
        backgroundColor: '#f7f8f5',
      },
    },
    pageContent: {
      padding: '0 20px 20px 20px',
      [theme.breakpoints.up('sm')]: {
        padding: '5px 40px 40px 40px',
      },
    },
  };
});

export const Welcome: React.FC = (props) => {
  const classes = useStyles({});
  const { isSignedIn } = useAuth();
  const { allCurrentPatients } = useAllCurrentPatients();
  const onePrimaryUser =
    allCurrentPatients && allCurrentPatients.filter((x) => x.relation === Relation.ME).length === 1;
  const structuredJSON = {
    '@context': 'https://schema.org/',
    '@type': 'WebSite',
    name: 'Apollo 24*7',
    url: 'https://www.apollo247.com/',
  };
  const metaTagProps = {
    title: 'Apollo 247 - Online Doctor Consultation & Online Medicines, Apollo Pharmacies Near Me',
    description:
      'Apollo 24|7 helps you get treated from Apollo certified doctors at any time of the day, wherever you are. The mobile app has features like e-consultation in 15 minutes, online pharmacy to doorstep delivery of medicines, home diagnostic test and digital vault where you can upload all your medical history.',
    canonicalLink: window && window.location && window.location.href,
  };

  return (
    <div className={classes.welcome}>
      <Header />
      <MetaTagsComp {...metaTagProps} />
      {structuredJSON && <SchemaMarkup structuredJSON={structuredJSON} />}
      <div className={classes.container}>
        <div className={classes.pageContainer}>
          <HeroBanner />
          <div className={classes.pageContent}>
            {isSignedIn && <PatientsOverview />}
            <WeAreHelpYou />
          </div>
        </div>
      </div>
      {!onePrimaryUser && <ManageProfile />}
      <BottomLinks />
      <NavigationBottom />
    </div>
  );
};
