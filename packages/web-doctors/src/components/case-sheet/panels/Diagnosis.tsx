import React, { useState } from 'react';
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
import Autosuggest, { OnSuggestionSelected } from 'react-autosuggest';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import deburr from 'lodash/deburr';

interface OptionType {
  label: string;
}

const suggestions: OptionType[] = [{ label: 'Sore Throat' }, { label: 'Sorosis' }];

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
  const matches = match(suggestion.label, query);
  const parts = parse(suggestion.label, matches);

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
          count < 5 && suggestion.label.slice(0, inputLength).toLowerCase() === inputValue;

        if (keep) {
          count += 1;
        }

        return keep;
      });
}

function getSuggestionValue(suggestion: OptionType) {
  return suggestion.label;
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
    },
    divider: {
      height: theme.spacing(2),
    },
  })
);

export const Diagnosis: React.FC = () => {
  const classes = useStyles();
  const [selectedValues, setSelectedValues] = useState<OptionType[]>([
    { label: 'Viral Fever' },
    { label: 'Throat Infection' },
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
  const handleDelete = () => {};
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
    <Typography component="div">
      <Typography component="h3" variant="h4">
        Diagnosed Medical Condition
      </Typography>
      <Typography component="div">
        {selectedValues.map((item: { label: string }, idx) => (
          <Chip key={idx} label={item.label} onDelete={handleDelete} color="primary" />
        ))}
      </Typography>
      {!showAddCondition && (
        <AphButton
          variant="contained"
          color="primary"
          onClick={() => showAddConditionHandler(true)}
        >
          <img src={require('images/ic_add.svg')} alt="" /> ADD CONDITION
        </AphButton>
      )}
      {showAddCondition && (
        <Autosuggest
          onSuggestionSelected={(e, { suggestion }) => {
            setSelectedValues(selectedValues.concat(suggestion));
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
            <Paper {...options.containerProps} square>
              {options.children}
            </Paper>
          )}
        />
      )}
    </Typography>
  );
};
