import React, { useState, useContext, useEffect, useRef } from 'react';
import { Typography, Chip, Theme, Grid } from '@material-ui/core';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Button } from '@material-ui/core';
import { AphButton, AphTextField } from '@aph/web-ui-components';
import { useApolloClient } from 'react-apollo-hooks';
import {
  GetDoctorFavouriteAdviceList,
  GetDoctorFavouriteAdviceList_getDoctorFavouriteAdviceList_adviceList,
} from 'graphql/types/GetDoctorFavouriteAdviceList';
import { GET_DOCTOR_FAVOURITE_ADVICE_LIST } from 'graphql/profiles';
import { CaseSheetContext } from 'context/CaseSheetContext';
import { useParams } from 'hooks/routerHooks';
import { getLocalStorageItem, updateLocalStorageItem } from './LocalStorageUtils';
import { Compare } from '../../../helpers/Utils';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      height: 250,
      flexGrow: 1,
    },
    textFieldWrapper: {
      position: 'relative',
      marginTop: 6,
      '& button': {
        position: 'absolute',
        right: 0,
        top: 4,
        minWidth: 'auto',
        margin: 0,
        padding: 10,
        '& img': {
          margin: 0,
        },
      },
      '& textarea': {
        paddingRight: 50,
      },
    },
    chatSubmitBtn: {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      color: theme.palette.action.selected,
      fontSize: 14,
      fontWeight: 600,
      padding: 0,
      marginTop: 12,
      '&:hover': {
        backgroundColor: 'transparent',
        boxShadow: 'none',
      },
      '& img': {
        marginRight: 8,
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
        whiteSpace: 'pre-wrap',
        padding: '10px 80px 10px 10px',
      },
    },
    editImg: {
      position: 'absolute',
      right: 60,
      top: 10,
      cursor: 'pointer',
    },
    deleteImg: {
      position: 'absolute',
      right: 10,
      top: 10,
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
        boxShadow: 'none',
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

type Params = { id: string; patientId: string; tabValue: string };
export const OtherInstructions: React.FC = () => {
  const classes = useStyles({});
  const adviceInputRef = useRef(null);
  const params = useParams<Params>();

  const { otherInstructions: selectedValues, setOtherInstructions: setSelectedValues } = useContext(
    CaseSheetContext
  );
  const client = useApolloClient();
  const [isEditing, setIsEditing] = useState<any>(null);
  const { caseSheetEdit } = useContext(CaseSheetContext);
  const [idx, setIdx] = React.useState(0);
  const [adviceList, setAdviceList] = useState<
    (GetDoctorFavouriteAdviceList_getDoctorFavouriteAdviceList_adviceList | null)[] | null
  >([]);
  const [showAddInputText, setShowAddInputText] = useState<boolean>(false);
  const handleDelete = (item: any, idx: number) => {
    selectedValues!.splice(idx, 1);
    const storageItem = getLocalStorageItem(params.id);
    if (storageItem) {
      storageItem.otherInstructions = selectedValues;
      updateLocalStorageItem(params.id, storageItem);
    }
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

  const renderChipWithEditableField = (item: any, idx: number) => {
    if (isEditing === idx) {
      if (showAddInputText) {
        setShowAddInputText(false);
      }

      return (
        <div
          className={classes.textFieldWrapper}
          key={idx}
          style={{
            marginBottom: 12,
          }}
        >
          <AphTextField
            autoFocus
            fullWidth
            multiline
            placeholder="Enter instruction here.."
            defaultValue={item.instruction}
            inputRef={adviceInputRef}
          />
          <Button
            className={classes.chatSubmitBtn}
            disableRipple
            onClick={() => {
              const node = (adviceInputRef as any).current;
              if (node) {
                const adviceValue = node.value;
                const updatedText = adviceValue || item.instruction;
                if (updatedText.trim() !== '') {
                  selectedValues!.splice(idx, 1, {
                    instruction: updatedText,
                    __typename: 'OtherInstructions',
                  });

                  const storageItem = getLocalStorageItem(params.id);
                  if (storageItem) {
                    storageItem.otherInstructions = selectedValues;
                    updateLocalStorageItem(params.id, storageItem);
                  }

                  setSelectedValues(selectedValues);
                  setTimeout(() => {
                    node.value = '';
                    setIsEditing(false);
                  }, 10);
                } else {
                  node.value = item.instruction;
                  setIsEditing(false);
                }
              } else {
                console.log('No node selected');
              }
            }}
          >
            <img src={require('images/ic_plus.svg')} alt="" />
          </Button>
        </div>
      );
    }
    return (
      <Chip
        className={classes.othersBtn}
        key={idx}
        label={item!.instruction}
        icon={
          <img
            src={caseSheetEdit && require('images/ic_edit.svg')}
            alt=""
            height="20px"
            className={classes.editImg}
            onClick={() => {
              setIsEditing(idx);
            }}
          />
        }
        onDelete={() => handleDelete(item, idx)}
        deleteIcon={
          <img
            src={caseSheetEdit && require('images/ic_cancel_green.svg')}
            className={classes.deleteImg}
            alt=""
          />
        }
      />
    );
  };

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
                    item.instruction!.trim() !== '' &&
                    renderChipWithEditableField(item, idx)
                )}
            </Typography>
          </Typography>
          {showAddInputText && (
            <div className={classes.textFieldWrapper}>
              <AphTextField
                autoFocus
                fullWidth
                multiline
                placeholder="Enter instruction here.."
                inputRef={adviceInputRef}
              />
              <Button
                className={classes.chatSubmitBtn}
                disableRipple
                onClick={() => {
                  const node = (adviceInputRef as any).current;
                  if (node) {
                    const adviceValue = node.value;
                    if (adviceValue.trim() !== '') {
                      selectedValues!.splice(idx, 0, {
                        instruction: adviceValue,
                        __typename: 'OtherInstructions',
                      });
                      const storageItem = getLocalStorageItem(params.id);
                      if (storageItem) {
                        storageItem.otherInstructions = selectedValues;
                        updateLocalStorageItem(params.id, storageItem);
                      }
                      setSelectedValues(selectedValues);
                      setIdx(selectedValues!.length + 1);
                    }
                    node.value = '';
                    node.focus();
                  } else {
                    console.log('No node selected');
                  }
                }}
              >
                <img src={require('images/ic_plus.svg')} alt="" />
              </Button>
            </div>
          )}
          {!showAddInputText && caseSheetEdit && (
            <AphButton
              className={classes.btnAddDoctor}
              variant="contained"
              color="primary"
              onClick={() => {
                setShowAddInputText(true);
                setIsEditing(null);
              }}
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
                  adviceList!
                    .sort((a: any, b: any) => Compare(a, b, 'instruction'))
                    .map(
                      (item, idx) =>
                        item &&
                        item.instruction!.trim() !== '' && (
                          <div className={classes.othersBtnfav}>
                            <Chip className={classes.chip} key={idx} label={item!.instruction} />
                            <img
                              src={caseSheetEdit && require('images/add_doctor_white.svg')}
                              onClick={() => {
                                const node = (adviceInputRef as any).current;
                                if (item!.instruction.trim() !== '') {
                                  selectedValues!.splice(idx, 0, {
                                    instruction: item!.instruction,
                                    __typename: 'OtherInstructions',
                                  });
                                  const storageItem = getLocalStorageItem(params.id);
                                  if (storageItem) {
                                    storageItem.otherInstructions = selectedValues;
                                    updateLocalStorageItem(params.id, storageItem);
                                  }
                                  setSelectedValues(selectedValues);
                                  setIdx(selectedValues!.length + 1);
                                  setTimeout(() => {
                                    if (node) node.value = '';
                                  }, 10);
                                } else {
                                  if (node) node.value = '';
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
