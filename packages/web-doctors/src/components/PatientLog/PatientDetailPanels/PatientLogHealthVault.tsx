import React, { Fragment, useContext } from 'react';
import {
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  createMuiTheme,
} from '@material-ui/core';
import { Link } from 'react-router-dom';
import { makeStyles, ThemeProvider } from '@material-ui/styles';
import { CaseSheetContext } from 'context/CaseSheetContext';

const useStyles = makeStyles(() => ({
  vaultContainer: {
    width: '100%',
    '& h5': {
      fontSize: 14,
      fontWeight: 500,
      color: 'rgba(2,71,91,0.6)',
      padding: 0,
      marginTop: 15,
    },
    '& h4': {
      fontSize: 14,
      fontWeight: 600,
      color: '#0087ba',
      padding: 0,
    },
    '& h6': {
      fontSize: 10,
      fontWeight: 500,
      color: 'rgba(2,71,91,0.6)',
      marginTop: 6,
    },
  },
  bigAvatar: {
    width: '60px',
    height: '60px',
    borderRadius: '5px',
    marginRight: '10px',
  },
  listContainer: {
    display: 'flex',
    flexFlow: 'row',
    flowWrap: 'wrap',
    width: '100%',
  },
  listItem: {
    width: '49%',
    marginRight: '1%',
    padding: 0,
  },
  stepperHeading: {
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: 'normal',
    color: '#0087ba !important',
    position: 'relative',
    top: -5,
  },
  videoIcon: {
    position: 'absolute',
    top: 7,
    right: 15,
    '& img': {
      width: 20,
    },
  },
  circleDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#02475b',
    position: 'absolute',
    left: -5,
  },
  listStyle: {
    display: 'flex',
    flexFlow: 'column',
    alignItems: 'start',
    width: '100%',
    borderLeft: '1px solid #02475b',
    padding: 0,
  },
  childListStyle: {
    display: 'flex',
    flexFlow: 'column',
    alignItems: 'start',
    width: '100%',
    borderLeft: 'none',
    paddingLeft: 0,
  },
  nodataFound: {
    fontSize: 14,
  },
}));

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#0087ba',
    },
  },
  typography: {
    fontFamily: ['IBM Plex Sans', 'sans-serif'].join(','),
    body2: {
      fontSize: '10px',
      fontWeight: 500,
      lineHeight: 1.2,
      color: 'rgba(2, 71, 91, 0.6)',
    },

    h5: {
      fontSize: '14px',
    },
  },
});

export const PatientLogHealthVault: React.FC = () => {
  const classes = useStyles({});
  const ischild: boolean = false;
  const { healthVault } = useContext(CaseSheetContext);

  return (
    <ThemeProvider theme={theme}>
      <Typography component="div" className={classes.vaultContainer}>
        <Typography component="div">
          <Typography component="h5" variant="h5">
            Photos uploaded by Patient
          </Typography>
          <List className={classes.listContainer}>
            {healthVault && healthVault.length > 0 ? (
              healthVault!.map((item, index) => (
                <ListItem key={index} className={classes.listItem}>
                  <ListItemAvatar>
                    <Avatar
                      alt={(item.imageUrls as unknown) as string}
                      src={(item.imageUrls as unknown) as string}
                      className={classes.bigAvatar}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Fragment>
                        <Typography component="h4" variant="h4" color="primary">
                          {item.imageUrls!.substr(item.imageUrls!.lastIndexOf('/') + 1)}
                        </Typography>
                      </Fragment>
                    }
                    secondary={
                      <Fragment>
                        <Typography component="h6" variant="h6"></Typography>
                      </Fragment>
                    }
                  />
                </ListItem>
              ))
            ) : (
              <span className={classes.nodataFound}>No data Found</span>
            )}
          </List>
        </Typography>
        <Typography component="div">
          <Typography component="h5" variant="h5">
            Reports
          </Typography>
          <List className={classes.listContainer}>
            {healthVault && healthVault.length > 0 ? (
              healthVault!.map((item, index) => (
                <ListItem key={index} className={classes.listItem}>
                  <ListItemAvatar>
                    <Link to={(item.reportUrls as unknown) as string} target="_blank">
                      <Avatar
                        alt={(item.reportUrls as unknown) as string}
                        src={(item.reportUrls as unknown) as string}
                        className={classes.bigAvatar}
                      />
                    </Link>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Fragment>
                        <Typography component="h4" variant="h4" color="primary">
                          {item.reportUrls!.substr(item.reportUrls!.lastIndexOf('/') + 1)}
                        </Typography>
                      </Fragment>
                    }
                  />
                </ListItem>
              ))
            ) : (
              <span className={classes.nodataFound}>No data Found</span>
            )}
          </List>
        </Typography>
      </Typography>
    </ThemeProvider>
  );
};
