import React, { useState, useEffect, useContext } from 'react';

import { Chip, Theme, MenuItem, Paper } from '@material-ui/core';
import { makeStyles, createStyles } from '@material-ui/styles';
import { AphButton, AphTextField } from '@aph/web-ui-components';
import deburr from 'lodash/deburr';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import Autosuggest from 'react-autosuggest';
import { useApolloClient } from 'react-apollo-hooks';
import { SEARCH_DIAGNOSTICS } from 'graphql/profiles';
import { SearchDiagnostics } from 'graphql/types/SearchDiagnostics';
// import {
//   GetJuniorDoctorCaseSheet,
//   GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_diagnosticPrescription,
// } from 'graphql/types/GetJuniorDoctorCaseSheet';
import {
  GetJuniorDoctorCaseSheet,
  GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_pastAppointments_caseSheet_diagnosticPrescription,
} from 'graphql/types/GetJuniorDoctorCaseSheet';
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

function renderSuggestion(
  suggestion: any | null,
  { query, isHighlighted }: Autosuggest.RenderSuggestionParams
) {
  const matches = match(suggestion!.itemName, query);
  const parts = parse(suggestion!.itemName, matches);

  return (
    <MenuItem selected={isHighlighted} component="div">
      {parts.map((part) => (
        <span key={part.text} style={{ fontWeight: part.highlight ? 500 : 400, whiteSpace: 'pre' }}>
          {part.text}
        </span>
      ))}
      <img src={require('images/ic-add.svg')} alt="" />
    </MenuItem>
  );
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
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
      paddingRight: 12,
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
      },
    },
    autoSuggestBox: {
      position: 'relative',
      '& input': {
        paddingRight: 30,
      },
    },
    searchpopup: {
      borderRadius: 10,
      boxShadow: '0 5px 20px 0 rgba(128,128,128,0.8)',
      marginTop: 2,
      position: 'absolute',
      left: 0,
      width: '100%',
      zIndex: 1,
      '& ul': {
        padding: 0,
        margin: 0,
        borderRadius: 10,
        overflow: 'hidden',
        '& li': {
          padding: 0,
          listStyleType: 'none',
          position: 'relative',
          '&:after': {
            content: '""',
            height: 1,
            left: 20,
            right: 20,
            bottom: 0,
            position: 'absolute',
            backgroundColor: 'rgba(2, 71, 91, 0.15)',
          },
          '& >div': {
            padding: '10px 62px 10px 16px',
            fontSize: 18,
            fontWeight: 500,
            color: '#02475b',
            '&:hover': {
              backgroundColor: '#f0f4f5 !important',
            },
            '&:focus': {
              backgroundColor: '#f0f4f5 !important',
            },
            '& span:nth-child(2)': {
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            },
            '& img': {
              position: 'absolute',
              right: 20,
              display: 'none',
            },
          },
          '&:first-child': {
            borderRadius: '10px 10px 0 0',
          },
          '&:last-child': {
            borderRadius: '10px 10px 0 0',
            '&:after': {
              display: 'none',
            },
          },
          '&:hover': {
            '& >div': {
              '& img': {
                display: 'block',
              },
            },
          },
        },
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
            container: classes.autoSuggestBox,
          }}
          renderSuggestionsContainer={(options) => (
            <Paper {...options.containerProps} square className={classes.searchpopup}>
              {options.children}
            </Paper>
          )}
        />
      )}
      {lengthOfSuggestions === 0 && otherDiagnostic.trim().length > 2 && (
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
