import React, { useState } from 'react';
import { Theme, Typography, MenuItem } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { AphButton, AphTextField, AphSelect } from '@aph/web-ui-components';
import { SEND_HELP_EMAIL } from 'graphql/profiles';
import { SendHelpEmail, SendHelpEmailVariables } from 'graphql/types/SendHelpEmail';
import { generalHelpSections } from 'helpers/feedbackHelpers';
import _map from 'lodash/map';
import _find from 'lodash/find';
import { useMutation } from 'react-apollo-hooks';
import { useAllCurrentPatients } from 'hooks/authHooks';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Alerts } from 'components/Alerts/Alerts';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: 368,
      borderRadius: 10,
      paddingTop: 36,
      boxShadow: '0 5px 40px 0 rgba(0, 0, 0, 0.3)',
      backgroundColor: theme.palette.common.white,
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        borderRadius: 0,
      },
      '& p': {
        fontSize: 17,
        fontWeight: 500,
        lineHeight: 1.41,
        color: theme.palette.secondary.main,
        margin: 0,
      },
    },
    mascotIcon: {
      position: 'absolute',
      right: 12,
      top: -40,
      '& img': {
        maxWidth: 80,
      },
    },
    customScrollBar: {
      height: '65vh',
      overflow: 'auto',
    },
    contentGroup: {
      padding: 20,
      paddingTop: 0,
      paddingBottom: 0,
      '& h2': {
        fontSize: 18,
        fontWeight: 600,
      },
    },
    formGroup: {
      paddingTop: 8,
      paddingBottom: 8,
    },
    buttonGroup: {
      display: 'flex',
      flexWrap: 'wrap',
      marginLeft: -5,
      marginRight: -5,
      '& button': {
        margin: 5,
        fontSize: 16,
        lineHeight: '16px',
        padding: 12,
        textTransform: 'none',
        color: '#00b38e',
        fontWeight: 500,
        borderRadius: 10,
      },
    },
    buttonActive: {
      backgroundColor: '#00b38e',
      color: '#fff !important',
      '&:hover': {
        backgroundColor: '#00b38e',
        color: '#fff !important',
      },
    },
    formRow: {
      marginBottom: 20,
      '&:last-child': {
        marginBottom: 0,
      },
      '& label': {
        fontSize: 17,
        fontWeight: 500,
        lineHeight: 1.41,
        color: theme.palette.secondary.main,
        marginBottom: 8,
        display: 'block',
      },
    },
    selectRoot: {
      marginTop: -15,
    },
    inputRoot: {
      paddingTop: 5,
    },
    menuSelected: {
      backgroundColor: 'transparent !important',
      color: '#00b38e !important',
    },
    bottomActions: {
      display: 'flex',
      padding: 20,
      '& button': {
        flexGrow: 1,
        borderRadius: 10,
        '&:first-child': {
          color: '#fc9916',
        },
        '&:last-child': {
          marginLeft: 10,
        },
      },
    },
    submitBtn: {
      backgroundColor: '#fcb716',
      color: '#fff',
      '&:hover': {
        backgroundColor: '#fcb716',
        color: '#fff',
      },
    },
    submitDisable: {
      backgroundColor: '#fcb716',
      color: '#fff',
      opacity: 0.5,
    },
  };
});

const helpCategories = _map(generalHelpSections, 'category');
const defaultSelectedCategory = '';

interface HelpSectionProps {
  category: string;
  options: string[];
}

interface HelpFormProps {
  submitStatus: (status: boolean) => void;
  closeHelpForm: () => void;
}

export const HelpForm: React.FC<HelpFormProps> = (props) => {
  const classes = useStyles();
  const { submitStatus, closeHelpForm } = props;
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>(defaultSelectedCategory);
  const [selectedReason, setSelectedReason] = useState<string>('placeholder');
  const [mutationLoading, setMutationLoading] = useState<boolean>(false);
  const [comments, setComments] = useState<string>('');
  const reasonsList = _find(generalHelpSections, (helpSection: HelpSectionProps) => {
    return helpSection.category === selectedCategoryName;
  });
  const disableSubmit = !(selectedCategoryName.length > 0 && selectedReason.length > 0);
  const { currentPatient } = useAllCurrentPatients();
  const helpSectionMutation = useMutation<SendHelpEmail, SendHelpEmailVariables>(SEND_HELP_EMAIL);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  return (
    <div className={classes.root}>
      <div className={classes.mascotIcon}>
        <img src={require('images/ic-mascot.png')} alt="" />
      </div>
      <div className={classes.customScrollBar}>
        <div className={classes.contentGroup}>
          <Typography variant="h2">Hi! :)</Typography>
          <div className={classes.formGroup}>
            <div className={classes.formRow}>
              <label>What do you need help with?</label>
              <div className={classes.buttonGroup}>
                {helpCategories.map((categoryName) => {
                  return (
                    <AphButton
                      key={categoryName}
                      color="secondary"
                      className={categoryName === selectedCategoryName ? classes.buttonActive : ''}
                      value={categoryName}
                      onClick={(e) => {
                        const categoryName = e.currentTarget.value;
                        setSelectedCategoryName(categoryName);
                        setSelectedReason('placeholder');
                      }}
                    >
                      {categoryName}
                    </AphButton>
                  );
                })}
              </div>
            </div>
            <div className={classes.formRow}>
              <label>Please select a reason that best matches your query</label>
              <div className={classes.selectRoot}>
                <AphSelect
                  onChange={(e) => {
                    const reason = e.target.value as string;
                    setSelectedReason(reason);
                  }}
                  value={selectedReason}
                >
                  <MenuItem
                    value="placeholder"
                    disabled
                    classes={{ selected: classes.menuSelected }}
                    key="placeholder"
                  >
                    <span>please select a reason that best matches your query.</span>
                  </MenuItem>
                  {reasonsList &&
                    reasonsList.options &&
                    reasonsList.options.map((reasonName: string) => {
                      return (
                        <MenuItem
                          value={reasonName}
                          classes={{ selected: classes.menuSelected }}
                          key={reasonName}
                        >
                          {reasonName}
                        </MenuItem>
                      );
                    })}
                </AphSelect>
              </div>
            </div>
            <div className={classes.formRow}>
              <label>any other comments (optional)?</label>
              <div className={classes.inputRoot}>
                <AphTextField
                  placeholder="Write your query here…"
                  value={comments}
                  onChange={(e) => {
                    setComments(e.target.value);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={classes.bottomActions}>
        <AphButton
          onClick={() => {
            setSelectedReason('placeholder');
            setSelectedCategoryName(defaultSelectedCategory);
            setComments('');
          }}
        >
          Reset
        </AphButton>
        <AphButton
          color="primary"
          disabled={disableSubmit || mutationLoading}
          className={classes.submitBtn}
          classes={{
            disabled: classes.submitDisable,
          }}
          onClick={() => {
            setMutationLoading(true);
            const apiVariables = {
              helpEmailInput: {
                category: selectedCategoryName,
                reason: selectedReason,
                comments: comments,
                patientId: currentPatient && currentPatient.id,
              },
            };
            helpSectionMutation({
              variables: {
                ...apiVariables,
              },
            })
              .then((response) => {
                const status =
                  response && response.data && response.data.sendHelpEmail
                    ? response.data.sendHelpEmail
                    : '';
                if (status === 'Success') {
                  closeHelpForm();
                  submitStatus(true);
                }
              })
              .catch(() => {
                setIsAlertOpen(true);
                setAlertMessage('An error occurred while processing your request');
              });
          }}
        >
          {mutationLoading ? <CircularProgress size={22} color="secondary" /> : 'Submit'}
        </AphButton>
      </div>
      <Alerts
        setAlertMessage={setAlertMessage}
        alertMessage={alertMessage}
        isAlertOpen={isAlertOpen}
        setIsAlertOpen={setIsAlertOpen}
      />
    </div>
  );
};
