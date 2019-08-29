import React, { useState, useEffect, useContext } from 'react';
import {
  Typography,
  Chip,
  TextField,
  MenuItem,
  makeStyles,
  Theme,
  createStyles,
  Paper,
} from '@material-ui/core';
import { AphButton } from '@aph/web-ui-components';
import Autosuggest from 'react-autosuggest';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import deburr from 'lodash/deburr';
// import {
//   GetJuniorDoctorCaseSheet,
//   GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_diagnosis,
// } from 'graphql/types/GetJuniorDoctorCaseSheet';
import {
  GetCaseSheet,
  GetCaseSheet_getCaseSheet_pastAppointments_caseSheet_diagnosis,
} from 'graphql/types/GetCaseSheet';
import { CaseSheetContext } from 'context/CaseSheetContext';

interface OptionType {
  name: string;
  __typename: 'Diagnosis';
}

const suggestions: OptionType[] = [
  { name: 'Sore Throat', __typename: 'Diagnosis' },
  { name: 'Sorosis', __typename: 'Diagnosis' },
];

function renderInputComponent(inputProps: any) {
  const { classes, inputRef = () => {}, ref, ...other } = inputProps;

  return (
    <TextField
      fullWidth
      InputProps={{
        inputRef: (node) => {
          ref(node);
          inputRef(node);
        },
        classes: {
          input: classes.input,
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
          count < 5 && suggestion.name.slice(0, inputLength).toLowerCase() === inputValue;

        if (keep) {
          count += 1;
        }

        return keep;
      });
}

function getSuggestionValue(suggestion: OptionType) {
  return suggestion.name;
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
    },
    diagnosBtn: {
      border: '1px solid #00b38e',
      borderRadius: 16,
      color: '#00b38e',
      fontWeight: 600,
      backgroundColor: '#fff',
      marginBottom: 15,
      marginRight: 16,
      '& svg': {
        '& path': {
          fill: '#00b38e',
        },
      },
      '&:focus': {
        backgroundColor: '#fff',
      },
    },

    btnAddDoctor: {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      color: theme.palette.action.selected,
      fontSize: 14,
      fontWeight: theme.typography.fontWeightBold,
      // pointerEvents: 'none',
      paddingLeft: 4,
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
    searchpopup: {
      borderRadius: 10,
      boxShadow: '0 5px 20px 0 rgba(128,128,128,0.8)',
      marginTop: 2,
    },
  })
);

export const Diagnosis: React.FC = () => {
  const classes = useStyles();
  const [idx, setIdx] = React.useState();
  const { diagnosis: selectedValues, setDiagnosis: setSelectedValues } = useContext(
    CaseSheetContext
  );

  useEffect(() => {
    if (idx >= 0) {
      setSelectedValues(selectedValues);
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

  const handleChange = (name: keyof typeof state) => (
    event: React.ChangeEvent<{}>,
    { newValue }: Autosuggest.ChangeEvent
  ) => {
    setState({
      ...state,
      [name]: newValue,
    });
  };
  const handleDelete = (idx: number) => {
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
          selectedValues!.map((item, idx) => (
            <Chip
              className={classes.diagnosBtn}
              key={idx}
              label={item!.name}
              onDelete={() => handleDelete(idx)}
              color="primary"
            />
          ))}
      </Typography>
      {!showAddCondition && (
        <AphButton
          variant="contained"
          color="primary"
          classes={{ root: classes.btnAddDoctor }}
          onClick={() => showAddConditionHandler(true)}
        >
          <img src={require('images/ic_add.svg')} alt="" /> ADD CONDITION
        </AphButton>
      )}
      {showAddCondition && (
        <Autosuggest
          onSuggestionSelected={(e, { suggestion }) => {
            selectedValues!.push(suggestion);
            setSelectedValues(selectedValues);
            setShowAddCondition(false);
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
