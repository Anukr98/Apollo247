import React from 'react';
//import deburr from "lodash/deburr";
import Autosuggest from 'react-autosuggest';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import MenuItem from '@material-ui/core/MenuItem';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

interface DoctorsName {
  label: string;
  typeOfConsult: string;
  experience: string;
  firstName: string;
  inviteStatus: string;
  lastName: string;
}

const suggestions: DoctorsName[] = [
  {
    label: 'Dr Sunita Rao',
    typeOfConsult: '24/7',
    experience: '7',
    firstName: 'Sunita',
    inviteStatus: 'Not accepted',
    lastName: 'Rao',
  },
  {
    label: 'Dr Ranjit Mehra',
    typeOfConsult: '24/7',
    experience: '7',
    firstName: 'Ranjit',
    inviteStatus: 'Not accepted',
    lastName: 'Mehra',
  },
  {
    label: 'Dr Simran Kaur',
    typeOfConsult: '24/7',
    experience: '7',
    firstName: 'Simran',
    inviteStatus: 'Not accepted',
    lastName: 'Kaur',
  },
  {
    label: 'Dr Ajay Ranka',
    typeOfConsult: '24/7',
    experience: '7',
    firstName: 'Ajay',
    inviteStatus: 'Not accepted',
    lastName: 'Ranka',
  },
  {
    label: 'Dr Suman Seth',
    typeOfConsult: '24/7',
    experience: '7',
    firstName: 'Suman',
    inviteStatus: 'Not accepted',
    lastName: 'Seth',
  },
  {
    label: 'Dr kiran Seth',
    typeOfConsult: '24/7',
    experience: '7',
    firstName: 'kiran',
    inviteStatus: 'Not accepted',
    lastName: 'Seth',
  },
  {
    label: 'Dr Pooja Seth',
    typeOfConsult: '24/7',
    experience: '7',
    firstName: 'Pooja',
    inviteStatus: 'Not accepted',
    lastName: 'Seth',
  },
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
  suggestion: DoctorsName,
  { query, isHighlighted }: Autosuggest.RenderSuggestionParams
) {
  const matches = match(suggestion.label, query);
  const parts = parse(suggestion.label, matches);

  return (
    <MenuItem selected={isHighlighted} component="div">
      <div>
        {parts.map((part, index) => (
          <span
            key={index.toString()}
            style={{ fontWeight: part.highlight ? 500 : 400, color: '#000' }}
          >
            {part.text}
          </span>
        ))}
      </div>
    </MenuItem>
  );
}

function getSuggestions(value: string) {
  const inputValue = value.trim().toLowerCase();
  const inputLength = inputValue.length;

  return inputLength < 3
    ? []
    : suggestions.filter((suggestion) => {
        return suggestion.label.toLowerCase().indexOf(value.toLowerCase()) !== -1;
      });
}

function getSuggestionValue(suggestion: DoctorsName) {
  return suggestion.label;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      height: 80,
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
    input: {
      color: '#000',
    },
    posRelative: {
      position: 'relative',
    },
    addBtn: {
      position: 'absolute',
      right: 0,
      top: '20px',
    },
  })
);

export default function IntegrationAutosuggest({ addDoctorHadler, isReset }) {
  const classes = useStyles();
  const [state, setState] = React.useState({
    single: '',
  });
  const [doctor, setDoctor] = React.useState({});
  const [stateSuggestions, setSuggestions] = React.useState<DoctorsName[]>([]);

  const handleSuggestionsFetchRequested = ({ value }: any) => {
    setSuggestions(getSuggestions(value));
  };

  const handleSuggestionsClearRequested = () => {
    setSuggestions([]);
  };
  const onSuggestionSelected = (
    event,
    { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }
  ) => {
    setDoctor(suggestion);
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

  const autosuggestProps = {
    renderInputComponent,
    suggestions: stateSuggestions,
    onSuggestionsFetchRequested: handleSuggestionsFetchRequested,
    onSuggestionsClearRequested: handleSuggestionsClearRequested,
    getSuggestionValue,
    renderSuggestion,
    onSuggestionSelected: onSuggestionSelected,
  };

  return (
    <div className={`${classes.root} ${classes.posRelative}`}>
      <Autosuggest
        {...autosuggestProps}
        inputProps={{
          classes,
          id: 'react-autosuggest-simple',
          label: 'Search doctor',

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

      {doctor.label && state.single === doctor.label && (
        <div className={classes.addBtn} onClick={() => addDoctorHadler(doctor)}>
          <img alt="" src={require('images/add_doctor.svg')} />
        </div>
        // <button>
        //   Add
        // </button>
      )}
    </div>
  );
}
