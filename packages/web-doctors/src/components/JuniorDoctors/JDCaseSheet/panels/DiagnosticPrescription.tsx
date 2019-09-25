import React, { useState, useEffect, useContext } from 'react';
import { Typography, Chip, Theme, MenuItem, Paper, TextField } from '@material-ui/core';
import DoneIcon from '@material-ui/icons/Done';
import { makeStyles, createStyles } from '@material-ui/styles';
import AddCircle from '@material-ui/icons/AddCircle';
import { AphButton, AphTextField } from '@aph/web-ui-components';
import deburr from 'lodash/deburr';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import Autosuggest from 'react-autosuggest';
import { useApolloClient } from 'react-apollo-hooks';
import { SEARCH_DIAGNOSTIC } from 'graphql/profiles';
import { SearchDiagnostic } from 'graphql/types/SearchDiagnostic';
// import {
//   GetJuniorDoctorCaseSheet,
//   GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_diagnosticPrescription,
// } from 'graphql/types/GetJuniorDoctorCaseSheet';
import {
  GetCaseSheet,
  GetCaseSheet_getCaseSheet_pastAppointments_caseSheet_diagnosticPrescription,
} from 'graphql/types/GetCaseSheet';
import { CaseSheetContext } from 'context/CaseSheetContext';

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
  suggestion: OptionType | null,
  { query, isHighlighted }: Autosuggest.RenderSuggestionParams
) {
  const matches = match(suggestion!.itemname, query);
  const parts = parse(suggestion!.itemname, matches);

  return (
    <MenuItem selected={isHighlighted} component="div">
      <div>
        {parts.map((part) => (
          <span key={part.text} style={{ fontWeight: part.highlight ? 500 : 400 }}>
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
    },
    icon: {
      color: '#00b38e',
    },
    textFieldContainer: {
      width: '100%',
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

export const DiagnosticPrescription: React.FC = () => {
  const classes = useStyles();
  const [searchInput, setSearchInput] = useState('');
  const {
    diagnosticPrescription: selectedValues,
    setDiagnosticPrescription: setSelectedValues,
  } = useContext(CaseSheetContext);
  const [idx, setIdx] = React.useState();
  const client = useApolloClient();
  const { caseSheetEdit } = useContext(CaseSheetContext);

  const [showAddCondition, setShowAddCondition] = useState<boolean>(false);
  const [showAddOtherTests, setShowAddOtherTests] = useState<boolean>(false);
  const [otherDiagnostic, setOtherDiagnostic] = useState('');
  const showAddConditionHandler = (show: boolean) => setShowAddCondition(show);
  const [lengthOfSuggestions, setLengthOfSuggestions] = useState<number>(1);

  const fetchDignostic = async (value: string) => {
    client
      .query<SearchDiagnostic, any>({
        query: SEARCH_DIAGNOSTIC,
        variables: { searchString: value },
      })
      .then((_data: any) => {
        const filterVal: any = _data!.data!.searchDiagnostic!;
        console.log(_data!.data!.searchDiagnostic!);

        filterVal.forEach((val: any, index: any) => {
          selectedValues!.forEach((selectedval: any) => {
            if (val.itemname === selectedval.itemname) {
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
    const inputValue = deburr(value.trim()).toLowerCase();
    const inputLength = inputValue.length;
    let count = 0;

    return inputLength === 0
      ? []
      : suggestions.filter((suggestion) => {
          const keep =
            count < 5 &&
            suggestion !== null &&
            suggestion.itemname!.slice(0, inputLength).toLowerCase() === inputValue;

          if (keep) {
            count += 1;
          }

          return keep;
        });
  };

  function getSuggestionValue(suggestion: OptionType | null) {
    return suggestion!.itemname;
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
  const handleChange = (itemname: keyof typeof state) => (
    event: React.ChangeEvent<{}>,
    { newValue }: Autosuggest.ChangeEvent
  ) => {
    if (newValue.length > 2) fetchDignostic(newValue);

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
    <Typography component="div" className={classes.contentContainer}>
      <Typography component="div" className={classes.column}>
        <Typography component="h5" variant="h5">
          Tests
        </Typography>
        <Typography component="div" className={classes.listContainer}>
          {selectedValues !== null &&
            selectedValues.length > 0 &&
            selectedValues!.map(
              (item, idx) =>
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
          <div>
            <span>
              {`do you want to add '${otherDiagnostic}' in Tests ?`}
              <AphButton
                className={classes.btnAddDoctor}
                variant="contained"
                color="primary"
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
                <img src={require('images/ic_dark_plus.svg')} alt="" /> ADD TEST
              </AphButton>
            </span>
          </div>
        )}
      </Typography>
    </Typography>
  );
};
