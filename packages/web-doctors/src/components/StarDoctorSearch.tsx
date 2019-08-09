import React, { useEffect, useState } from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Select } from '@material-ui/core';
import { GET_DOCTOR_DETAILS } from 'graphql/profiles';

import {
  GetDoctorDetails,
  GetDoctorDetails_getDoctorDetails_starTeam,
} from 'graphql/types/GetDoctorDetails';
import { ApolloConsumer } from 'react-apollo';

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
  addDoctorHandler: (doctor: GetDoctorDetails_getDoctorDetails_starTeam | null | undefined) => void;
}

export const StarDoctorSearch: React.FC<StarDoctorSearchProps> = ({ addDoctorHandler }) => {
  const classes = useStyles();
  // const [doctor, setDoctor] = React.useState<
  //   GetDoctorDetails_getDoctorDetails_starTeam | null | undefined
  // >({
  //   associatedDoctor: {},
  // } as GetDoctorDetails_getDoctorDetails_starTeam);

  const [data, setData] = useState<GetDoctorDetails>();

  return (
    <ApolloConsumer>
      {(client) => {
        client.query({ query: GET_DOCTOR_DETAILS }).then(({ data: starDoctorData }) => {
          setData(starDoctorData);
        });
        return (
          <div className={`${classes.root} ${classes.posRelative}`}>
            <Select
              value={''}
              displayEmpty
              onChange={(e) => {
                const doctor = data!.getDoctorDetails!.starTeam!.find(
                  (item) => item!.associatedDoctor!.id === e.target.value
                );

                addDoctorHandler(doctor);
              }}
            >
              <MenuItem disabled value="">
                Select a doctor
              </MenuItem>
              {data &&
                data.getDoctorDetails &&
                data.getDoctorDetails.starTeam &&
                data.getDoctorDetails.starTeam
                  .filter(
                    (existingDoc: GetDoctorDetails_getDoctorDetails_starTeam | null) =>
                      existingDoc!.isActive === false
                  )
                  .map(
                    (item: GetDoctorDetails_getDoctorDetails_starTeam | null) => (
                      console.log(item),
                      (
                        <MenuItem
                          key={item!.associatedDoctor!.id}
                          value={item!.associatedDoctor!.id}
                        >
                          {`${
                            item!.associatedDoctor!.salutation
                              ? `${item!.associatedDoctor!.salutation} `
                              : ''
                          }
                          ${item!.associatedDoctor!.firstName} ${item!.associatedDoctor!.lastName}`}
                        </MenuItem>
                      )
                    )
                  )}
            </Select>
          </div>
        );
      }}
    </ApolloConsumer>
  );
};
