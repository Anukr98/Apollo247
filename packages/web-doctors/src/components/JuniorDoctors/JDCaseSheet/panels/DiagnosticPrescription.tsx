import React, { useState, useEffect, useContext } from 'react';

import { Chip, Theme, Paper } from '@material-ui/core';
import { makeStyles, createStyles } from '@material-ui/styles';
import { AphButton, AphTextField } from '@aph/web-ui-components';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import Autosuggest from 'react-autosuggest';
import { useApolloClient } from 'react-apollo-hooks';
import { SEARCH_DIAGNOSTICS } from 'graphql/profiles';
import { SearchDiagnostics } from 'graphql/types/SearchDiagnostics';
import { GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_pastAppointments_caseSheet_diagnosticPrescription } from 'graphql/types/GetJuniorDoctorCaseSheet';
import { CaseSheetContextJrd } from 'context/CaseSheetContextJrd';

interface OptionType {
  itemname: string;
  __typename: 'DiagnosticPrescription';
}

let suggestions: (GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_pastAppointments_caseSheet_diagnosticPrescription | null)[] = [];

function renderInputComponent(inputProps: any) {
  const { classes, inputRef = () => {}, ref, ...other } = inputProps;

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

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    suggestionsContainer: {
      position: 'relative',
    },
    suggestionPopover: {
      borderRadius: 10,
      boxShadow: '0 5px 20px 0 rgba(128,128,128,0.8)',
      marginTop: 2,
      position: 'absolute',
      zIndex: 1,
      left: 0,
      right: 0,
      maxHeight: 240,
      overflowY: 'auto',
      color: '#02475b',
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
      paddingRight: 7,
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
    root: {
      padding: 0,
    },
    sectionGroup: {
      padding: 0,
    },
    sectionTitle: {
      color: '#02475b',
      opacity: 0.6,
      fontSize: 14,
      fontWeight: 500,
      letterSpacing: 0.02,
      paddingBottom: 5,
    },
    addBtn: {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      color: theme.palette.action.selected,
      fontSize: 14,
      fontWeight: 600,
      padding: 0,
      marginTop: 12,
      '&:hover': {
        backgroundColor: 'transparent',
      },
      '& img': {
        marginRight: 8,
      },
    },
    inputRoot: {
      marginTop: 10,
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
    chipSection: {
      paddingBottom: 0,
    },
    chipCol: {
      display: 'inline-block',
    },
    chipItem: {
      padding: 12,
      paddingRight: 40,
      fontSize: 14,
      fontWeight: 600,
      color: '#02475b',
      backgroundColor: 'rgba(0, 0, 0, 0.02)',
      borderRadius: 5,
      marginRight: 16,
      marginTop: 6,
      border: 'solid 1px rgba(2, 71, 91, 0.15)',
      height: 'auto',
      wordBreak: 'break-word',
      position: 'relative',
      '& span': {
        padding: 0,
        whiteSpace: 'normal',
      },
      '&:focus': {
        backgroundColor: 'rgba(0, 0, 0, 0.02)',
      },
      '& img': {
        margin: 0,
        marginLeft: 12,
        maxWidth: 20,
        position: 'absolute',
        top: 11,
        right: 10,
      },
    },
    addNewDiagnostic: {
      color: '#02475b',
      fontSize: 16,
      position: 'relative',
      '& button': {
        backgroundColor: 'transparent',
        boxShadow: 'none',
        position: 'absolute',
        right: 0,
        padding: 0,
        minWidth: 'auto',
        bottom: 5,
        '&:hover': {
          backgroundColor: 'transparent',
          boxShadow: 'none',
        },
      },
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
      whiteSpace: 'normal',
      '&:focus': {
        backgroundColor: 'rgba(0,0,0,0.02)',
      },
      '& span': {
        display: 'inline-block',
        width: '100%',
        textAlign: 'left',
        whiteSpace: 'normal',
        wordBreak: 'break-word',
      },
    },
  })
);

export const DiagnosticPrescription: React.FC = () => {
  const classes = useStyles();
  const [searchInput, setSearchInput] = useState('');
  const {
    diagnosticPrescription: selectedValues,
    setDiagnosticPrescription: setSelectedValues,
  } = useContext(CaseSheetContextJrd);
  const [idx, setIdx] = React.useState();
  const client = useApolloClient();
  const { caseSheetEdit, patientDetails } = useContext(CaseSheetContextJrd);

  const [showAddCondition, setShowAddCondition] = useState<boolean>(false);
  const [showAddOtherTests, setShowAddOtherTests] = useState<boolean>(false);
  const [otherDiagnostic, setOtherDiagnostic] = useState('');
  const showAddConditionHandler = (show: boolean) => setShowAddCondition(show);
  const [lengthOfSuggestions, setLengthOfSuggestions] = useState<number>(1);

  const fetchDignostic = async (value: string) => {
    client
      .query<SearchDiagnostics, any>({
        query: SEARCH_DIAGNOSTICS,
        variables: {
          /* city:
            patientDetails &&
            patientDetails.patientAddress &&
            patientDetails.patientAddress.length > 0
              ? patientDetails.patientAddress[0]!.city
              : '', */
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
        console.log('Error occured while searching for Doctors', e);
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
    (GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_pastAppointments_caseSheet_diagnosticPrescription | null)[]
  >([]);

  const handleSuggestionsFetchRequested = ({ value }: { value: string }) => {
    setSuggestions(getSuggestions(value));
  };

  const handleSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  function renderSuggestion(suggestion: any | null, { query }: Autosuggest.RenderSuggestionParams) {
    const matches = match(suggestion!.itemName, query);
    const parts = parse(suggestion!.itemName, matches);

    return (
      otherDiagnostic.length > 2 && (
        <div>
          {parts.map((part) => (
            <span
              key={part.text}
              style={{
                fontWeight: part.highlight ? 500 : 400,
                whiteSpace: 'pre',
              }}
              title={suggestion!.itemName} //added by Vishal
            >
              {part.text}
            </span>
          ))}
          <img src={require('images/ic_dark_plus.svg')} alt="" />
        </div>
      )
    );
  }

  const handleChange = (itemname: keyof typeof state) => (
    event: React.ChangeEvent<{}>,
    { newValue }: Autosuggest.ChangeEvent
  ) => {
    if (event.nativeEvent.type === 'input' && newValue.length > 2) {
      fetchDignostic(newValue);
    }

    setOtherDiagnostic(newValue.trim());
    setState({
      ...state,
      [itemname]: newValue,
    });
  };

  const handleDelete = (item: any, idx: number) => {
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
    <div className={classes.root}>
      <div className={classes.sectionGroup}>
        <div className={classes.sectionTitle}>Tests</div>

        <div className={classes.chipSection}>
          {selectedValues !== null &&
            selectedValues.length > 0 &&
            selectedValues!.map((item, idx) =>
              item.itemName
                ? item.itemName!.trim() !== '' && (
                    <div className={classes.chipCol}>
                      <Chip
                        className={classes.chipItem}
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
                    </div>
                  )
                : item.itemname &&
                  item.itemname!.trim() !== '' && (
                    <div className={classes.chipCol}>
                      <Chip
                        className={classes.chipItem}
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
                    </div>
                  )
            )}
        </div>
      </div>
      {!showAddCondition && caseSheetEdit && (
        <AphButton
          classes={{ root: classes.addBtn }}
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
            selectedValues && selectedValues.push(suggestion);
            setSelectedValues(selectedValues);
            setShowAddCondition(false);
            suggestions = suggestions.filter(
              (val) => selectedValues && selectedValues.includes(val!)
            );
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
            onKeyPress: (e) => {
              if (e.which == 13 || e.keyCode == 13) {
                if (selectedValues && suggestions.length === 1) {
                  selectedValues.push(suggestions[0]);
                  setSelectedValues(selectedValues);
                  setShowAddCondition(false);
                  suggestions = suggestions.filter((val) => selectedValues.includes(val!));
                  setState({
                    single: '',
                    popper: '',
                  });
                  setOtherDiagnostic('');
                }
              }
            },
          }}
          theme={{
            container: classes.suggestionsContainer,
            suggestionsList: classes.suggestionsList,
            suggestion: classes.suggestionItem,
            suggestionHighlighted: classes.suggestionHighlighted,
          }}
          renderSuggestionsContainer={(options) => (
            <Paper {...options.containerProps} square classes={{ root: classes.suggestionPopover }}>
              {options.children}
            </Paper>
          )}
        />
      )}
      {otherDiagnostic.trim().length > 2 && (
        <div className={classes.addNewDiagnostic}>
          <AphButton
            onClick={() => {
              if (otherDiagnostic.trim() !== '') {
                selectedValues!.splice(idx, 0, {
                  itemname: otherDiagnostic,
                  __typename: 'DiagnosticPrescription',
                });
                setSelectedValues(selectedValues);
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
        </div>
      )}
    </div>
  );
};
