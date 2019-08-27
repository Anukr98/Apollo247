import React, { Fragment } from 'react';
import { Typography, List, ListItem, ListItemText } from '@material-ui/core';
//import { GetJuniorDoctorCaseSheet } from 'graphql/types/GetJuniorDoctorCaseSheet';
import {
  GetCaseSheet,
} from 'graphql/types/GetCaseSheet';
import { makeStyles } from '@material-ui/styles';
const useStyles = makeStyles(() => ({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    display: 'flex',
    flex: 1,
    border: 'solid 1px rgba(2, 71, 91, 0.15)',
    borderRadius: '5px',
  },
  listItem: {
    display: 'flex',
    flexFlow: 'column',
    padding: '4px 0 0 12px',
    '& h6': {
      fontSize: 12,
      color: '#01475b',
      fontWeight: 'normal',
    },
    '& h3': {
      fontSize: 14,
      color: '#01475b',
      fontWeight: 500,
    },
  },
  symtomHeading: {
    margin: '5px 0 0 0',
    '& span': {
      fontSize: 14,
      color: '#01475b',
      fontWeight: 500,
    },
  },
  symtomContent: {
    padding: '0 0 0 10px',
    '& div': {
      margin: 0,
    },
    '& p': {
      '& span': {
        fontSize: 12,
        color: '#01475b',
        fontWeight: 'normal',
      },
    },
  },
  symtomList: {
    padding: '0 0 10px 0',
    '& ul': {
      padding: 0,
    },
  },
}));
interface CasesheetInfoProps {
  casesheetInfo: GetCaseSheet;
}
export const Symptoms: React.FC<CasesheetInfoProps> = (props) => {
  const classes = useStyles();
  return (
    <Typography className={classes.container} component="div">
      {props.casesheetInfo &&
      props.casesheetInfo.getCaseSheet &&
      props.casesheetInfo.getCaseSheet.caseSheetDetails ? (
        <List className={classes.symtomList}>
          {props.casesheetInfo.getCaseSheet.caseSheetDetails.symptoms &&
            props.casesheetInfo.getCaseSheet.caseSheetDetails.symptoms.length > 0 &&
            props.casesheetInfo.getCaseSheet.caseSheetDetails.symptoms.map(
              (item, idx) => (
                <ListItem key={idx} alignItems="flex-start" className={classes.listItem}>
                  <ListItemText className={classes.symtomHeading} primary={item!.symptom} />
                  <Fragment>
                    <List>
                      {item!.since && (
                        <ListItem alignItems="flex-start" className={classes.symtomContent}>
                          <ListItemText
                            secondary={
                              <Fragment>
                                <Typography component="span">Since: {item!.since}</Typography>
                              </Fragment>
                            }
                          />
                        </ListItem>
                      )}
                      {item!.howOften && (
                        <ListItem alignItems="flex-start" className={classes.symtomContent}>
                          <ListItemText
                            secondary={
                              <Fragment>
                                <Typography component="span">
                                  How Often : {item!.howOften}
                                </Typography>
                              </Fragment>
                            }
                          />
                        </ListItem>
                      )}
                      {item!.severity && (
                        <ListItem alignItems="flex-start" className={classes.symtomContent}>
                          <ListItemText
                            secondary={
                              <Fragment>
                                <Typography component="span">Severity: {item!.severity}</Typography>
                              </Fragment>
                            }
                          />
                        </ListItem>
                      )}
                    </List>
                  </Fragment>
                </ListItem>
              )
            )}
        </List>
      ) : (
        'NO data Found'
      )}
    </Typography>
  );
};
