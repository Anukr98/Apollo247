import React, { useState, useContext } from 'react';
import { Typography, Chip, Theme } from '@material-ui/core';
import { makeStyles, createStyles } from '@material-ui/styles';
import { InputBase, Button } from '@material-ui/core';
// import {
//   GetJuniorDoctorCaseSheet,
//   GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_otherInstructions,
// } from 'graphql/types/GetJuniorDoctorCaseSheet';
import { GetCaseSheet_getCaseSheet_pastAppointments_caseSheet_otherInstructions } from 'graphql/types/GetCaseSheet';
import { CaseSheetContext } from 'context/CaseSheetContext';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      height: 250,
      flexGrow: 1,
    },
    textFieldColor: {
      '& input': {
        color: 'initial',
        '& :before': {
          border: 0,
        },
      },
    },
    textFieldWrapper: {
      border: 'solid 1px #30c1a3',
      borderRadius: 10,
      width: '100%',
      padding: 16,
      color: '#01475b',
      fontSize: 14,
      fontWeight: 500,
      position: 'relative',
      paddingRight: 48,
    },
    chatSubmitBtn: {
      position: 'absolute',
      top: '50%',
      marginTop: -18,
      right: 10,
      minWidth: 'auto',
      padding: 0,
      '& img': {
        maxWidth: 36,
      },
    },
    contentContainer: {
      display: 'flex',
      flexFlow: 'row',
      flexWrap: 'wrap',
      width: '100%',
      '& h5': {
        color: 'rgba(2, 71, 91, 0.6)',
        fontSize: 14,
        fontWeight: 500,
        marginBottom: 12,
      },
    },
    column: {
      width: '49%',
      display: 'flex',
      marginRight: '1%',
      flexDirection: 'column',
      marginBottom: 10,
    },
    listContainer: {
      display: 'flex',
      flexFlow: 'column',
    },
    othersBtn: {
      border: '1px solid rgba(2, 71, 91, 0.15)',
      backgroundColor: 'rgba(0,0,0,0.02)',
      height: 44,
      marginBottom: 12,
      borderRadius: 5,
      fontWeight: 600,
      fontSize: 14,
      color: '#02475b !important',
      '&:focus': {
        backgroundColor: 'rgba(0,0,0,0.02)',
      },
      '& span': {
        display: 'inline-block',
        width: '100%',
        textAlign: 'left',
      },
    },
  })
);

export const OtherInstructions: React.FC = () => {
  const classes = useStyles();
  const { otherInstructions: selectedValues, setOtherInstructions: setSelectedValues } = useContext(
    CaseSheetContext
  );

  const [otherInstruct, setOtherInstruct] = useState('');
  const [defaultValue, setDefaultValue] = useState('');
  const { caseSheetEdit } = useContext(CaseSheetContext);
  const [idx, setIdx] = React.useState();

  const handleDelete = (item: any, idx: number) => {
    selectedValues!.splice(idx, 1);
    setSelectedValues(selectedValues);
    const sum = idx + Math.random();
    setIdx(sum);
  };

  return (
    <Typography component="div" className={classes.contentContainer}>
      <Typography component="div" className={classes.column}>
        <Typography component="h5" variant="h5">
          Instructions to the patient
        </Typography>
        <Typography component="div" className={classes.listContainer}>
          {selectedValues !== null &&
            selectedValues.length > 0 &&
            selectedValues!.map((item, idx) => (
              <Chip
                className={classes.othersBtn}
                key={idx}
                label={item!.instruction}
                onDelete={() => handleDelete(item, idx)}
                deleteIcon={
                  <img src={caseSheetEdit && require('images/ic_cancel_green.svg')} alt="" />
                }
              />
            ))}
        </Typography>
      </Typography>

      {caseSheetEdit && (
        <Typography component="div" className={classes.textFieldWrapper}>
          <InputBase
            fullWidth
            className={classes.textFieldColor}
            placeholder="Enter instruction here.."
            defaultValue={defaultValue}
            onChange={(e) => {
              setOtherInstruct(e.target.value);
            }}
          ></InputBase>
          <Button
            className={classes.chatSubmitBtn}
            onClick={() => {
              if (otherInstruct !== '') {
                selectedValues!.splice(idx, 0, {
                  instruction: otherInstruct,
                  __typename: 'OtherInstructions',
                });
                setSelectedValues(selectedValues);
                setIdx(selectedValues!.length + 1);
              }
            }}
          >
            <img src={require('images/ic_plus.png')} alt="" />
          </Button>
        </Typography>
      )}
    </Typography>
  );
};
