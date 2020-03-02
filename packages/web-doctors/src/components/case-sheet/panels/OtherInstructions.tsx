import React, { useState, useContext, useEffect } from 'react';
import { Typography, Chip, Theme, Grid } from '@material-ui/core';
import { makeStyles, createStyles } from '@material-ui/styles';
import { InputBase, Button } from '@material-ui/core';
import { AphButton } from '@aph/web-ui-components';
import { useApolloClient } from 'react-apollo-hooks';
import {
  GetDoctorFavouriteAdviceList,
  GetDoctorFavouriteAdviceList_getDoctorFavouriteAdviceList_adviceList,
} from 'graphql/types/GetDoctorFavouriteAdviceList';
import { GET_DOCTOR_FAVOURITE_ADVICE_LIST } from 'graphql/profiles';
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
      width: '100%',
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
      height: 'auto',
      marginBottom: 12,
      borderRadius: 5,
      fontWeight: 600,
      fontSize: 14,
      color: '#02475b !important',
      position: 'relative',
      '&:focus': {
        backgroundColor: 'rgba(0,0,0,0.02)',
      },
      '& span': {
        display: 'inline-block',
        width: '100%',
        textAlign: 'left',
        whiteSpace: 'normal',
        padding: '10px 50px 10px 10px',
      },
      '& img': {
        position: 'absolute',
        right: 10,
        top: 10,
      },
    },
    othersBtnfavContainer: {
      border: '1px solid rgba(2, 71, 91, 0.15)',
      backgroundColor: 'rgba(0,0,0,0.02)',
      borderRadius: 5,
      padding: '0 10px',
    },
    othersBtnfav: {
      height: 'auto',
      borderBottom: '1px solid rgba(2, 71, 91, 0.15)',
      fontWeight: 600,
      fontSize: 14,
      color: '#02475b !important',
      padding: '5px 0',
      position: 'relative',
      '& img': {
        float: 'right',
        border: '1px solid #00b38e',
        borderRadius: '50%',
        maxWidth: 24,
        position: 'absolute',
        top: 12,
        right: 2,
      },
      '& div': {
        height: 'auto',
      },
      '&:focus': {
        backgroundColor: 'rgba(0,0,0,0.02)',
      },
      '&:last-child': {
        borderBottom: 'none',
      },
      '& span': {
        display: 'inline-block',
        width: '100%',
        textAlign: 'left',
        whiteSpace: 'normal',
        padding: 10,
        wordBreak: 'break-word',
        paddingRight: 30,
        color: '#02475b !important',
        fontSize: 14,
      },
    },
    btnAddDoctor: {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      color: theme.palette.action.selected,
      fontSize: 14,
      fontWeight: 600,
      paddingLeft: 4,
      '&:hover': {
        backgroundColor: 'transparent',
      },
      '& img': {
        marginRight: 8,
      },
    },
    chip: {
      background: 'transparent',
    },
  })
);

export const OtherInstructions: React.FC = () => {
  const classes = useStyles();
  const { otherInstructions: selectedValues, setOtherInstructions: setSelectedValues } = useContext(
    CaseSheetContext
  );
  const client = useApolloClient();
  const [otherInstruct, setOtherInstruct] = useState('');
  const { caseSheetEdit } = useContext(CaseSheetContext);
  const [idx, setIdx] = React.useState();
  const [adviceList, setAdviceList] = useState<
    (GetDoctorFavouriteAdviceList_getDoctorFavouriteAdviceList_adviceList | null)[] | null
  >([]);
  const [showAddInputText, setShowAddInputText] = useState<boolean>(false);
  const handleDelete = (item: any, idx: number) => {
    selectedValues!.splice(idx, 1);
    setSelectedValues(selectedValues);
    const sum = idx + Math.random();
    setIdx(sum);
  };

  useEffect(() => {
    client
      .query<GetDoctorFavouriteAdviceList>({
        query: GET_DOCTOR_FAVOURITE_ADVICE_LIST,
        fetchPolicy: 'no-cache',
      })
      .then((data) => {
        setAdviceList(
          data.data.getDoctorFavouriteAdviceList &&
            data.data.getDoctorFavouriteAdviceList.adviceList
        );
      });
  }, []);

  return (
    <Typography component="div" className={classes.contentContainer}>
      <Grid container spacing={1}>
        <Grid item lg={6} xs={12}>
          <Typography component="div" className={classes.column}>
            <Typography component="h5" variant="h5">
              Instructions to the patient
            </Typography>
            <Typography component="div" className={classes.listContainer}>
              {selectedValues !== null &&
                selectedValues.length > 0 &&
                selectedValues!.map(
                  (item, idx) =>
                    item &&
                    item.instruction!.trim() !== '' && (
                      <Chip
                        className={classes.othersBtn}
                        key={idx}
                        label={item!.instruction}
                        onDelete={() => handleDelete(item, idx)}
                        deleteIcon={
                          <img
                            src={caseSheetEdit && require('images/ic_cancel_green.svg')}
                            alt=""
                          />
                        }
                      />
                    )
                )}
            </Typography>
          </Typography>
          {showAddInputText && (
            <Typography component="div" className={classes.textFieldWrapper}>
              <InputBase
                autoFocus
                fullWidth
                className={classes.textFieldColor}
                placeholder="Enter instruction here.."
                value={otherInstruct}
                onChange={(e) => {
                  setOtherInstruct(e.target.value);
                }}
              ></InputBase>
              <Button
                className={classes.chatSubmitBtn}
                onClick={() => {
                  if (otherInstruct.trim() !== '') {
                    selectedValues!.splice(idx, 0, {
                      instruction: otherInstruct,
                      __typename: 'OtherInstructions',
                    });
                    setSelectedValues(selectedValues);
                    setIdx(selectedValues!.length + 1);
                    setTimeout(() => {
                      setOtherInstruct('');
                    }, 10);
                  } else {
                    setOtherInstruct('');
                  }
                }}
              >
                <img src={require('images/ic_plus.png')} alt="" />
              </Button>
            </Typography>
          )}
          {!showAddInputText && caseSheetEdit && (
            <AphButton
              className={classes.btnAddDoctor}
              variant="contained"
              color="primary"
              onClick={() => setShowAddInputText(true)}
            >
              <img src={require('images/ic_dark_plus.svg')} alt="" /> ADD INSTRUCTIONS
            </AphButton>
          )}
        </Grid>
        {caseSheetEdit && adviceList !== null && adviceList.length > 0 && (
          <Grid item lg={6} xs={12}>
            <Typography component="h5" variant="h5">
              Favourite Instructions
            </Typography>
            <Typography component="div" className={classes.listContainer}>
              <div className={classes.othersBtnfavContainer}>
                {adviceList !== null &&
                  adviceList.length > 0 &&
                  adviceList!.map(
                    (item, idx) =>
                      item &&
                      item.instruction!.trim() !== '' && (
                        <div className={classes.othersBtnfav}>
                          <Chip className={classes.chip} key={idx} label={item!.instruction} />
                          <img
                            src={caseSheetEdit && require('images/add_doctor_white.svg')}
                            onClick={() => {
                              if (item!.instruction.trim() !== '') {
                                selectedValues!.splice(idx, 0, {
                                  instruction: item!.instruction,
                                  __typename: 'OtherInstructions',
                                });
                                setSelectedValues(selectedValues);
                                setIdx(selectedValues!.length + 1);
                                setTimeout(() => {
                                  setOtherInstruct('');
                                }, 10);
                              } else {
                                setOtherInstruct('');
                              }
                            }}
                            alt=""
                          />
                        </div>
                      )
                  )}
              </div>
            </Typography>
          </Grid>
        )}
      </Grid>
    </Typography>
  );
};
