import React, { useState, useEffect, useContext } from 'react';
import { Chip, makeStyles, Theme, createStyles, Paper, Tooltip } from '@material-ui/core';
import { AphButton, AphTextField, AphTooltip } from '@aph/web-ui-components';
import Autosuggest from 'react-autosuggest';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import { useApolloClient } from 'react-apollo-hooks';
import { SearchDiagnosis } from 'graphql/types/SearchDiagnosis';
import { SEARCH_DIAGNOSIS } from 'graphql/profiles';
import { CaseSheetContextJrd } from 'context/CaseSheetContextJrd';

interface OptionType {
  name: string;
  id: '';
  __typename: 'Diagnosis';
}

let suggestions: OptionType[] = [];

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
        paddingRight: 30,
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
      },
    },
    textboxContainer: {
      position: 'relative',
    },
    chipItem: {
      padding: 7,
      paddingLeft: 12,
      fontSize: 14,
      fontWeight: 600,
      color: theme.palette.common.white,
      backgroundColor: '#00b38e',
      borderRadius: 16,
      marginRight: 16,
      marginTop: 6,
      height: 'auto',
      wordBreak: 'break-word',
      '&:focus': {
        backgroundColor: '#00b38e',
      },
      '& span': {
        paddingLeft: 0,
        paddingRight: 5,
        whiteSpace: 'normal',
      },
      '& img': {
        margin: 0,
        marginLeft: 5,
      },
    },
  })
);

export const Diagnosis: React.FC = () => {
  const classes = useStyles({});
  const [idx, setIdx] = React.useState<any>();
  const [searchInput, setSearchInput] = useState('');
  const { diagnosis: selectedValues, setDiagnosis: setSelectedValues } = useContext(
    CaseSheetContextJrd
  );

  const [diagnosisValue, setDiagnosisValue] = useState('');
  const { caseSheetEdit } = useContext(CaseSheetContextJrd);
  const client = useApolloClient();

  useEffect(() => {
    if (idx >= 0) {
      setSelectedValues(selectedValues);
      suggestions!.map((item, idx) => {
        selectedValues!.map((val) => {
          if (item.name === val.name) {
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
  const [stateSuggestions, setSuggestions] = React.useState<OptionType[]>([]);

  const handleSuggestionsFetchRequested = ({ value }: { value: string }) => {
    setSuggestions(getSuggestions(value));
  };

  const handleSuggestionsClearRequested = () => {
    setSuggestions([]);
  };
  const fetchDignosis = async (value: string) => {
    client
      .query<SearchDiagnosis, any>({
        query: SEARCH_DIAGNOSIS,
        variables: { searchString: value },
      })
      .then((_data: any) => {
        let filterVal: any = _data!.data!.searchDiagnosis!;
        filterVal.forEach((val: any, index: any) => {
          selectedValues!.forEach((selectedval: any) => {
            if (val.name === selectedval.name) {
              filterVal.splice(index, 1);
            }
          });
        });
        suggestions = filterVal;
        setSearchInput(value);
      })
      .catch((e) => {
        console.log('Error occured while searching for Doctors', e);
      });
  };
  const getSuggestions = (value: string) => {
    return suggestions;
  };

  function getSuggestionValue(suggestion: OptionType) {
    return suggestion.name;
  }
  function renderSuggestion(
    suggestion: OptionType,
    { query, isHighlighted }: Autosuggest.RenderSuggestionParams
  ) {
    const matches = match(suggestion.name, query);
    const parts = parse(suggestion.name, matches);

    return (
      diagnosisValue.length > 2 && (
        <AphTooltip open={isHighlighted} title={suggestion.name}>
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
            <img src={require('images/ic_dark_plus.svg')} alt="" />
          </div>
        </AphTooltip>
      )
    );
  }

  useEffect(() => {
    if (searchInput.length > 2) {
      setSuggestions(getSuggestions(searchInput));
    }
  }, [searchInput]);
  const handleChange = (name: keyof typeof state) => (
    event: React.ChangeEvent<{}>,
    { newValue }: Autosuggest.ChangeEvent
  ) => {
    if (event.nativeEvent.type === 'input' && newValue.length > 2) {
      fetchDignosis(newValue);
    }
    setDiagnosisValue(newValue);
    setState({
      ...state,
      [name]: newValue,
    });
  };
  const handleDelete = (item: any, idx: number) => {
    selectedValues!.splice(idx, 1);
    setSelectedValues(selectedValues);
    const sum = idx + Math.random();
    setIdx(sum);
  };
  const [showAddCondition, setShowAddCondition] = useState<boolean>(false);
  const showAddConditionHandler = (show: boolean) => setShowAddCondition(show);

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

  const autosuggestProps = {
    renderInputComponent,
    suggestions: stateSuggestions,
    onSuggestionsFetchRequested: handleSuggestionsFetchRequested,
    onSuggestionsClearRequested: handleSuggestionsClearRequested,
    getSuggestionValue,
    renderSuggestion,
  };
  return (
    <div className={classes.root}>
      <div className={classes.sectionGroup}>
        <div className={classes.sectionTitle}>
          Diagnosed Medical Condition (Acceptable in ICD-10 nomenclature)
        </div>
        <div className={classes.chipSection}>
          {selectedValues !== null &&
            selectedValues.length > 0 &&
            selectedValues!.map((item, idx) =>
              caseSheetEdit && item.name!.trim() !== '' ? (
                <div className={classes.chipCol}>
                  <Chip
                    className={classes.chipItem}
                    key={idx}
                    label={item!.name}
                    onDelete={() => handleDelete(item, idx)}
                    color="primary"
                    deleteIcon={<img src={require('images/ic_cross_orange.svg')} alt="" />}
                  />
                </div>
              ) : (
                item.name!.trim() !== '' && (
                  <div className={classes.chipCol}>
                    <Chip
                      className={classes.chipItem}
                      key={idx}
                      label={item!.name}
                      color="primary"
                      deleteIcon={<img src={require('images/ic_cross_orange.svg')} alt="" />}
                    />
                  </div>
                )
              )
            )}
        </div>
      </div>
      {!showAddCondition && caseSheetEdit && (
        <AphButton
          color="primary"
          classes={{ root: classes.addBtn }}
          onClick={() => showAddConditionHandler(true)}
        >
          <img src={require('images/ic_dark_plus.svg')} alt="" /> Add Condition
        </AphButton>
      )}
      <div className={classes.textboxContainer}>
        {showAddCondition && (
          <Autosuggest
            onSuggestionSelected={(e, { suggestion }) => {
              selectedValues && selectedValues.push(suggestion);
              setSelectedValues(selectedValues);
              setShowAddCondition(false);
              suggestions = suggestions.filter(
                (val) => selectedValues && selectedValues.includes(val)
              );
              setDiagnosisValue('');
              setState({
                single: '',
                popper: '',
              });
            }}
            {...autosuggestProps}
            inputProps={{
              //classes,
              id: 'react-autosuggest-simple',
              placeholder: 'Search Condition',
              value: state.single,
              onChange: handleChange('single'),
              onKeyPress: (e) => {
                if (e.which == 13 || e.keyCode == 13) {
                  if (selectedValues && suggestions.length === 1) {
                    selectedValues.push(suggestions[0]);
                    setSelectedValues(selectedValues);
                    setShowAddCondition(false);
                    suggestions = suggestions.filter((val) => selectedValues.includes(val));
                    setDiagnosisValue('');
                    setState({
                      single: '',
                      popper: '',
                    });
                  }
                }
              },
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
            theme={{
              container: classes.suggestionsContainer,
              suggestionsList: classes.suggestionsList,
              suggestion: classes.suggestionItem,
              suggestionHighlighted: classes.suggestionHighlighted,
            }}
          />
        )}
        {diagnosisValue.trim().length > 2 && (
          <AphButton
            className={classes.darkGreenaddBtn}
            variant="contained"
            color="primary"
            onClick={() => {
              if (diagnosisValue.trim() !== '') {
                selectedValues!.splice(selectedValues!.length, 0, {
                  name: diagnosisValue,
                  __typename: 'Diagnosis',
                });
                setSelectedValues(selectedValues);
                setShowAddCondition(false);

                setTimeout(() => {
                  setDiagnosisValue('');
                  setState({
                    single: '',
                    popper: '',
                  });
                }, 10);
              }
            }}
          >
            <img src={require('images/ic_add_circle.svg')} alt="" />
          </AphButton>
        )}
      </div>
    </div>
  );
};
