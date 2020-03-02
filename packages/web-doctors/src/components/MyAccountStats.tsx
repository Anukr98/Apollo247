import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React, { useState, useEffect } from 'react';
import ApolloClient from 'apollo-boost';
import Report from 'react-powerbi';
import gql from 'graphql-tag';
import { useAuth } from 'hooks/authHooks';

const dashboardClient = new ApolloClient({
  uri: process.env.DASHBOARD_URL,
  request: (operation) => {
    const token = process.env.AUTH_TOKEN;
    const userId = '';
    operation.setContext({
      headers: {
        Authorization: token ? `${token}` : 'adminLogin',
        userId: userId ? `${userId}` : '',
      },
    });
  },
});
const useStyles = makeStyles((theme: Theme) => {
  return {
    ProfileContainer: {
      paddingLeft: 0,
      '& h2': {
        fontSize: 16,
        color: theme.palette.secondary.dark,
        marginBottom: 15,
        paddingTop: 0,
      },
      '& h3': {
        lineHeight: '22px',
        padding: '3px 5px 5px 20px',
      },
      '& h4': {
        padding: '5px 5px 5px 0',
        marginLeft: 20,
        borderBottom: 'solid 0.5px rgba(98,22,64,0.2)',
      },
      '& h5': {
        padding: '5px 5px 3px 20px',
        fontWeight: 500,
      },
      '& h6': {
        color: '#658f9b',
        padding: '5px 5px 0 0',
        letterSpacing: '0.3px',
        marginLeft: 20,
        fontWeight: theme.typography.fontWeightMedium,
        '& span': {
          padding: '0 2px',
        },
      },
    },

    helpTxt: {
      color: '#0087ba',
      fontSize: 16,
      lineHeight: 1.38,
      fontWeight: 500,
    },
  };
});

const GET_POWERBI_TOKEN = gql`
  query {
    getPowerBiToken {
      token_type
      scope
      expires_in
      ext_expires_in
      expires_on
      not_before
      resource
      access_token
      refresh_token
    }
  }
`;

export const MyAccountStats: React.FC = () => {
  const classes = useStyles();
  const apiDetails = {
    embedUrl: process.env.POWERBI_EMBED_URL,
    filterSchema: process.env.POWERBI_FILTER_SCHEMA,
    clientId: process.env.POWERBI_CLIENT_ID,
    clientSecret: process.env.POWERBI_CLIENT_SECRET,
    userName: process.env.POWERBI_USER_NAME,
    password: process.env.POWERBI_PASSWORD,
    resource: process.env.RESOURCE,
  };
  const [accessToken, setAccessToken] = useState('');
  const { currentPatient: currentDoctor, isSignedIn, sessionClient } = useAuth();
  const doctorId = currentDoctor!.id;
  useEffect(() => {
    if (!accessToken) {
      dashboardClient
        .query<any>({
          query: GET_POWERBI_TOKEN,
          variables: {},
          fetchPolicy: 'no-cache',
        })

        .then(({ data }) => {
          console.log('flitered array', data.getPowerBiToken.access_token);
          setAccessToken(data.getPowerBiToken.access_token);
        })
        .catch((e) => {});
    }
  }, [accessToken]);
  const filter = {
    $schema: apiDetails.filterSchema,
    target: {
      table: 'doctors',
      column: 'aid',
    },
    operator: 'In',
    values: [doctorId],
  };
  const onEmbedded = (report: any) => {
    setTimeout(() => {
      if (report && report.iframe && report.iframe.contentWindow) {
        report &&
          report
            .getPages()
            .then((pages: any) => {
              const activePage = pages.filter((page: any) => page.isActive)[0];
              activePage
                .setFilters([filter])
                .then(() => {
                  console.log('Page filter was set.');
                })
                .catch((error: any) => {
                  const errorMessage = error && error.message ? error.message : 'Unknown';
                  alert(`An error occurred while fetching the report: ${errorMessage}`);
                });
            })
            .catch((error: any) => {
              const errorMessage = error && error.message ? error.message : 'Unknown';
              alert(`An error occurred while fetching the report: ${errorMessage}`);
            });
      }
    }, 2000);
  };
  return !accessToken ? null : (
    <Report
      id={process.env.POWERBI_MIS_REPORT_ID}
      embedUrl={process.env.POWERBI_MIS_REPORT_URL}
      accessToken={accessToken}
      navContentPaneEnabled={false}
      embedType="report"
      tokenType={0}
      height="500px"
      onEmbedded={onEmbedded}
      filterPaneEnabled={false}
    />
  );
};
