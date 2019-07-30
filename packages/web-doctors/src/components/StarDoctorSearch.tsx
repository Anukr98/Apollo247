import React, { useEffect } from 'react';
import Autosuggest from 'react-autosuggest';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import MenuItem from '@material-ui/core/MenuItem';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { debounce } from 'lodash';
import { GET_DOCTOR_FOR_STAR_DOCTOR_PROGRAM } from 'graphql/profiles';
import { ApolloConsumer } from 'react-apollo';
import ApolloClient from 'apollo-client';
import {
  GetDoctorsForStarDoctorProgram_getDoctorsForStarDoctorProgram,
  GetDoctorsForStarDoctorProgram_getDoctorsForStarDoctorProgram_profile,
} from 'graphql/types/GetDoctorsForStarDoctorProgram';

interface DoctorsName {
  label: string;
  typeOfConsult: string;
  experience: string;
  firstName: string;
  inviteStatus: string;
  lastName: string;
}
interface Search {
  text: string;
  highlight: boolean;
}

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
  suggestion: GetDoctorsForStarDoctorProgram_getDoctorsForStarDoctorProgram,
  { query, isHighlighted }: Autosuggest.RenderSuggestionParams
) {
  const label = `${suggestion.profile!.firstName} ${suggestion.profile!.lastName}`;
  const matches = match(label, query);
  const parts = parse(label, matches);
  return (
    <MenuItem selected={isHighlighted} component="div">
      <div>
        {parts.map((part: Search, index: number) => (
          <span
            key={index.toString()}
            style={{ fontWeight: part.highlight ? 400 : 400, color: '#000' }}
          >
            {part.text}
          </span>
        ))}
      </div>
    </MenuItem>
  );
}

function getSuggestionValue(
  suggestion: GetDoctorsForStarDoctorProgram_getDoctorsForStarDoctorProgram
) {
  return `${suggestion.profile!.firstName} ${suggestion.profile!.lastName}`;
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
      borderRadius: '10px',
      '& li': {
        borderBottom: '1px solid rgba(2,71,91,0.2)',
      },
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
export interface StarDoctorSearchProps {
  addDoctorHandler: (
    doctor: GetDoctorsForStarDoctorProgram_getDoctorsForStarDoctorProgram_profile
  ) => void;
}

let debouncedSuggestionFetchRequested: (
  client: ApolloClient<GetDoctorsForStarDoctorProgram_getDoctorsForStarDoctorProgram>,
  value: string
) => void;

export const StarDoctorSearch: React.FC<StarDoctorSearchProps> = ({ addDoctorHandler }) => {
  const classes = useStyles();
  const [state, setState] = React.useState({
    single: '',
  });
  const [doctor, setDoctor] = React.useState<
    GetDoctorsForStarDoctorProgram_getDoctorsForStarDoctorProgram_profile
  >({} as GetDoctorsForStarDoctorProgram_getDoctorsForStarDoctorProgram_profile);
  const [stateSuggestions, setSuggestions] = React.useState<
    GetDoctorsForStarDoctorProgram_getDoctorsForStarDoctorProgram[]
  >([]);

  useEffect(() => {
    debouncedSuggestionFetchRequested = debounce(
      (client, value) => {
        client
          .query({
            query: GET_DOCTOR_FOR_STAR_DOCTOR_PROGRAM,
            variables: { searchString: value },
          })
          .then(({ data }) => {
            setSuggestions(data.getDoctorsForStarDoctorProgram);
          });
      },
      500,
      { leading: false, trailing: true }
    );
  }, []);

  const onSuggestionSelected = (
    event: React.FormEvent,
    {
      suggestion,
    }: {
      suggestion: GetDoctorsForStarDoctorProgram_getDoctorsForStarDoctorProgram;
    }
  ) => {
    setDoctor(suggestion.profile!);
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

  const autosuggestProps = {
    renderInputComponent,
    suggestions: stateSuggestions,
    onSuggestionsClearRequested: handleSuggestionsClearRequested,
    getSuggestionValue,
    renderSuggestion,
    onSuggestionSelected,
  };

  return (
    <ApolloConsumer>
      {(client) => (
        <div className={`${classes.root} ${classes.posRelative}`}>
          <Autosuggest
            {...autosuggestProps}
            onSuggestionsFetchRequested={({ value }) => {
              if (value.length > 2) {
                debouncedSuggestionFetchRequested(client, value);
              }
            }}
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
          {doctor.firstName && state.single === `${doctor.firstName} ${doctor.lastName}` && (
            <div
              className={classes.addBtn}
              onClick={() => {
                addDoctorHandler(doctor);
              }}
            >
              <img alt="" src={require('images/add_doctor.svg')} />
            </div>
          )}
        </div>
      )}
    </ApolloConsumer>
  );
};
