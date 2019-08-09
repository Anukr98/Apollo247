import React, { useEffect } from 'react';
import Autosuggest from 'react-autosuggest';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import MenuItem from '@material-ui/core/MenuItem';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { debounce } from 'lodash';
import Dropdown from '@material-ui/core';
import { GET_DOCTOR_FOR_STAR_DOCTOR_PROGRAM, GET_DOCTOR_DETAILS } from 'graphql/profiles';
import { ApolloConsumer } from 'react-apollo';
import ApolloClient from 'apollo-client';

import {
  GetDoctorDetails_getDoctorDetails_starTeam_associatedDoctor,
  GetDoctorDetails_getDoctorDetails_starTeam,
} from 'graphql/types/GetDoctorDetails';

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
          root: classes.customInput,
        },
      }}
      {...other}
    />
  );
}

function renderSuggestion(
  suggestion: GetDoctorDetails_getDoctorDetails_starTeam,
  { query, isHighlighted }: Autosuggest.RenderSuggestionParams
) {
  const label = `${suggestion.associatedDoctor!.firstName} ${
    suggestion.associatedDoctor!.lastName
  }`;
  const matches = match(label, query);
  const parts = parse(label, matches);
  return (
    <MenuItem selected={isHighlighted} component="div">
      <div>
        {parts.map((part: Search, index: number) => (
          <span key={index.toString()} style={{ fontWeight: part.highlight ? 700 : 400 }}>
            {part.text}
          </span>
        ))}
      </div>
    </MenuItem>
  );
}

function getSuggestionValue(suggestion: GetDoctorDetails_getDoctorDetails_starTeam) {
  return `${suggestion.associatedDoctor!.firstName} ${suggestion.associatedDoctor!.lastName}`;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    customInput: {
      marginTop: 5,
      color: '#01475b',
      fontSize: 18,
      fontWeight: theme.typography.fontWeightMedium,
      borderBottom: '2px solid #00b38e',
      '&:hover': {
        borderBottom: '2px solid #00b38e',
        '&:before': {
          borderBottom: 'none !important',
        },
      },
      '&:before': {
        borderBottom: 'none',
      },
      '&:after': {
        borderBottom: 'none',
      },
    },
    root: {
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
        color: '#02475b',
        '&:last-child': {
          borderBottom: 'none',
        },
      },
    },
    suggestion: {
      display: 'block',
    },
    suggestionsList: {
      margin: 0,
      padding: 0,
      listStyleType: 'none',
      '& li': {
        '&:hover': {
          '& div': {
            backgroundColor: 'transparent',
            color: '#00b38e',
            '&:hover': {
              backgroundColor: 'transparent',
              color: '#00b38e',
            },
          },
        },
      },
    },
    divider: {
      height: theme.spacing(2),
    },
    posRelative: {
      position: 'relative',
    },
    addBtn: {
      position: 'absolute',
      right: 0,
      top: 10,
    },
  })
);
export interface StarDoctorSearchProps {
  addDoctorHandler: (doctor: GetDoctorDetails_getDoctorDetails_starTeam) => void;
}

let debouncedSuggestionFetchRequested: (
  client: ApolloClient<GetDoctorDetails_getDoctorDetails_starTeam>
) => void;

export const StarDoctorSearch: React.FC<StarDoctorSearchProps> = ({ addDoctorHandler }) => {
  const classes = useStyles();
  const [state, setState] = React.useState({
    single: '',
  });
  const [doctor, setDoctor] = React.useState<GetDoctorDetails_getDoctorDetails_starTeam>(
    {} as GetDoctorDetails_getDoctorDetails_starTeam
  );
  const [stateSuggestions, setSuggestions] = React.useState<
    GetDoctorDetails_getDoctorDetails_starTeam[]
  >([]);

  useEffect(() => {
    debouncedSuggestionFetchRequested = debounce(
      (client) => {
        client
          .query({
            query: GET_DOCTOR_DETAILS,
          })
          .then(({ data }) => {
            setSuggestions(
              data.getDoctorDetails.starTeam!.filter(
                (existingDoc: GetDoctorDetails_getDoctorDetails_starTeam) =>
                  existingDoc!.isActive === false
              ) || []
            );
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
      suggestion: GetDoctorDetails_getDoctorDetails_starTeam;
    }
  ) => {
    setDoctor(suggestion);
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
              debouncedSuggestionFetchRequested(client);
            }}
            inputProps={{
              classes,
              id: 'react-autosuggest-simple',
              label: '',
              placeholder: '',
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
              <div>
                <Paper {...options.containerProps} square>
                  {options.children}
                </Paper>
                <div
                  className={classes.addBtn}
                  onClick={(value) => {
                    debouncedSuggestionFetchRequested(client);
                  }}
                >
                  <img alt="" src={require('images/ic_dropdown.svg')} />
                </div>
              </div>
            )}
          />

          {doctor!.associatedDoctor! ? (
            state.single ===
              `${doctor!.associatedDoctor!.firstName} ${doctor!.associatedDoctor!.lastName}` && (
              <div
                className={classes.addBtn}
                onClick={() => {
                  addDoctorHandler(doctor);
                }}
              >
                <img alt="" src={require('images/add_doctor.svg')} />
              </div>
            )
          ) : (
            <div
              className={classes.addBtn}
              onClick={() => {
                addDoctorHandler(doctor);
              }}
            >
              {/*  <img alt="" src={require('images/ic_dropdown.svg')} /> */}
            </div>
          )}
        </div>
      )}
    </ApolloConsumer>
  );
};
