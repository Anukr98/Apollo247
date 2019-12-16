import React, { useState, useEffect, useContext } from 'react';
import { Typography, Chip, Theme, MenuItem, Paper, Button, Grid } from '@material-ui/core';
import { makeStyles, createStyles } from '@material-ui/styles';
import { AphButton, AphTextField } from '@aph/web-ui-components';
import deburr from 'lodash/deburr';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import Autosuggest from 'react-autosuggest';
import { useApolloClient } from 'react-apollo-hooks';
import { SEARCH_DIAGNOSTICS } from 'graphql/profiles';
import { SearchDiagnostics } from 'graphql/types/SearchDiagnostics';
import { GetCaseSheet_getCaseSheet_pastAppointments_caseSheet_diagnosticPrescription } from 'graphql/types/GetCaseSheet';
import { CaseSheetContext } from 'context/CaseSheetContext';

import { GET_DOCTOR_FAVOURITE_TESTS } from 'graphql/doctors';
import {
  GetDoctorFavouriteTestList,
  GetDoctorFavouriteTestList_getDoctorFavouriteTestList,
  GetDoctorFavouriteTestList_getDoctorFavouriteTestList_testList,
} from 'graphql/types/GetDoctorFavouriteTestList';
import { useQuery } from 'react-apollo-hooks';

interface OptionType {
  itemname: string;
  __typename: 'DiagnosticPrescription';
}

let suggestions: (GetCaseSheet_getCaseSheet_pastAppointments_caseSheet_diagnosticPrescription | null)[] = [];

function renderInputComponent(inputProps: any) {
  const { classes, inputRef = () => {}, ref, ...other } = inputProps;

  return (
    <AphTextField
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

function renderSuggestion(
  suggestion: any | null,
  { query, isHighlighted }: Autosuggest.RenderSuggestionParams
) {
  const matches = match(suggestion!.itemName, query);
  const parts = parse(suggestion!.itemName, matches);

  return (
    <MenuItem selected={isHighlighted} component="div">
      <div>
        {parts.map((part) => (
          <span
            key={part.text}
            style={{
              fontWeight: part.highlight ? 500 : 400,
              whiteSpace: 'pre',
            }}
          >
            {part.text}
          </span>
        ))}
      </div>
    </MenuItem>
  );
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      height: 250,
      flexGrow: 1,
    },
    container: {
      position: 'relative',
    },
    suggestionsContainerOpen: {
      position: 'absolute',
      zIndex: 1,
      marginTop: theme.spacing(1),
      left: 0,
      right: 0,
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
    suggestion: {
      display: 'block',
      overflow: 'hidden',
      borderBottom: '1px solid rgba(2,71,91,0.1)',
      '&:hover': {
        '& div': {
          backgroundColor: '#f0f4f5 !important',
        },
      },
    },
    suggestionsList: {
      margin: 0,
      padding: 0,
      listStyleType: 'none',
      borderRadius: 10,
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
    divider: {
      height: theme.spacing(2),
    },
    mainContainer: {
      width: '100%',
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
    },
    listContainer: {
      display: 'flex',
      flexFlow: 'column',
      borderBottom: '1px solid rgba(2, 71, 91, 0.15)',
      '&:last-child': {
        borderBottom: 'none',
      },
    },
    icon: {
      color: '#00b38e',
    },
    textFieldContainer: {
      width: '100%',
      position: 'relative',
    },
    favTestContainer: {
      border: '1px solid rgba(2, 71, 91, 0.15)',
      backgroundColor: 'rgba(0,0,0,0.02)',
      padding: '10px 20px 10px 10px',
      borderRadius: 5,
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
      paddingRight: 5,

      '&:focus': {
        backgroundColor: 'rgba(0,0,0,0.02)',
      },
      '& span': {
        display: 'inline-block',
        width: '100%',
        textAlign: 'left',
        whiteSpace: 'normal',
        padding: 10,
      },
    },
    othersBtnFav: {
      height: 'auto',
      backgroundColor: 'transparent',
      // border: '1px solid rgba(2, 71, 91, 0.15)',
      // marginBottom: 12,
      borderRadius: 0,
      fontWeight: 600,
      fontSize: 14,
      color: '#02475b !important',
      whiteSpace: 'normal',
      paddingRight: 5,

      '&:focus': {
        backgroundColor: 'rgba(0,0,0,0.02)',
      },
      '& span': {
        display: 'inline-block',
        width: '100%',
        textAlign: 'left',
        whiteSpace: 'normal',
        padding: 10,
      },
    },
    textFieldColor: {
      '& input': {
        color: 'initial',
        '& :before': {
          border: 0,
        },
      },
    },
    btnAddDoctor: {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      color: theme.palette.action.selected,
      fontSize: 14,
      fontWeight: 600,
      // pointerEvents: 'none',
      paddingLeft: 4,
      '&:hover': {
        backgroundColor: 'transparent',
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
      right: 5,
      // pointerEvents: 'none',
      paddingLeft: 4,
      '&:hover': {
        backgroundColor: 'transparent',
      },
      '& img': {
        marginRight: 20,
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
      right: -20,
      bottom: 0,
      paddingLeft: 4,
      '&:hover': {
        backgroundColor: 'transparent',
      },
      '& img': {
        marginRight: 8,
      },
    },
    searchpopup: {
      borderRadius: 10,
      boxShadow: '0 5px 20px 0 rgba(128,128,128,0.8)',
      marginTop: 2,
    },
    inputRoot: {
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
  })
);

export const DiagnosticPrescription: React.FC = () => {
  const classes = useStyles();
  const [searchInput, setSearchInput] = useState('');
  const [favTests, setFavTests] = useState();
  const {
    diagnosticPrescription: selectedValues,
    setDiagnosticPrescription: setSelectedValues,
  } = useContext(CaseSheetContext);
  console.log(selectedValues);
  const [idx, setIdx] = React.useState();
  const client = useApolloClient();
  const { caseSheetEdit, patientDetails } = useContext(CaseSheetContext);
  useEffect(() => {
    client
      .query<GetDoctorFavouriteTestList>({
        query: GET_DOCTOR_FAVOURITE_TESTS,
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
          // city:
          //   patientDetails &&
          //   patientDetails.patientAddress &&
          //   patientDetails.patientAddress.length > 0
          //     ? patientDetails.patientAddress[0]!.city
          //     : '',
          city: '',
          patientId: patientDetails && patientDetails.id ? patientDetails.id : '',
          searchText: value,
        },
      })
      .then((_data: any) => {
        const filterVal: any = _data!.data!.searchDiagnostics!.diagnostics;

        filterVal.forEach((val: any, index: any) => {
          selectedValues!.forEach((selectedval: any) => {
            if (val.itemName === selectedval.itemname) {
              filterVal.splice(index, 1);
            }
          });
        });
        suggestions = filterVal;

        setLengthOfSuggestions(suggestions.length);
        setSearchInput(value);
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
      setSelectedValues(selectedValues);
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
  const handleChange = (itemname: keyof typeof state) => (
    event: React.ChangeEvent<{}>,
    { newValue }: Autosuggest.ChangeEvent
  ) => {
    if (newValue.length > 2) {
      fetchDignostic(newValue);
    }
    setOtherDiagnostic(newValue);
    setState({
      ...state,
      [itemname]: newValue,
    });
  };

  const handleDelete = (item: any, idx: number) => {
    // suggestions.splice(0, 0, item);
    selectedValues!.splice(idx, 1);
    setSelectedValues(selectedValues);
    const sum = idx + Math.random();
    setIdx(sum);
  };
  const autosuggestProps = {
    renderInputComponent,
    suggestions: (stateSuggestions as unknown) as OptionType[],
    onSuggestionsFetchRequested: handleSuggestionsFetchRequested,
    onSuggestionsClearRequested: handleSuggestionsClearRequested,
    getSuggestionValue,
    renderSuggestion,
  };
  return (
    <Typography component="div" className={classes.contentContainer}>
      <Grid container spacing={1}>
        <Grid item lg={6} xs={12}>
          <Typography component="div" className={classes.fullWidth}>
            <Typography component="h5" variant="h5">
              Tests
            </Typography>
            <Typography component="div" className={classes.listContainer}>
              {selectedValues !== null &&
                selectedValues.length > 0 &&
                selectedValues!.map((item, idx) =>
                  item.itemName
                    ? item.itemName!.trim() !== '' && (
                        <Chip
                          className={classes.othersBtn}
                          key={idx}
                          label={item!.itemName}
                          onDelete={() => handleDelete(item, idx)}
                          deleteIcon={
                            <img
                              src={caseSheetEdit ? require('images/ic_cancel_green.svg') : ''}
                              alt=""
                            />
                          }
                        />
                      )
                    : item.itemname &&
                      item.itemname!.trim() !== '' && (
                        <Chip
                          className={classes.othersBtn}
                          key={idx}
                          label={item!.itemname}
                          onDelete={() => handleDelete(item, idx)}
                          deleteIcon={
                            <img
                              src={caseSheetEdit ? require('images/ic_cancel_green.svg') : ''}
                              alt=""
                            />
                          }
                        />
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
            {showAddCondition && !showAddOtherTests && (
              <Autosuggest
                onSuggestionSelected={(e, { suggestion }) => {
                  selectedValues!.push(suggestion);
                  setSelectedValues(selectedValues);
                  setShowAddCondition(false);
                  suggestions = suggestions.filter((val) => !selectedValues!.includes(val!));
                  setState({
                    single: '',
                    popper: '',
                  });
                  setOtherDiagnostic('');
                }}
                {...autosuggestProps}
                inputProps={{
                  classes,
                  id: 'react-autosuggest-simple',
                  placeholder: 'Search Tests',
                  value: state.single,
                  onChange: handleChange('single'),
                }}
                theme={{
                  container: classes.container,
                  suggestionsContainerOpen: classes.suggestionsContainerOpen,
                  suggestionsList: classes.suggestionsList,
                  suggestion: classes.suggestion,
                }}
                renderSuggestionsContainer={(options) => (
                  <Paper {...options.containerProps} square className={classes.searchpopup}>
                    {options.children}
                  </Paper>
                )}
              />
            )}
            {lengthOfSuggestions === 0 && otherDiagnostic.length > 2 && (
              <AphButton
                className={classes.darkGreenaddBtn}
                variant="contained"
                color="primary"
                onClick={() => {
                  if (otherDiagnostic.trim() !== '') {
                    const daignosisValue = selectedValues!.splice(idx, 0, {
                      itemName: otherDiagnostic,
                      __typename: 'DiagnosticPrescription',
                    });
                    selectedValues && selectedValues.push(daignosisValue);
                    setShowAddOtherTests(false);
                    setShowAddCondition(false);
                    setIdx(selectedValues!.length + 1);
                    setTimeout(() => {
                      setOtherDiagnostic('');
                    }, 10);
                  } else {
                    setOtherDiagnostic('');
                  }
                }}
              >
                <img src={require('images/ic_add_circle.svg')} alt="" />
              </AphButton>
            )}
          </Typography>
        </Grid>
        {!showAddCondition && caseSheetEdit && (
          <Grid item lg={6} xs={12}>
            {favTests && (
              <>
                <Typography component="h5" variant="h5">
                  Favorite Tests
                </Typography>
                <div className={classes.favTestContainer}>
                  {favTests &&
                    favTests.map((favTest: any, id: any) => {
                      return (
                        <Typography component="div" className={classes.listContainer} key={id}>
                          <Chip
                            className={classes.othersBtnFav}
                            key={idx}
                            label={favTest && favTest.itemname}
                          />
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
                              // handleChange('single');
                            }}
                          >
                            <img src={require('images/add_doctor_white.svg')} alt="" />
                          </AphButton>
                        </Typography>
                      );
                    })}
                </div>
              </>
            )}
          </Grid>
        )}
      </Grid>
    </Typography>
  );
};
