import React, { useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Grid, CircularProgress, Typography, Link } from '@material-ui/core';
import { AphButton, AphInput } from '@aph/web-ui-components';
import { getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails as OrderDetails } from 'graphql/types/getMedicineOrderOMSDetailsWithAddress';
import { ADD_PATIENT_FEEDBACK } from 'graphql/medicines';
import { useMutation } from 'react-apollo-hooks';
import { addPatientFeedback, addPatientFeedbackVariables } from 'graphql/types/addPatientFeedback';
import { FEEDBACKTYPE } from 'graphql/types/globalTypes';
import { Alerts } from 'components/Alerts/Alerts';

const useStyles = makeStyles((theme: Theme) => {
  return {
    deliveryDetails: {
      background: '#f7f8f5',
      padding: 10,
      display: 'flex',
      alignItems: 'center',
      margin: '20px 0',
      borderRadius: 10,
      '& h4': {
        color: '#01475b !important',
      },
      '& p': {
        fontWeight: 'bold',
        fontSize: 12,
      },
    },
    iconContainer: {
      width: 40,
      height: 40,
      background: '#fff',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 20px 0 0',
    },
    feedbackList: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '20px 0',
      listStyle: 'none',
      padding: 0,
      '& li': {
        fontSize: 12,
        textTransform: 'uppercase',
        fontWeight: 'bold',
        textAlign: 'center',
        '&:first-child': {
          '& img': {
            background: '',
          },
        },
      },
    },
    suggestion: {
      margin: '20px 0 0',
      padding: '20px 0 0',
      borderTop: '1px solid rgba(2, 71, 91, .2)',
      '& h4': {
        fontSize: 14,
        fontWeight: 'bold',
      },
      '& button': {
        display: 'block',
        color: '#fff',
        fontSize: 14,
        textTransform: 'uppercase',
        padding: 10,
        borderRadius: 10,
        boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
        width: 160,
        margin: '0px auto',
        fontWeight: 'bold',
        '&:hover': {
          color: '#fff',
        },
      },
    },
    textInput: {
      margin: '10px 0 30px',
      width: '100%',
    },
    thankyou: {
      '& h3': {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#02475b',
        margin: '0 0 10px',
      },
      '& h4': {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#0087ba',
        margin: '0 0 20px',
      },
      '& a': {
        fontSize: 13,
        textTransform: 'uppercase',
        fontFamily: 'IBM Plex sans',
        fontWeight: 'bold',
        textAlign: 'right',
        display: 'block',
        color: '#fc9916',
        '&:hover': {
          textDecoration: 'none',
        },
      },
    },
    expActive: {
      background: '#000',
    },
    flex: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
  };
});

interface userExperience {
  imgUrl: string;
  label: string;
  activeimage: string;
}

interface Images {
  Poor: string;
  Okay: string;
  Good: string;
  Great: string;
}

const activeImages: Images = {
  Poor: 'ic-poor-active.png',
  Okay: 'ic-okay-active.png',
  Good: 'ic-good-active.png',
  Great: 'ic-great-active.png',
};

const defaultImages: Images = {
  Poor: 'ic-poor.png',
  Okay: 'ic-okay.png',
  Good: 'ic-good.png',
  Great: 'ic-great.png',
};
type Props = {
  children?: React.ReactNode;
  setIsPopoverOpen: (active: boolean) => void;
  orderDetailsData: OrderDetails | null;
  setShowDeliveryRateBtn: (showDeliveryRateBtn: boolean) => void;
};

export const OrderFeedback: React.FC<Props> = (props) => {
  const classes = useStyles({});
  const {
    setIsPopoverOpen,
    setShowDeliveryRateBtn,
    orderDetailsData: {
      orderAutoId,
      orderTat,
      id: orderId,
      patient: { id },
    },
  } = props;
  const [feedbackSubmitted, setFeedbackSubmitted] = React.useState<boolean>(false);
  const [selected, setSelected] = React.useState<number | null>(null);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [rating, setRating] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const userExperiences: Array<userExperience> = [
    { imgUrl: defaultImages.Poor, activeimage: activeImages.Poor, label: 'Poor' },
    { imgUrl: defaultImages.Okay, activeimage: activeImages.Okay, label: 'Okay' },
    { imgUrl: defaultImages.Good, activeimage: activeImages.Good, label: 'Good' },
    {
      imgUrl: defaultImages.Great,
      activeimage: activeImages.Great,
      label: 'Great',
    },
  ];

  const addPatientFeedbackMutation = useMutation<addPatientFeedback, addPatientFeedbackVariables>(
    ADD_PATIENT_FEEDBACK,
    {
      variables: {
        patientFeedbackInput: {
          patientId: id,
          rating: rating,
          thankyouNote: reason,
          reason: reason,
          feedbackType: FEEDBACKTYPE.PHARMACY,
          transactionId: orderId,
        },
      },
    }
  );

  return (
    <div>
      {!feedbackSubmitted ? (
        <div className="feedbackContent">
          <Typography component="h3">We Value Your Feedback! :) </Typography>
          <Typography component="h4">
            How was your overall experience with the following medicine delivery —
          </Typography>
          <div className={classes.deliveryDetails}>
            <div className={classes.iconContainer}>
              <img src={require('images/ic_tablets.svg')} />
            </div>
            <div>
              <Typography component="h4">Medicines — #{orderAutoId} </Typography>
              <Typography component="p">Delivered On: {orderTat}</Typography>
            </div>
          </div>
          <ul className={classes.feedbackList}>
            {userExperiences.map((exp: userExperience, index: number) => {
              return (
                <li
                  onClick={() => {
                    setSelected(index);
                    setRating(exp.label);
                  }}
                >
                  <img
                    src={
                      index === selected
                        ? require(`images/${exp.activeimage}`)
                        : require(`images/${exp.imgUrl}`)
                    }
                  />{' '}
                  {exp.label}
                </li>
              );
            })}
          </ul>
          {typeof selected === 'number' && (
            <div className={classes.suggestion}>
              <Typography component="h4">What can be improved?</Typography>
              <AphInput
                placeholder={'Write your suggestion here..'}
                className={classes.textInput}
                onChange={(e) => setReason(e.target.value)}
              />
              <AphButton
                color="primary"
                onClick={() => {
                  addPatientFeedbackMutation()
                    .then(() => {
                      setFeedbackSubmitted(true);
                    })
                    .catch(() => {
                      setIsPopoverOpen(false);
                      setIsAlertOpen(true);
                      setAlertMessage(`Error occured while submitting feedback`);
                    });
                }}
              >
                Submit Feedback
              </AphButton>
            </div>
          )}
        </div>
      ) : (
        <div className={classes.thankyou}>
          <Typography component="h3">Thanks :) </Typography>
          <Typography component="h4">
            Your feedback has been submitted. Thanks for your time.
          </Typography>
          <div className={classes.flex}>
            <Link
              href="javascript:void(0);"
              onClick={() => {
                setIsPopoverOpen(false);
                setShowDeliveryRateBtn(false);
              }}
            >
              Ok, Got It
            </Link>
          </div>
        </div>
      )}
      <Alerts
        setAlertMessage={setAlertMessage}
        alertMessage={alertMessage}
        isAlertOpen={isAlertOpen}
        setIsAlertOpen={setIsAlertOpen}
      />
    </div>
  );
};
