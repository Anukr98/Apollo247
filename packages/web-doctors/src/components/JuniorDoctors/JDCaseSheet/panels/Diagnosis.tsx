import React, { useState, useEffect, useContext } from 'react';
import { Chip, MenuItem, makeStyles, Theme, createStyles, Paper } from '@material-ui/core';
import { AphButton, AphTextField } from '@aph/web-ui-components';
import Autosuggest from 'react-autosuggest';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import deburr from 'lodash/deburr';
import { useApolloClient } from 'react-apollo-hooks';
import { SearchDiagnosis } from 'graphql/types/SearchDiagnosis';
import { SEARCH_DIAGNOSIS } from 'graphql/profiles';
import { CaseSheetContext } from 'context/CaseSheetContext';

interface OptionType {
  name: string;
  id: '';
  __typename: 'Diagnosis';
}

let suggestions: OptionType[] = [];

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
  suggestion: OptionType,
  { query, isHighlighted }: Autosuggest.RenderSuggestionParams
) {
  const matches = match(suggestion.name, query);
  const parts = parse(suggestion.name, matches);

  return (
    <MenuItem selected={isHighlighted} component="div">
      {parts.map((part) => (
        <span key={part.text} style={{ fontWeight: part.highlight ? 500 : 400 }}>
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
    autoSuggestBox: {
      position: 'relative',
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
  })
);

export const Diagnosis: React.FC = () => {
  const classes = useStyles();
  const [idx, setIdx] = React.useState();
  const [searchInput, setSearchInput] = useState('');
  const { diagnosis: selectedValues, setDiagnosis: setSelectedValues } = useContext(
    CaseSheetContext
  );
  const { caseSheetEdit } = useContext(CaseSheetContext);
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
    const inputValue = deburr(value.trim()).toLowerCase();
    const inputLength = inputValue.length;
    let count = 0;

    return inputLength === 0
      ? []
      : suggestions.filter((suggestion) => {
          const keep =
            count < 5 && suggestion.name.slice(0, inputLength).toLowerCase() === inputValue;

          if (keep) {
            count += 1;
          }

          return keep;
        });
  };

  function getSuggestionValue(suggestion: OptionType) {
    return suggestion.name;
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
    if (newValue.length > 2) {
      fetchDignosis(newValue);
    }
    setState({
      ...state,
      [name]: newValue,
    });
  };
  const handleDelete = (item: any, idx: number) => {
    // suggestions.splice(0, 0, item);
    selectedValues!.splice(idx, 1);
    setSelectedValues(selectedValues);
    const sum = idx + Math.random();
    setIdx(sum);
  };
  const [showAddCondition, setShowAddCondition] = useState<boolean>(false);
  const showAddConditionHandler = (show: boolean) => setShowAddCondition(show);

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
        <div className={classes.sectionTitle}>Diagnosed Medical Condition</div>
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
      {showAddCondition && (
        <Autosuggest
          onSuggestionSelected={(e, { suggestion }) => {
            selectedValues!.push(suggestion);
            setSelectedValues(selectedValues);
            setShowAddCondition(false);
            suggestions = suggestions.filter((val) => !selectedValues!.includes(val));
            setState({
              single: '',
              popper: '',
            });
          }}
          {...autosuggestProps}
          inputProps={{
            classes,
            id: 'react-autosuggest-simple',
            placeholder: 'Search Condition',
            value: state.single,
            onChange: handleChange('single'),
          }}
          renderSuggestionsContainer={(options) => (
            <Paper {...options.containerProps} square className={classes.searchpopup}>
              {options.children}
            </Paper>
          )}
          theme={{
            container: classes.autoSuggestBox,
          }}
        />
      )}
    </div>
  );
};
