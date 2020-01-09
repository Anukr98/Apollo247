import React, { useState, useEffect, useContext } from 'react';
import {
  Typography,
  Chip,
  MenuItem,
  makeStyles,
  Theme,
  createStyles,
  Paper,
} from '@material-ui/core';
import { AphButton, AphInput, AphTextField } from '@aph/web-ui-components';
import Autosuggest from 'react-autosuggest';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import deburr from 'lodash/deburr';
import { useApolloClient } from 'react-apollo-hooks';
import { SearchDiagnosis, SearchDiagnosisVariables } from 'graphql/types/SearchDiagnosis';
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
  suggestion: OptionType,
  { query, isHighlighted }: Autosuggest.RenderSuggestionParams
) {
  const matches = match(suggestion.name, query);
  const parts = parse(suggestion.name, matches);

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
    divider: {
      height: theme.spacing(2),
    },
    mainContainer: {
      width: '100%',
      '& h4': {
        fontSize: 14,
        fontWeight: 500,
        color: 'rgba(2, 71, 91, 0.6)',
        marginBottom: 12,
      },
      '&:before': {
        borderBottom: '2px solid #00b38e',
      },
      '&:after': {
        borderBottom: '2px solid #00b38e',
      },
      '& input': {
        borderBottom: '2px solid #00b38e',
        '&:hover': {
          borderBottom: '2px solid #00b38e',
          '&:before': {
            borderBottom: '2px solid #00b38e',
          },
        },
        '&:before': {
          borderBottom: '2px solid #00b38e',
        },
        '&:after': {
          borderBottom: '2px solid #00b38e',
        },
      },
    },
    diagnosBtn: {
      border: '1px solid #00b38e',
      borderRadius: 16,
      color: '#fff !important',
      fontWeight: 600,
      backgroundColor: '#00b38e',
      marginBottom: 15,
      marginRight: 16,
      fontSize: 14,
      paddingRight: 30,
      position: 'relative',
      minHeight: 32,
      height: 'auto',
      '& svg': {
        position: 'absolute',
        right: 0,
        '& path': {
          fill: '#fff',
        },
      },
      '& span': {
        whiteSpace: 'normal',
        paddingTop: 5,
        paddingBottom: 5,
      },
      '&:focus': {
        backgroundColor: '#00b38e',
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
    return suggestions;
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
    if (event.nativeEvent.type === 'input') {
      if (newValue.length > 2) {
        fetchDignosis(newValue);
      }
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
    <Typography component="div" className={classes.mainContainer}>
      <Typography component="h4" variant="h4">
        Diagnosed Medical Condition
      </Typography>
      <Typography component="div">
        {selectedValues !== null &&
          selectedValues.length > 0 &&
          selectedValues!.map((item, idx) =>
            caseSheetEdit && item.name!.trim() !== '' ? (
              <Chip
                className={classes.diagnosBtn}
                key={idx}
                label={item!.name}
                onDelete={() => handleDelete(item, idx)}
                color="primary"
              />
            ) : (
              item.name!.trim() !== '' && (
                <Chip className={classes.diagnosBtn} key={idx} label={item!.name} color="primary" />
              )
            )
          )}
      </Typography>
      {!showAddCondition && caseSheetEdit && (
        <AphButton
          variant="contained"
          color="primary"
          classes={{ root: classes.btnAddDoctor }}
          onClick={() => showAddConditionHandler(true)}
        >
          <img src={require('images/ic_dark_plus.svg')} alt="" /> ADD CONDITION
        </AphButton>
      )}
      {showAddCondition && (
        <Autosuggest
          onSuggestionSelected={(e, { suggestion }) => {
            selectedValues && selectedValues.push(suggestion);
            setSelectedValues(selectedValues);
            setShowAddCondition(false);
            suggestions = suggestions.filter(
              (val) => selectedValues && selectedValues.includes(val)
            );
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
            onKeyPress: (e) => {
              if (e.which == 13 || e.keyCode == 13) {
                if (selectedValues && suggestions.length === 1) {
                  selectedValues.push(suggestions[0]);
                  setSelectedValues(selectedValues);
                  setShowAddCondition(false);
                  suggestions = suggestions.filter(
                    (val) => selectedValues && selectedValues.includes(val)
                  );
                  setState({
                    single: '',
                    popper: '',
                  });
                }
              }
            },
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
    </Typography>
  );
};
