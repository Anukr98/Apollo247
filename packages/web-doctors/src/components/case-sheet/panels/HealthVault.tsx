import React, { Fragment } from 'react';
import {
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  createMuiTheme,
} from '@material-ui/core';
import { makeStyles, ThemeProvider } from '@material-ui/styles';
import { format } from 'date-fns';

const useStyles = makeStyles(() => ({
  vaultContainer: {
    width: '100%',
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
  },
}));

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#0087ba',
    },
  },
  typography: {
    body2: {
      fontSize: '10px',
    },
    h5: {
      fontSize: '14px',
    },
  },
});

const photoData = [
  {
    fileName: 'image001.jpg',
    size: '5MB',
    timestamp: '2019-08-05T11:05',
    thumbnail: require('images/patient_01.png'),
  },
  {
    fileName: 'image002.jpg',
    size: '4.5MB',
    timestamp: '2019-08-05T11:03',
    thumbnail: require('images/patient_01.png'),
  },
];

const reportData = [
  {
    fileName: 'bloodtest.pdf',
    size: '5MB',
    timestamp: '2019-08-05T11:05',
    thumbnail: require('images/patient_01.png'),
  },
];

export const HealthVault: React.FC = () => {
  const classes = useStyles();

  return (
    <ThemeProvider theme={theme}>
      <Typography component="div" className={classes.vaultContainer}>
        <Typography component="div">
          <Typography component="h5" variant="h5">
            Photos uploaded by Patient
          </Typography>
          <List className={classes.listContainer}>
            {photoData.map((item, idx) => (
              <ListItem key={idx} className={classes.listItem}>
                <ListItemAvatar>
                  <Avatar alt={item.fileName} src={item.thumbnail} className={classes.bigAvatar} />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Fragment>
                      <Typography component="h5" variant="h5" color="primary">
                        {item.fileName}
                      </Typography>
                    </Fragment>
                  }
                  secondary={
                    <Fragment>
                      <Typography component="span" variant="body2">
                        {item.size} | {format(new Date(item.timestamp), 'd MMM yyyy, h:mm a')}
                      </Typography>
                    </Fragment>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Typography>
        <Typography component="div">
          <Typography component="h5" variant="h5">
            Reports
          </Typography>
          <List className={classes.listContainer}>
            {reportData.map((item, idx) => (
              <ListItem key={idx} className={classes.listItem}>
                <ListItemAvatar>
                  <Avatar alt={item.fileName} src={item.thumbnail} className={classes.bigAvatar} />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Fragment>
                      <Typography component="h5" variant="h5" color="primary">
                        {item.fileName}
                      </Typography>
                    </Fragment>
                  }
                  secondary={
                    <Fragment>
                      <Typography component="span" variant="body2">
                        {item.size} | {format(new Date(item.timestamp), 'd MMM yyyy, h:mm a')}
                      </Typography>
                    </Fragment>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Typography>
      </Typography>
    </ThemeProvider>
  );
};
