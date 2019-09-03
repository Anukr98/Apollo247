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
// import {
//   GetJuniorDoctorCaseSheet,
//   GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_otherInstructions,
// } from 'graphql/types/GetJuniorDoctorCaseSheet';
import {
  GetCaseSheet,
  GetCaseSheet_getCaseSheet_pastAppointments_caseSheet_otherInstructions,
} from 'graphql/types/GetCaseSheet';
import { CaseSheetContext } from 'context/CaseSheetContext';
// interface OptionType {
//   instruction: string,
//   __typename: "OtherInstructions"
// }

interface OptionType {
  instruction: string;
  __typename: 'OtherInstructions';
}

let suggestions: OptionType[] = [
  { instruction: 'Sore Throat', __typename: 'OtherInstructions' },
  { instruction: 'Sorosis', __typename: 'OtherInstructions' },
];

// const suggestions: OptionType[] = [];

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
  const matches = match(suggestion.instruction, query);
  const parts = parse(suggestion.instruction, matches);

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

function getSuggestions(value: string) {
  const inputValue = deburr(value.trim()).toLowerCase();
  const inputLength = inputValue.length;
  let count = 0;

  return inputLength === 0
    ? []
    : suggestions.filter((suggestion) => {
        const keep =
          count < 5 && suggestion.instruction.slice(0, inputLength).toLowerCase() === inputValue;

        if (keep) {
          count += 1;
        }

        return keep;
      });
}

function getSuggestionValue(suggestion: OptionType) {
  return suggestion.instruction;
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
      marginBottom: 10,
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
      '&:focus': {
        backgroundColor: 'rgba(0,0,0,0.02)',
      },
      '& span': {
        display: 'inline-block',
        width: '100%',
        textAlign: 'left',
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

export const OtherInstructions: React.FC = () => {
  const classes = useStyles();
  const { otherInstructions: selectedValues, setOtherInstructions: setSelectedValues } = useContext(
    CaseSheetContext
  );
  const [idx, setIdx] = React.useState();

  useEffect(() => {
    if (idx >= 0) {
      setSelectedValues(selectedValues);
      suggestions!.map((item, idx) => {
        selectedValues!.map((val) => {
          if (item.instruction === val.instruction) {
            const indexDelete = suggestions.indexOf(item);
            suggestions!.splice(indexDelete, 1);
          }
        });
      });
    }
  }, [selectedValues, idx]);

  const [favoriteDiagnostics, setFavoriteDiagnostics] = useState<OptionType[]>([
    { instruction: 'Use sunscreen everyday', __typename: 'OtherInstructions' },
    { instruction: 'Avoid outside food for a few days', __typename: 'OtherInstructions' },
    { instruction: 'Avoid stepping out with wet hair', __typename: 'OtherInstructions' },
  ]);
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

  const handleChange = (name: keyof typeof state) => (
    event: React.ChangeEvent<{}>,
    { newValue }: Autosuggest.ChangeEvent
  ) => {
    setState({
      ...state,
      [name]: newValue,
    });
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
  const handleDelete = (item: any, idx: number) => {
    console.log(item);
    suggestions.splice(0, 0, item);
    selectedValues!.splice(idx, 1);
    setSelectedValues(selectedValues);
    const sum = idx + Math.random();
    setIdx(sum);
  };

  return (
    <Typography component="div" className={classes.contentContainer}>
      <Typography component="div" className={classes.column}>
        <Typography component="h5" variant="h5">
          Instructions to the patient
        </Typography>
        <Typography component="div" className={classes.listContainer}>
          {selectedValues !== null &&
            selectedValues.length > 0 &&
            selectedValues!.map((item, idx) => (
              <Chip
                className={classes.othersBtn}
                key={idx}
                label={item!.instruction}
                onDelete={() => handleDelete(item, idx)}
                deleteIcon={<img src={require('images/ic_cancel_green.svg')} alt="" />}
              />
            ))}
        </Typography>
      </Typography>
      <Typography component="div" className={classes.textFieldContainer}>
        {!showAddCondition && (
          <AphButton
            className={classes.btnAddDoctor}
            variant="contained"
            color="primary"
            onClick={() => showAddConditionHandler(true)}
          >
            <img src={require('images/ic_dark_plus.svg')} alt="" /> ADD INSTRUCTIONS
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
              placeholder: 'Search Instructions',
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
      </Typography>
    </Typography>
  );
};
