import React, { useState, useEffect } from 'react';
import { Typography, Theme } from '@material-ui/core';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Button } from '@material-ui/core';
import { AphButton } from '@aph/web-ui-components';
import { useApolloClient } from 'react-apollo-hooks';
import { Paper, Modal, CircularProgress } from '@material-ui/core';
import { AphTextField, AphDialogTitle } from '@aph/web-ui-components';
import {
  AddDoctorFavouriteAdvice,
  AddDoctorFavouriteAdviceVariables,
} from 'graphql/types/AddDoctorFavouriteAdvice';
import {
  DeleteDoctorFavouriteAdvice,
  DeleteDoctorFavouriteAdviceVariables,
} from 'graphql/types/DeleteDoctorFavouriteAdvice';
import {
  GetDoctorFavouriteAdviceList,
  GetDoctorFavouriteAdviceList_getDoctorFavouriteAdviceList_adviceList,
} from 'graphql/types/GetDoctorFavouriteAdviceList';
import {
  UpdateDoctorFavouriteAdvice,
  UpdateDoctorFavouriteAdviceVariables,
} from 'graphql/types/UpdateDoctorFavouriteAdvice';
import {
  GET_DOCTOR_FAVOURITE_ADVICE_LIST,
  DELETE_DOCTOR_FAVOURITE_ADVICE,
  UPDATE_DOCTOR_FAVOURITE_ADVICE,
  ADD_DOCTOR_FAVOURITE_ADVICE,
} from 'graphql/profiles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      height: 250,
      flexGrow: 1,
    },
    textFieldColor: {
      padding: 16,
    },
    dialogContent: {
      padding: 0,
      minHeight: 300,
      position: 'relative',
      '& h6': {
        fontSize: 14,
        fontWeight: 500,
        color: 'rgba(2, 71, 91, 0.6)',
        marginBottom: 5,
        marginTop: 5,
        lineHeight: 'normal',
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
    numberTablets: {
      fontSize: 16,
      color: '#02475b',
      fontWeight: 500,
      marginBottom: 0,
      '& button': {
        padding: '5px 10px',
        fontSize: 12,
        fontWeight: 'normal',
        borderRadius: 14,
        marginRight: 15,
        color: '#00b38e',
        backgroundColor: '#fff',
        '&:focus': {
          outline: 'none',
        },
      },
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
    loader: {
      left: '50%',
      top: 41,
      position: 'relative',
    },
    medicineListElement: {
      paddingRight: '60px !important',
    },
    iconRight: {
      position: 'absolute',
      right: 5,
      top: 13,
    },
    updateBtn: {
      backgroundColor: '#fc9916 !important',
      '&:disabled': {
        backgroundColor: '#fdd49c !important',
      },
    },
    favAdviceList: {
      paddingTop: 10,
    },
    addmedicine_btn: {
      color: '#fc9916',
      fontSize: 14,
      fontWeight: 600,
      padding: '0 5px',
      '& img': {
        marginRight: 10,
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
    cancelBtn: {
      fontSize: 14,
      fontWeight: 600,
      color: '#fc9916',
      backgroundColor: 'transparent',
      boxShadow: '0 2px 5px 0 rgba(0,0,0,0.2)',
      border: 'none',
      marginRight: 10,
      '&:hover': {
        backgroundColor: 'transparent',
        color: '#fc9916',
      },
    },
    popupHeadingCenter: {
      padding: 0,
      backgroundColor: 'transparent',
      '& h6': {
        fontSize: 13,
        color: '#01475b',
        fontWeight: 600,
        textAlign: 'center',
        marginTop: 5,
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
      '&:focus': {
        backgroundColor: 'rgba(0,0,0,0.02)',
      },
      '& span': {
        display: 'inline-block',
        width: '100%',
        textAlign: 'left',
        whiteSpace: 'normal',
        padding: 10,
        wordBreak: 'break-word',
      },
    },
    medicinePopup: {
      width: 480,
      margin: '30px auto 0 auto',
      boxShadow: 'none',
      outline: '0 !important',
    },
    dialogActions: {
      padding: 10,
      paddingTop: 10,
      boxShadow: '0 -5px 20px 0 rgba(128, 128, 128, 0.2)',
      position: 'relative',
      textAlign: 'right',
      fontSize: 14,
      fontWeight: 600,
      '& button': {
        borderRadius: 10,
        minwidth: 130,
        padding: '8px 20px',
        fontSize: 14,
        fontWeight: 600,
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
    popupHeading: {
      '& h6': {
        fontSize: 13,
        color: '#01475b',
        fontWeight: 600,
        textAlign: 'left',
      },
    },
    headingName: {
      display: 'inline-block',
      width: '90%',
      wordBreak: 'break-word',
      textAlign: 'center',
    },
    cross: {
      position: 'absolute',
      right: -10,
      top: -9,
      fontSize: 18,
      color: '#02475b',
    },
  })
);

export const FavouriteAdvice: React.FC = () => {
  const classes = useStyles({});
  const [selectedValues, setSelectedValues] = useState<
    (GetDoctorFavouriteAdviceList_getDoctorFavouriteAdviceList_adviceList | null)[] | null
  >();
  const [idx, setIdx] = React.useState();
  const [showAddInputText, setShowAddInputText] = useState<boolean>(false);
  const [showUpdatePopup, setShowUpdatePopup] = useState<boolean>(false);
  const [adviceLoader, setAdviceLoader] = useState<boolean>(false);
  const [advice, setAdvice] = useState('');
  const [updateAdviceId, setUpdateAdviceId] = useState('');

  const handleUpdate = (item: any, adviceId: string) => {
    setAdviceLoader(true);

    client
      .mutate<UpdateDoctorFavouriteAdvice, UpdateDoctorFavouriteAdviceVariables>({
        mutation: UPDATE_DOCTOR_FAVOURITE_ADVICE,
        variables: {
          id: adviceId,
          instruction: item,
        },
      })
      .then((data) => {
        setSelectedValues(data && data!.data!.updateDoctorFavouriteAdvice!.adviceList);
        setAdviceLoader(false);
      });
  };

  const handleDelete = (item: any, idx: number, adviceId: string) => {
    selectedValues && selectedValues!.splice(idx, 1);
    setSelectedValues(selectedValues);
    const sum = idx + Math.random();
    setIdx(sum);

    client
      .mutate<DeleteDoctorFavouriteAdvice, DeleteDoctorFavouriteAdviceVariables>({
        mutation: DELETE_DOCTOR_FAVOURITE_ADVICE,
        variables: {
          instructionId: adviceId,
        },
      })
      .then((data: any) => {
        console.log('data after mutation' + data);
      });
  };

  const saveAdvice = (advice: string) => {
    setAdviceLoader(true);
    client
      .mutate<AddDoctorFavouriteAdvice, AddDoctorFavouriteAdviceVariables>({
        mutation: ADD_DOCTOR_FAVOURITE_ADVICE,
        variables: {
          instruction: advice,
        },
      })
      .then((data) => {
        let temp = '';
        if (
          data &&
          data.data &&
          data.data.addDoctorFavouriteAdvice &&
          data.data.addDoctorFavouriteAdvice.adviceList &&
          data.data.addDoctorFavouriteAdvice.adviceList[0]!.id
        ) {
          temp = data!.data!.addDoctorFavouriteAdvice!.adviceList[
            data!.data!.addDoctorFavouriteAdvice!.adviceList.length - 1
          ]!.id;
        }

        if (advice.trim() !== '') {
          selectedValues &&
            selectedValues!.splice(idx, 0, {
              instruction: advice,
              id: temp,
              __typename: 'DoctorsFavouriteAdvice',
            });
          setSelectedValues(selectedValues);
          setIdx(selectedValues!.length + 1);
        }
        setAdviceLoader(false);
      });
  };
  const client = useApolloClient();

  useEffect(() => {
    setAdviceLoader(true);
    client
      .query<GetDoctorFavouriteAdviceList>({
        query: GET_DOCTOR_FAVOURITE_ADVICE_LIST,
        fetchPolicy: 'no-cache',
      })
      .then((_data) => {
        setSelectedValues(
          _data.data &&
            _data.data.getDoctorFavouriteAdviceList &&
            _data.data.getDoctorFavouriteAdviceList.adviceList
        );
        setAdviceLoader(false);
      })
      .catch((e) => {
        setAdviceLoader(false);
        console.log('Error occured while fetching Doctor Favourite Advice List', e);
      });
  }, []);

  return (
    <Typography component="div" className={classes.contentContainer}>
      <Typography component="div" className={classes.column}>
        <ul>
          {adviceLoader ? (
            <CircularProgress className={classes.loader} />
          ) : (
            selectedValues &&
            selectedValues.length > 0 &&
            selectedValues!.map(
              (item, idx) =>
                item &&
                item.instruction!.trim() !== '' && (
                  <li key={idx} className={classes.medicineListElement}>
                    {item!.instruction}
                    <span className={classes.iconRight}>
                      <img
                        width="16"
                        src={require('images/round_edit_24_px.svg')}
                        onClick={() => {
                          setShowUpdatePopup(true);
                          setUpdateAdviceId(item.id);
                          setAdvice(item.instruction);
                          setShowAddInputText(true);
                        }}
                        alt=""
                      />
                      <img
                        width="16"
                        src={require('images/ic_cancel_green.svg')}
                        onClick={() => handleDelete(item, idx, item.id)}
                        alt=""
                      />
                    </span>
                  </li>
                )
            )
          )}

          <li className={classes.favAdviceList}>
            <Button
              className={classes.addmedicine_btn}
              onClick={() => {
                setShowAddInputText(true);
                setShowUpdatePopup(false);
                setAdvice('');
              }}
            >
              <img src={require('images/ic_round-add.svg')} alt="" /> Add Advice
            </Button>
          </li>
        </ul>
      </Typography>

      <Modal
        open={showAddInputText}
        onClose={() => setShowAddInputText(false)}
        disableBackdropClick
        disableEscapeKeyDown
      >
        <Paper className={classes.medicinePopup}>
          <AphDialogTitle className={classes.popupHeadingCenter}>
            <div>
              <div>
                <div className={classes.dialogContent}>
                  <div>
                    <AphDialogTitle className={classes.popupHeading}>
                      <span className={classes.headingName}>FAVOURITE ADVICE</span>
                      <Button
                        className={classes.cross}
                        onClick={() => {
                          setShowAddInputText(false);
                        }}
                      >
                        <img src={require('images/ic_cross.svg')} alt="" />
                      </Button>
                    </AphDialogTitle>
                    <div className={classes.numberTablets}>
                      <AphTextField
                        autoFocus
                        fullWidth
                        multiline
                        placeholder="Type your favourite advice"
                        className={classes.textFieldColor}
                        value={advice}
                        onChange={(event: any) => {
                          setAdvice(event.target.value);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className={classes.dialogActions}>
                <AphButton
                  className={classes.cancelBtn}
                  color="primary"
                  onClick={() => {
                    setShowAddInputText(false);
                  }}
                >
                  Cancel
                </AphButton>

                {showUpdatePopup ? (
                  <AphButton
                    color="primary"
                    className={classes.updateBtn}
                    disabled={advice.trim() === ''}
                    onClick={() => {
                      setShowAddInputText(false);
                      handleUpdate(advice, updateAdviceId);
                    }}
                  >
                    Update Advice
                  </AphButton>
                ) : (
                  <AphButton
                    color="primary"
                    className={classes.updateBtn}
                    disabled={advice.trim() === ''}
                    onClick={() => {
                      saveAdvice(advice);
                      setShowAddInputText(false);
                    }}
                  >
                    Add Advice
                  </AphButton>
                )}
              </div>
            </div>
          </AphDialogTitle>
        </Paper>
      </Modal>
    </Typography>
  );
};
