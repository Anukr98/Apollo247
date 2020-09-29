import React from 'react';
import { Theme, Typography, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { AphButton, AphDialog, AphInput } from '@aph/web-ui-components';
import WarningModel from 'components/WarningModel';
import { useApolloClient } from 'react-apollo-hooks';
import { clientRoutes } from 'helpers/clientRoutes';
import { useHistory } from 'react-router-dom';
import {
  GetAllUserSubscriptionsWithPlanBenefits,
  GetAllUserSubscriptionsWithPlanBenefitsVariables,
} from 'graphql/types/GetAllUserSubscriptionsWithPlanBenefits';
import {
  initiateCallForPartner,
  initiateCallForPartnerVariables,
} from 'graphql/types/initiateCallForPartner';
import {
  GET_ALL_USER_SUBSCRIPTIONS_WITH_BENEFITS,
  INITIATE_CALL_FOR_PARTNER,
} from 'graphql/profiles';
import Slider from 'react-slick';
import { HDFCHomePageCarouselClicked } from 'webEngageTracking';

const useStyles = makeStyles((theme: Theme) => {
  return {
    card: {
      boxShadow: ' 0px 5px 20px rgba(128, 128, 128, 0.3)',
      borderRadius: 10,
      height: 172,
      margin: '30px 0 0 auto',
      [theme.breakpoints.down('sm')]: {
        height: 155,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        boxShadow: 'none',
      },
    },
    slide1: {
      background: `#fff url(${require('images/hdfc/banners/slide1.png')}) no-repeat 0 0`,
      [theme.breakpoints.down('sm')]: {
        background: `url(${require('images/hdfc/banners/mweb_slide1.png')}) no-repeat 0 0`,
      },
    },
    slide2: {
      background: `#fff url(${require('images/hdfc/banners/slide2.png')}) no-repeat 0 0`,
      [theme.breakpoints.down('sm')]: {
        background: `url(${require('images/hdfc/banners/mweb_slide2.png')}) no-repeat 0 0`,
      },
    },
    slide3: {
      background: `#fff url(${require('images/hdfc/banners/slide3.png')}) no-repeat 0 0`,
      [theme.breakpoints.down('sm')]: {
        background: `url(${require('images/hdfc/banners/mweb_slide3.png')}) no-repeat 0 0`,
      },
    },
    slide4: {
      background: `#fff url(${require('images/hdfc/banners/slide4.png')}) no-repeat 0 0`,
      [theme.breakpoints.down('sm')]: {
        background: `url(${require('images/hdfc/banners/mweb_slide4.png')}) no-repeat 0 0`,
      },
    },
    connectDoctorContent: {
      display: 'flex',
      alignItems: 'flex-start',
      flexWrap: 'wrap',
    },
    cdDetails: {
      width: '50%',
      padding: 12,
      '& img': {
        margin: '0 auto 10px',
      },
      '& h5': {
        fontSize: 12,
        color: '#00B38E',
        linHeight: '16px',
        '& span': {
          fontWeight: 700,
        },
      },
    },
    dialogContent: {},
    dialogHeader: {
      padding: '16px 16px 10px',
      '& h3': {
        fontSize: 16,
        fontWeight: 600,
        lineHeight: '21px',
      },
      '& p': {
        fontSize: 10,
        lineHeight: '13px',
      },
    },
    btnContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '10px 16px 16px',
      '& button': {
        margin: '0 0 0 10px',
        '&:first-child': {
          boxShadow: 'none',
          color: '#FC9916',
        },
      },
    },
    p0: {
      padding: 0,
    },
    callNote: {
      fontSize: 12,
      linrHeight: '16px',
      '& span': {
        display: 'block',
      },
    },
    slider: {
      '& >.slick-list': {
        overflow: 'visible',
        '& .slick-track': {
          display: 'flex',
        },
        '& .slick-slide': {
          width: '100%',
          margin: 25,
          [theme.breakpoints.down('sm')]: {
            margin: 10,
          },
        },
      },
      '& >.slick-dots': {
        position: 'static !important',
        '& li': {
          margin: 0,
          '& button': {
            '&:before': {
              fontSize: 10,
              color: 'rgba(0,0,0,0.4)',
            },
          },
          '&.slick-active': {
            '& button': {
              '&:before': {
                fontSize: 18,
                color: '#007C9D',
              },
            },
          },
        },
      },
    },
  };
});

export interface HdfcSliderProps {
  patientPhone: string | null;
}

export const HdfcSlider: React.FC<HdfcSliderProps> = (props) => {
  const classes = useStyles({});
  const [callDoctorPopup, setCallDoctorPopup] = React.useState<boolean>(false);
  const { allCurrentPatients, currentPatient } = useAllCurrentPatients();
  const [showIntro, setShowIntro] = React.useState<boolean>(true);
  const [successMessage, setSuccessMessage] = React.useState<object>();
  const [exotelBenefitId, setExotelBenefitId] = React.useState<string>('');
  const apolloClient = useApolloClient();
  const history = useHistory();

  const sliderSettings = {
    infinite: true,
    dots: true,
    arrows: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoPlaySpeed: 5000,
    autoplay: true,
  };

  const handleDoctorCall = () => {
    apolloClient
      .query<
        GetAllUserSubscriptionsWithPlanBenefits,
        GetAllUserSubscriptionsWithPlanBenefitsVariables
      >({
        query: GET_ALL_USER_SUBSCRIPTIONS_WITH_BENEFITS,
        variables: {
          mobile_number: localStorage.getItem('userMobileNo'),
        },
        fetchPolicy: 'no-cache',
      })
      .then((response) => {
        let benefits = response.data.GetAllUserSubscriptionsWithPlanBenefits.response[0].benefits;
        benefits.map((item: any) => {
          if (item.cta_action.type == 'CALL_API') {
            if (item.attribute_type.remaining > 0) {
              setExotelBenefitId(item._id);
              setCallDoctorPopup(true);
            } else {
              setSuccessMessage({
                message: `Hey, looks like you have exhausted the monthly usage limit for this benefit. If you feel this is an error, please raise a ticket on the Help section.`,
              });
            }
          }
        });
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const initiateExotelCall = (mobileNumber: string, benefitId: string) => {
    apolloClient
      .query<initiateCallForPartner, initiateCallForPartnerVariables>({
        query: INITIATE_CALL_FOR_PARTNER,
        variables: {
          mobileNumber: mobileNumber,
          benefitId: benefitId,
        },
        fetchPolicy: 'no-cache',
      })
      .then((response) => {
        response.data.initiateCallForPartner.success
          ? setSuccessMessage({ message: `You'll be connected to the Doctor in a while` })
          : setSuccessMessage({
              message: `Error while connecting to the Doctor, Please try again`,
            });
        setCallDoctorPopup(false);
      })
      .catch((error) => {
        console.log(error);
        setCallDoctorPopup(false);
        setSuccessMessage({ message: `Error while connecting to the Doctor, Please try again` });
      });
  };

  const userSubscriptions = JSON.parse(localStorage.getItem('userSubscriptions'));

  /*****WebEngage*******/
  const data = {
    mobileNumber: currentPatient && currentPatient.mobileNumber,
    DOB: currentPatient && currentPatient.dateOfBirth,
    emailId: currentPatient && currentPatient.emailAddress,
    PartnerId: currentPatient && currentPatient.partnerId,
    planName:
      userSubscriptions &&
      userSubscriptions[0] &&
      userSubscriptions[0].group_plan &&
      userSubscriptions[0].group_plan.name,
    planStatus: userSubscriptions && userSubscriptions[0] && userSubscriptions[0].status,
  };
  /*****WebEngage*******/

  return (
    <>
      <Slider {...sliderSettings} className={classes.slider}>
        <div
          className={`${classes.card} ${classes.slide1}`}
          onClick={() => {
            HDFCHomePageCarouselClicked(data);
            handleDoctorCall();
          }}
        ></div>
        <div
          className={`${classes.card} ${classes.slide2}`}
          onClick={() => {
            HDFCHomePageCarouselClicked(data);
            history.push(clientRoutes.membershipPlanDetail());
          }}
        ></div>
        <div
          className={`${classes.card} ${classes.slide3}`}
          onClick={() => {
            HDFCHomePageCarouselClicked(data);
            history.push(clientRoutes.medicines());
          }}
        ></div>
        <div
          className={`${classes.card} ${classes.slide4}`}
          onClick={() => {
            HDFCHomePageCarouselClicked(data);
            history.push(clientRoutes.membershipPlanDetail());
          }}
        ></div>
      </Slider>

      <AphDialog open={callDoctorPopup} maxWidth="sm">
        <div className={classes.dialogContent}>
          <div className={classes.dialogHeader}>
            <Typography component="h3">Connect to the Doctor </Typography>
            <Typography>Please follow the steps to connect to Doctor </Typography>
          </div>
          <div className={classes.connectDoctorContent}>
            <div className={classes.cdDetails}>
              <img src={require('images/hdfc/call-incoming.svg')} alt="" />
              <Typography component="h5">
                Answer the call from <span>‘040-482-17258’</span> to connect.
              </Typography>
            </div>
            <div className={classes.cdDetails}>
              <img src={require('images/hdfc/call-outgoing.svg')} alt="" />
              <Typography component="h5">The same call will connect to the Doctor.</Typography>
            </div>
            <div className={classes.cdDetails}>
              <img src={require('images/hdfc/group.svg')} alt="" />
              <Typography component="h5">Wait for the Doctor to connect over the call.</Typography>
            </div>
            <div className={classes.cdDetails}>
              <Typography className={classes.callNote}>
                <span>*Note : </span>Your personal phone number will not be shared.
              </Typography>
            </div>
          </div>
          <div className={classes.btnContainer}>
            <AphButton onClick={() => setCallDoctorPopup(false)}>Cancel</AphButton>
            <AphButton
              color="primary"
              onClick={() => {
                initiateExotelCall(localStorage.getItem('userMobileNo'), exotelBenefitId);
              }}
            >
              Proceed To Connect
            </AphButton>
          </div>
        </div>
      </AphDialog>
      <WarningModel
        error={successMessage}
        onClose={() => {
          setSuccessMessage(null);
        }}
      />
    </>
  );
};
