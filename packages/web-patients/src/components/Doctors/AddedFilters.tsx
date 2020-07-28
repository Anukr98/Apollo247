import React from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { AphButton } from '@aph/web-ui-components';
import { SearchObject, experienceList, genderList } from 'helpers/commonHelpers';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      backgroundColor: '#fff',
      marginTop: -10,
      marginBottom: 22,
      borderRadius: '0 0 5px 5px',
    },
    dialogContent: {
      padding: 20,
    },
    filterGroup: {
      display: 'flex',
      [theme.breakpoints.down('xs')]: {
        display: 'block',
      },
    },
    filterType: {
      paddingLeft: 16,
      paddingRight: 8,
      borderRight: '0.5px solid rgba(2,71,91,0.3)',
      width: '20%',
      [theme.breakpoints.down('xs')]: {
        display: 'inline-block',
        width: '100%',
      },
      '& h4': {
        fontSize: 12,
        fontWeight: 500,
        color: '#02475b',
        margin: 0,
        paddingBottom: 4,
      },
      '&:first-child': {
        paddingLeft: 0,
      },
      '&:last-child': {
        paddingRight: 0,
        borderRight: 'none',
      },
    },
    filterActive: {
      backgroundColor: '#00b38e !important',
      color: '#fff !important',
    },
    filterBtns: {
      '& button': {
        borderRadius: 10,
        boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
        backgroundColor: '#00b38e',
        color: '#fff',
        textTransform: 'none',
        fontSize: 12,
        lineHeight: '14px',
        fontWeight: 500,
        padding: '8px 8px',
        margin: '4px 0',
        marginRight: 7,
        minWidth: 'auto',
        '&:hover': {
          backgroundColor: '#00b38e',
          color: '#fff',
        },
      },
    },
  };
});

interface AddedFiltersProps {
  filter: SearchObject;
}

export const AddedFilters: React.FC<AddedFiltersProps> = (props) => {
  const classes = useStyles({});
  const { filter } = props;

  const applyClass = (type: Array<string>, value: string) => {
    return type.includes(value) ? classes.filterActive : '';
  };

  return (
    <div className={classes.root}>
      <div className={classes.dialogContent}>
        <div className={classes.filterGroup}>
          {filter.experience.length > 0 && (
            <div className={classes.filterType}>
              <h4>Experience In Years</h4>
              <div className={classes.filterBtns}>
                {filter.experience.map((exp) => {
                  const filterdExperience = experienceList.find(
                    (experienceObj) => experienceObj.key === exp
                  );
                  return (
                    filterdExperience && (
                      <AphButton disabled className={applyClass(filter.experience, exp)}>
                        {filterdExperience.value}
                      </AphButton>
                    )
                  );
                })}
              </div>
            </div>
          )}
          {filter.availability.length > 0 && (
            <div className={classes.filterType}>
              <h4>Availability</h4>
              <div className={classes.filterBtns}>
                {filter.availability.map((availability) => (
                  <AphButton disabled className={applyClass(filter.availability, availability)}>
                    {availability}
                  </AphButton>
                ))}
              </div>
            </div>
          )}
          {filter.fees.length > 0 && (
            <div className={classes.filterType}>
              <h4>Fees In Rupees</h4>
              <div className={classes.filterBtns}>
                {filter.fees.map((fee) => (
                  <AphButton disabled className={applyClass(filter.experience, fee)}>
                    {fee}
                  </AphButton>
                ))}
              </div>
            </div>
          )}
          {filter.gender.length > 0 && (
            <div className={classes.filterType}>
              <h4>Gender</h4>
              <div className={classes.filterBtns}>
                {filter.gender.map((gender) => {
                  const filteredGender = genderList.find((genderObj) => genderObj.key === gender);
                  return (
                    filteredGender && (
                      <AphButton disabled className={applyClass(filter.experience, gender)}>
                        {filteredGender.value}
                      </AphButton>
                    )
                  );
                })}
              </div>
            </div>
          )}
          {filter.language.length > 0 && (
            <div className={classes.filterType}>
              <h4>Language</h4>
              <div className={classes.filterBtns}>
                {filter.language.map((language) => (
                  <AphButton disabled className={applyClass(filter.language, language)}>
                    {language}
                  </AphButton>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
