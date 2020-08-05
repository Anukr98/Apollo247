import React, { useState, useEffect, useContext } from 'react';
import { Typography, Chip, Theme, Paper, Grid, Modal, Button } from '@material-ui/core';
import { makeStyles, createStyles } from '@material-ui/styles';
import { AphButton, AphTextField, AphTooltip, AphDialogTitle } from '@aph/web-ui-components';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import Autosuggest from 'react-autosuggest';
import { useApolloClient } from 'react-apollo-hooks';
import { SEARCH_DIAGNOSTICS } from 'graphql/profiles';
import { SearchDiagnostics } from 'graphql/types/SearchDiagnostics';
import { GetCaseSheet_getCaseSheet_pastAppointments_caseSheet_diagnosticPrescription } from 'graphql/types/GetCaseSheet';
import { CaseSheetContext } from 'context/CaseSheetContext';
import { GET_DOCTOR_FAVOURITE_TESTS_DOCTOR } from 'graphql/doctors';
import { GetDoctorFavouriteTestList } from 'graphql/types/GetDoctorFavouriteTestList';
import { useParams } from 'hooks/routerHooks';
import { getLocalStorageItem, updateLocalStorageItem } from './LocalStorageUtils';

interface OptionType {
  itemname: string;
  testInstruction: string;
  __typename: 'DiagnosticPrescription';
}

let suggestions: (GetCaseSheet_getCaseSheet_pastAppointments_caseSheet_diagnosticPrescription | null)[] = [];

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    suggestionsContainer: {
      position: 'relative',
      padding: 16,
      marginTop: 5,
    },
    suggestionPopover: {
      marginTop: 2,
      position: 'absolute',
      zIndex: 2,
      left: 0,
      right: 0,
      maxHeight: 400,
      overflowY: 'auto',
    },
    suggestionsList: {
      margin: 0,
      padding: 0,
      listStyleType: 'none',
      borderRadius: 10,
      overflow: 'hidden',
    },
    suggestionItem: {
      fontSize: 18,
      fontWeight: 500,
      paddingLeft: 20,
      paddingRight: 20,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      '& >div': {
        borderBottom: '1px solid rgba(2,71,91,0.1)',
        paddingTop: 10,
        paddingBottom: 10,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        position: 'relative',
        paddingRight: 30,
      },
      '&:last-child': {
        '& >div': {
          borderBottom: 'none',
        },
      },
      '& img': {
        position: 'absolute',
        right: 0,
        display: 'none',
        top: '50%',
        marginTop: -12,
      },
      '&:hover': {
        backgroundColor: '#f0f4f5',
        '& img': {
          display: 'block',
        },
      },
    },
    suggestionHighlighted: {
      backgroundColor: '#f0f4f5',
      '& img': {
        display: 'block',
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
    listContainer: {
      display: 'flex',
      flexFlow: 'column',
      borderBottom: '1px solid rgba(2, 71, 91, 0.15)',
      position: 'relative',
      '&:last-child': {
        borderBottom: 'none',
      },
    },
    textFieldContainer: {
      width: '100%',
      position: 'relative',
    },
    favTestContainer: {
      border: '1px solid rgba(2, 71, 91, 0.15)',
      backgroundColor: 'rgba(0,0,0,0.02)',
      padding: '0px 12px 0px 5px',
      borderRadius: 5,
      position: 'relative',
    },
    othersBtn: {
      height: 'auto',
      border: '1px solid rgba(2, 71, 91, 0.15)',
      backgroundColor: 'rgba(0,0,0,0.02)',
      marginBottom: 12,
      borderRadius: 5,
      fontWeight: 600,
      fontSize: 14,
      color: '#02475b !important',
      whiteSpace: 'normal',
      paddingRight: 45,
      position: 'relative',
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
    othersBtnFav: {
      height: 'auto',
      backgroundColor: 'transparent',
      borderRadius: 0,
      fontWeight: 600,
      fontSize: 14,
      color: '#02475b !important',
      whiteSpace: 'normal',
      paddingRight: 30,
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
    btnAddDoctorright: {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      color: theme.palette.action.selected,
      fontSize: 14,
      fontWeight: 600,
      position: 'absolute',
      right: 0,
      paddingLeft: 4,
      minWidth: 'auto',
      paddingRight: 0,
      '&:hover': {
        backgroundColor: 'transparent',
        boxShadow: 'none',
      },
      '& img': {
        border: '1px solid #00b38e',
        borderRadius: '50%',
        maxWidth: 24,
      },
    },
    darkGreenaddBtn: {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      color: theme.palette.action.selected,
      fontSize: 14,
      fontWeight: 600,
      position: 'absolute',
      right: 0,
      bottom: 5,
      minWidth: 'auto',
      padding: 0,
      '&:hover': {
        backgroundColor: 'transparent',
        boxShadow: 'none',
      },
    },
    inputRoot: {
      paddingRight: 35,
      '&:before': {
        borderBottom: '2px solid #00b38e',
      },
      '&:after': {
        borderBottom: '2px solid #00b38e',
      },
      '& input': {
        fontSize: 16,
        fontWeight: 500,
        color: '#01475b',
        paddingTop: 0,
      },
      '&:hover': {
        '&:before': {
          borderBottom: '2px solid #00b38e !important',
        },
        '&:after': {
          borderBottom: '2px solid #00b38e !important',
        },
      },
    },
    fullWidth: {
      width: '100%',
    },
    deleteImage: {
      position: 'absolute',
      top: 8,
      right: 32,
      cursor: 'pointer',
    },
    testModal: {
      width: 480,
      height: 504,
      margin: '60px auto 0 auto',
      boxShadow: 'none',
      outline: 'none',
    },
    popupHeading: {
      '& h6': {
        fontSize: 13,
        color: '#01475b',
        fontWeight: 600,
      },
    },
    backArrow: {
      cursor: 'pointer',
      position: 'absolute',
      left: 0,
      top: 0,
      marginTop: -8,
      minWidth: 'auto',
      '& img': {
        verticalAlign: 'middle',
      },
    },
    cross: {
      cursor: 'pointer',
      position: 'absolute',
      right: -10,
      top: -9,
      fontSize: 18,
      color: '#02475b',
    },
    buttonWrapper: {
      height: 72,
      width: '100%',
      borderRadius: '10px',
      boxShadow: '0 -5px 20px 0 rgba(128, 128, 128, 0.2)',
      backgroundColor: '#ffffff',
      position: 'relative',
      //top: 208,
      zIndex: 1,
      textAlign: 'right',
      paddingTop: 19,
    },
    updateBtn: {
      width: '200px',
      height: '40px',
      borderRadius: '10px',
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      backgroundColor: '#fc9916',
      marginRight: 20,
    },
    cancelBtn: {
      width: '100px',
      height: '40px',
      borderRadius: '10px',
      boxShadow: '0 2px 5px 0 rgba(0, 0, 0, 0.2)',
      backgroundColor: '#ffffff',
      marginRight: 20,
      color: '#fc9916',
    },
    instructionsLabel: {
      width: '123px',
      fontSize: '14px',
      fontWeight: 500,
      fontStretch: 'normal',
      fontStyle: 'normal',
      lineHeight: 'normal',
      letterSpacing: '0.02px',
      color: 'rgba(2, 71, 91, 0.6)',
      paddingBottom: 8,
    },
    testCard: {
      color: 'rgba(0, 0, 0, 0.54)',
      border: '1px solid rgba(2,71,91,0.1)',
      padding: '12px 64px 12px 12px',
      position: 'relative',
      maxWidth: '100%',
      boxShadow: 'none',
      textAlign: 'left',
      borderRadius: 5,
      marginBottom: 12,
      backgroundColor: 'rgba(0,0,0,0.02)',
      '& h5': {
        color: '#02475b',
        margin: 0,
        fontSize: 14,
        fontWeight: 600,
      },
      '& h6': {
        color: '#02475b',
        margin: 0,
        fontSize: 12,
        fontWeight: 'normal',
      },
    },
    updateTest: {
      top: '3px',
      color: '#666666',
      right: '2px',
      cursor: 'pointer',
      padding: '5px 0',
      position: 'absolute',
      minWidth: '23px',
      '&:hover': {
        backgroundColor: 'transparent',
        boxShadow: 'none',
      },
    },
    instructionsTextArea: {
      '& textArea': {
        maxHeight: '200px',
        overflow: 'auto',
      },
    },
    notesWrapper: {
      padding: 16,
      height: 312,
    },
    notesWrapperEdit: {
      marginTop: 15,
      marginBottom: 48,
    },
  })
);

type Params = { id: string; patientId: string; tabValue: string };
export const DiagnosticPrescription: React.FC = () => {
  const classes = useStyles({});
  const params = useParams<Params>();
  const [searchInput, setSearchInput] = useState('');
  const [favTests, setFavTests] = useState<any>();
  const {
    diagnosticPrescription: selectedValues,
    setDiagnosticPrescription: setSelectedValues,
  } = useContext(CaseSheetContext);
  const [idx, setIdx] = React.useState<any>();
  const client = useApolloClient();
  const { caseSheetEdit, patientDetails } = useContext(CaseSheetContext);
  useEffect(() => {
    client
      .query<GetDoctorFavouriteTestList>({
        query: GET_DOCTOR_FAVOURITE_TESTS_DOCTOR,
        fetchPolicy: 'no-cache',
      })
      .then((data) => {
        setFavTests(
          data &&
            data.data &&
            data.data.getDoctorFavouriteTestList &&
            data.data.getDoctorFavouriteTestList.testList
        );
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);
  const fetchDignostic = async (value: string) => {
    client
      .query<SearchDiagnostics, any>({
        query: SEARCH_DIAGNOSTICS,
        variables: {
          city: '',
          patientId: patientDetails && patientDetails.id ? patientDetails.id : '',
          searchText: value,
        },
      })
      .then((_data: any) => {
        const filterVal: any = _data!.data!.searchDiagnostics!.diagnostics;

        filterVal.forEach((val: any, index: any) => {
          val.id = val.itemId;
          selectedValues!.forEach((selectedval: any) => {
            if (val.itemName === selectedval.itemname) {
              filterVal.splice(index, 1);
            }
          });
        });

        suggestions = filterVal;
        setLengthOfSuggestions(suggestions.length);
      })
      .catch((e) => {
        console.log('Error occured while searching for tests', e);
      });
  };
  const getSuggestions = (value: string) => {
    return suggestions;
  };

  function getSuggestionValue(suggestion: any | null) {
    return suggestion!.itemName;
  }
  useEffect(() => {
    if (searchInput.length > 2) {
      setSuggestions(getSuggestions(searchInput));
    }
  }, [searchInput]);

  useEffect(() => {
    if (idx >= 0) {
      suggestions!.map((item, idx) => {
        selectedValues!.map((val) => {
          if (item!.itemname === val.itemname) {
            const indexDelete = suggestions.indexOf(item);
            suggestions!.splice(indexDelete, 1);
          }
        });
      });
    }
  }, [selectedValues, idx]);

  const [state, setState] = React.useState({
    single: '',
    popper: '',
  });
  const [stateSuggestions, setSuggestions] = React.useState<
    (GetCaseSheet_getCaseSheet_pastAppointments_caseSheet_diagnosticPrescription | null)[]
  >([]);

  const handleSuggestionsFetchRequested = ({ value }: { value: string }) => {
    setSuggestions(getSuggestions(value));
  };

  const handleSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const [showAddCondition, setShowAddCondition] = useState<boolean>(false);
  const [showAddOtherTests, setShowAddOtherTests] = useState<boolean>(false);
  const [otherDiagnostic, setOtherDiagnostic] = useState('');
  const showAddConditionHandler = (show: boolean) => setShowAddCondition(show);
  const [lengthOfSuggestions, setLengthOfSuggestions] = useState<number>(1);
  const [showFavMedicine, setShowFavMedicine] = useState<boolean>(false);
  const [isSuggestionSelected, setIsSuggestionSelected] = useState<boolean>(false);
  const [selectedValue, setSelectedValue] = useState<any>({});
  const [editTest, setEditTest] = useState<any>({
    index: null,
    isEdit: false,
  });
  const handleChange = (itemname: keyof typeof state) => (
    event: React.ChangeEvent<{}>,
    { newValue }: Autosuggest.ChangeEvent
  ) => {
    let filterVal: any = suggestions.filter(
      (x: any) => x.id !== undefined && x.id !== '' && x.id !== -1
    );
    filterVal.unshift({ itemName: newValue, itemId: -1, id: -1, __typename: 'Diagnostics' });
    suggestions = filterVal;

    if (event.nativeEvent.type === 'input' && newValue.length > 2) {
      fetchDignostic(newValue);
    } else if (newValue.length <= 2) setIsSuggestionSelected(false);
    setOtherDiagnostic(newValue);
    setState({
      ...state,
      [itemname]: newValue,
    });
  };

  function renderSuggestion(
    suggestion: any | null,
    { query, isHighlighted }: Autosuggest.RenderSuggestionParams
  ) {
    const matches = match(suggestion!.itemName, query);
    const parts = parse(suggestion!.itemName, matches);
    return (
      otherDiagnostic.length > 2 && (
        <AphTooltip open={isHighlighted} title={suggestion.itemName}>
          {suggestion.id !== -1 ? (
            <div>
              {parts.map((part, index) => (
                <span
                  key={part.text + ' ' + index}
                  style={{
                    fontWeight: part.highlight ? 500 : 400,
                    whiteSpace: 'pre',
                  }}
                >
                  {part.text}
                </span>
              ))}
              <img src={require('images/ic_dark_plus.svg')} alt="" />
            </div>
          ) : (
            <div>
              <span>Add&nbsp;</span>
              <span
                style={{
                  fontWeight: 400,
                  whiteSpace: 'pre',
                }}
              >
                {suggestion.itemName}
              </span>
              <img src={require('images/ic_dark_plus.svg')} alt="" />
            </div>
          )}
        </AphTooltip>
      )
    );
  }

  const handleDelete = (item: any, idx: number) => {
    selectedValues!.splice(idx, 1);
    const storageItem = getLocalStorageItem(params.id);
    if (storageItem) {
      storageItem.diagnosticPrescription = selectedValues;
      updateLocalStorageItem(params.id, storageItem);
    }
    setSelectedValues(selectedValues);
    const sum = idx + Math.random();
    setIdx(sum);
  };

  function renderInputComponent(inputProps: any) {
    const { inputRef = () => {}, ref, ...other } = inputProps;

    return (
      <AphTextField
        autoFocus
        fullWidth
        InputProps={{
          inputRef: (node) => {
            ref(node);
            inputRef(node);
          },
          classes: {
            root: classes.inputRoot,
          },
        }}
        {...other}
      />
    );
  }
  const onCloseTest = () => {
    setShowAddCondition(false);
    setIsSuggestionSelected(false);
    setEditTest({ index: null, isEdit: false });
  };

  const onAddorUpdateTest = () => {
    if (editTest!.isEdit) selectedValues[editTest.index] = selectedValue;
    else selectedValues && selectedValues.push(selectedValue);

    const storageItem = getLocalStorageItem(params.id);
    if (storageItem) {
      storageItem.diagnosticPrescription = selectedValues;
      updateLocalStorageItem(params.id, storageItem);
    }
    setSelectedValues(selectedValues);
    onCloseTest();
    suggestions = suggestions.filter((val) => selectedValues && selectedValues.includes(val!));
    setState({
      single: '',
      popper: '',
    });
    setOtherDiagnostic('');
  };
  useEffect(() => {
    selectedValues.forEach((x) => {
      if (x.itemName === undefined && x.itemname) {
        x.itemName = x.itemname;
      }
    });
  });
  const autosuggestProps = {
    renderInputComponent,
    suggestions: (stateSuggestions as unknown) as OptionType[],
    onSuggestionsFetchRequested: handleSuggestionsFetchRequested,
    onSuggestionsClearRequested: handleSuggestionsClearRequested,
    getSuggestionValue,
    renderSuggestion,
  };
  const compare = (a: any, b: any) => {
    if (a.itemname.toLowerCase() < b.itemname.toLowerCase()) {
      return -1;
    }
    if (a.itemname.toLowerCase() > b.itemname.toLowerCase()) {
      return 1;
    }
    return 0;
  };
  return (
    <Typography component="div" className={classes.contentContainer}>
      <Grid container spacing={1}>
        <Grid item xs={6}>
          <Typography component="div" className={classes.fullWidth}>
            <Typography component="h5" variant="h5">
              Tests
            </Typography>
            <Typography component="div" className={classes.listContainer}>
              {selectedValues!.map(
                (item, idx) =>
                  item.itemName &&
                  item.itemName!.trim() !== '' && (
                    <div style={{ wordBreak: 'break-word' }} key={`${item.itemName}  ${idx}`}>
                      <div className={classes.testCard}>
                        <h5>{item!.itemName}</h5>
                        <img
                          className={classes.deleteImage}
                          src={caseSheetEdit ? require('images/ic_cancel_green.svg') : ''}
                          alt=""
                          onClick={() => {
                            handleDelete(item, idx);
                          }}
                        />
                        <img
                          src={caseSheetEdit ? require('images/round_edit_24_px.svg') : ''}
                          alt=""
                          className={classes.updateTest}
                          onClick={() => {
                            setShowAddCondition(true);
                            setEditTest({
                              index: idx,
                              isEdit: true,
                            });
                            setSelectedValue({
                              ...item,
                              index: idx,
                            });
                          }}
                        />
                        <h6 style={{ whiteSpace: 'pre-wrap' }}>{item!.testInstruction}</h6>
                      </div>
                    </div>
                  )
              )}
            </Typography>
          </Typography>
          <Typography component="div" className={classes.textFieldContainer}>
            {!showAddCondition && caseSheetEdit && (
              <AphButton
                className={classes.btnAddDoctor}
                variant="contained"
                color="primary"
                onClick={() => {
                  showAddConditionHandler(true);
                  setState({
                    single: '',
                    popper: '',
                  });
                }}
              >
                <img src={require('images/ic_dark_plus.svg')} alt="" /> ADD TESTS
              </AphButton>
            )}
          </Typography>
        </Grid>
        {favTests && favTests.length > 0 && (
          <Grid item lg={6} xs={6}>
            <Typography component="h5" variant="h5">
              Favorite Tests
            </Typography>
            <div className={classes.favTestContainer}>
              {favTests.sort(compare).map((favTest: any, id: any) => {
                return (
                  <Typography component="div" className={classes.listContainer} key={id}>
                    <Chip
                      className={classes.othersBtnFav}
                      key={idx}
                      label={favTest && favTest.itemname}
                    />
                    {caseSheetEdit && (
                      <AphButton
                        className={classes.btnAddDoctorright}
                        variant="contained"
                        color="primary"
                        onClick={() => {
                          const favTestValue = {
                            itemName: favTest.itemname,
                            id: favTest.id,
                            __typename: favTest.__typename,
                          };
                          selectedValues!.push(favTestValue);
                          setShowFavMedicine(true);
                          setState({
                            single: '',
                            popper: '',
                          });
                        }}
                      >
                        <img src={require('images/add_doctor_white.svg')} alt="" />
                      </AphButton>
                    )}
                  </Typography>
                );
              })}
            </div>
          </Grid>
        )}
      </Grid>
      <Modal open={showAddCondition}>
        <Paper className={classes.testModal}>
          <AphDialogTitle className={classes.popupHeading}>
            <Button
              onClick={() => {
                onCloseTest();
              }}
              className={classes.backArrow}
            >
              <img src={require('images/ic_back.svg')} alt="" />
            </Button>
            {!editTest!.isEdit ? 'ADD A TEST' : selectedValue.itemName}
            <Button
              className={classes.cross}
              onClick={() => {
                onCloseTest();
              }}
            >
              <img src={require('images/ic_cross.svg')} alt="" />
            </Button>
          </AphDialogTitle>
          {!editTest!.isEdit && (
            <Autosuggest
              onSuggestionSelected={(e, { suggestion }) => {
                suggestion.testInstruction = '';
                setIsSuggestionSelected(true);
                setSelectedValue(suggestion);
              }}
              {...autosuggestProps}
              inputProps={{
                //classes,
                id: 'react-autosuggest-simple',
                placeholder: 'Search Tests',
                value: state.single,
                onChange: handleChange('single'),
                onKeyPress: (e) => {
                  // if (e.which == 13 || e.keyCode == 13) {
                  //   if (selectedValues && suggestions.length === 1) {
                  //     selectedValues.push(suggestions[0]);
                  //     const storageItem = getLocalStorageItem(params.id);
                  //     if (storageItem) {
                  //       storageItem.diagnosticPrescription = selectedValues;
                  //       updateLocalStorageItem(params.id, storageItem);
                  //     }
                  //     setSelectedValues(selectedValues);
                  //     setShowAddCondition(false);
                  //     suggestions = suggestions.filter((val) => selectedValues.includes(val!));
                  //     setState({
                  //       single: '',
                  //       popper: '',
                  //     });
                  //     setOtherDiagnostic('');
                  //   }
                  // }
                },
              }}
              theme={{
                container: classes.suggestionsContainer,
                suggestionsList: classes.suggestionsList,
                suggestion: classes.suggestionItem,
                suggestionHighlighted: classes.suggestionHighlighted,
              }}
              renderSuggestionsContainer={(options) => (
                <Paper
                  {...options.containerProps}
                  square
                  classes={{ root: classes.suggestionPopover }}
                >
                  {options.children}
                </Paper>
              )}
            />
          )}
          {(isSuggestionSelected || editTest!.isEdit) && (
            <>
              <div
                className={
                  !editTest!.isEdit
                    ? classes.notesWrapper
                    : `${classes.notesWrapper} ${classes.notesWrapperEdit}`
                }
              >
                <Typography className={classes.instructionsLabel} component="h5" variant="h5">
                  Instructions/Notes
                </Typography>

                <AphTextField
                  className={classes.instructionsTextArea}
                  fullWidth
                  multiline
                  placeholder="Type here..."
                  value={selectedValue!.testInstruction}
                  onChange={(e) => {
                    setSelectedValue({ ...selectedValue, testInstruction: e.target.value });
                  }}
                />
              </div>
              <div className={classes.buttonWrapper}>
                <AphButton
                  color="secondary"
                  className={classes.cancelBtn}
                  onClick={() => {
                    onCloseTest();
                  }}
                >
                  Cancel
                </AphButton>
                <AphButton
                  color="primary"
                  className={classes.updateBtn}
                  onClick={() => {
                    onAddorUpdateTest();
                  }}
                >
                  {!editTest!.isEdit ? 'Add Test' : 'Update Test'}
                </AphButton>
              </div>
            </>
          )}
        </Paper>
      </Modal>
    </Typography>
  );
};
