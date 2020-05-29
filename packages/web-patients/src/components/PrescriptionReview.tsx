import React, { useRef } from 'react';
import { Theme, Typography, Link } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import Grid from '@material-ui/core/Grid';
import { Header } from './Header';
import { AphInput, AphButton } from '@aph/web-ui-components';
import Popover from '@material-ui/core/Popover';

const useStyles = makeStyles((theme: Theme) => {
  return {
    prContainer: {
      position: 'relative',
    },
    prContent: {
      background: '#f7f8f5',
      padding: '16px 20px 40px',
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    backArrow: {
      zIndex: 2,
      cursor: 'pointer',
      marginRight: 20,
      [theme.breakpoints.up(1220)]: {
        position: 'absolute',
        left: -82,
        width: 48,
        height: 48,
        top: 0,
        lineHeight: '36px',
        borderRadius: '50%',
        textAlign: 'center',
        backgroundColor: '#02475b',
      },
      '& img': {
        verticalAlign: 'bottom',
      },
    },
    whiteArrow: {
      verticalAlign: 'middle',
    },
    pageHeader: {
      padding: '0 0 10px',
      borderBottom: '1px solid rgba(2, 71, 91, 0.3)',
      margin: '0 0 20px',
      '& h6': {
        margin: 0,
        fontSize: 14,
        textTransform: 'uppercase',
        fontWeight: 'bold',
      },
    },
    reviewContainer: {},
    pContent: {
      position: 'relative',
    },
    consultDetails: {
      background: '#fcb716',
      borderRadius: 10,
      margin: '0 0 20px',
      boxShadow: '0 2px 5px 0 rgba(128, 128, 128, 0.3)',
    },
    cdContent: {
      display: 'flex',
      alignItems: 'center',
      padding: '20px 10px 0',
      overflow: 'hidden',
      position: 'relative',
      '& h4': {
        fontSize: 17,
        color: '#02475b',
        fontWeight: '600',
        textTransform: 'uppercase',
        padding: '0 0 5px 30px',
        borderBottom: '2px solid #fff',
        margin: '0',
        position: 'absolute',
        width: 290,
        top: -10,
        left: -40,
      },
      '& div': {
        position: 'relative',
        padding: '40px 0 0',
      },
      [theme.breakpoints.down('xs')]: {
        flexDirection: 'column',
        '& img': {
          order: 2,
        },
        '& div': {
          order: 1,
          padding: '0 0 20px',
        },
        '& h4': {
          position: 'static',
          width: 'auto',
          paddingLeft: 0,
          margin: '0 0 20px',
          textAlign: 'center',
        },
      },
    },
    whiteText: {
      color: '#ffffff !important',
    },
    prescriptionUpload: {},
    uploadContent: {
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      borderRadius: 10,
      overflow: 'hidden',
    },
    pList: {
      padding: '0 10px 0 0',
      margin: 0,
      listStyleType: 'none',
      textAlign: 'right',
      '& li': {
        fontSize: 12,
        color: '#02475b',
        padding: '0 0 10px',
        position: 'relative',
        '&:after': {
          content: "''",
          position: 'absolute',
          top: 7,
          right: -20,
          width: 10,
          height: 6,
          background: '#02475b',
        },
      },
    },
    disclaimer: {
      padding: 16,
      background: 'rgb(247, 248, 245, 0.5)',
      '& p': {
        fontSize: 12,
        color: '#02475b',
        lineHeight: '14px',
      },
    },
    validateContainer: {
      boxShadow: '0 -1px 4px 0 rgba(0, 0, 0, 0.2)',
      borderRadius: 10,
      overflow: 'hidden',
    },
    vHead: {
      padding: '15px 20px',
      background: '#f7f8f5',
      '& h4': {
        fontSize: 17,
        textTransform: 'uppercase',
        color: '#02475b',
        margin: 0,
        fontWeight: 'bold',
      },
      [theme.breakpoints.down('xs')]: {
        textAlign: 'center',
      },
    },
    vBody: {
      padding: '15px 20px',
      background: '#ffffff',
      '& >p': {
        fontSize: 12,
        textAlign: 'center',
        '& a': {
          fontWeight: 'bold',
          padding: '0 0 5px',
          borderBottom: '1px solid #02475b',
        },
      },
    },
    yellowText: {
      color: '#fcb716 !important',
    },
    steps: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      margin: '0 0 20px',
      [theme.breakpoints.down('xs')]: {
        display: 'block',
      },
    },
    stepDetails: {
      textAlign: 'center',
      width: '32%',
      '& img': {
        margin: '0 0 10px',
        height: 100,
      },
      '& p': {
        fontSize: 12,
        color: 'rgb(1, 71, 91,0.7)',
      },
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        margin: '0 0 20px',
      },
    },
    bold: {
      fontWeight: 'bold',
    },
    beforeUpload: {
      // display: 'none',
    },
    uploadArea: {
      textAlign: 'center',
      padding: '40px 40px 16px',
      background: '#fff',

      '& h5': {
        fontSize: 16,
        fontWeight: '600',
        margin: '0 0 14px',
      },
      '& p': {
        fontSize: 13,
      },
    },
    uploadFile: {
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      padding: '10px 20px',
      background: '#fff',
      color: '#fcb716',
      fontSize: 13,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      position: 'relative',
      width: 200,
      border: '1px solid #fcb716',
      textAlign: 'center',
      borderRadius: 5,
      margin: '0 auto 10px',
      '& input': {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        opacity: 0,
      },
    },
    instructions: {
      padding: 16,
      background: '#f7f8f5',
      '& h6': {
        fontSize: 14,
        color: '#02475b',
        lineHeight: '20px',
        fontWeight: '600',
      },
      '& p': {
        fontSize: 12,
        color: '#0087ba',
        lineHeight: '20px',
      },
    },
    box: {
      background: '#fff',
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      borderRadius: 5,
      padding: '15px 20px',
      margin: '16px 0',
    },
    emailId: {
      '& input': {
        fontSize: 14,
        '&:placeholder': {
          fontSize: 14,
          fontWeight: 'bold',
        },
      },
    },
    queryBox: {
      border: '1px solid #30c1a3',
      padding: '10px 20px !important',
      '& span': {
        color: 'rgba(2, 71, 91, 0.6)',
        fontSize: 12,
        fontWeight: '600',
      },
      '& input': {
        paddingTop: 6,
      },
    },
    queries: {
      border: 'none',
      '&:before': {
        border: 'none',
      },
      '&:after': {
        border: 'none',
      },
      '&:hover': {
        border: 'none',
        '&:before': {
          border: 'none !important',
        },
        '&:after': {
          border: 'none !important',
        },
      },
    },
    buttonContainer: {
      textAlign: 'right',
      padding: '30px 0 0',
      '& button': {
        width: 150,
        fontSize: 13,
      },
      [theme.breakpoints.down('xs')]: {
        textAlign: 'center',
      },
    },
    afterUpload: {
      padding: '20px 30px',
      background: '#fff',
      [theme.breakpoints.down('xs')]: {
        padding: 16,
      },
    },
    uploadHead: {
      padding: '0 0 5px',
      width: '70%',
      borderBottom: '1px solid rgb(2, 71, 91, 0.3)',
      '& h6': {
        fontSize: 14,
        fontWeight: '600',
      },
    },
    uploadList: {
      padding: 0,
      margin: '15px 0',
      listStyle: 'none',
      '& li': {
        padding: 10,
        borderRadius: 5,
        background: '#fff',
        boxShadow: '0 2px 6px 0 rgba(0, 0, 0, 0.2)',
        margin: '0 0 10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        '&:last-child': {
          margin: 0,
        },
      },
    },
    imageDetails: {
      display: 'flex',
      alignItems: 'center',
      '& >div': {
        margin: '0 16px',
      },
      '& h5': {
        margin: '0 0 10px 0',
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    uploadProgress: {
      width: 200,
      border: '1px solid #00b38e',
      display: 'block',
      [theme.breakpoints.down('xs')]: {
        width: 140,
      },
    },
    hrList: {
      padding: 0,
      margin: '15px 0',
      listStyle: 'none',
      '& li': {
        padding: 10,
        borderRadius: 5,
        background: '#fff',
        boxShadow: '0 2px 6px 0 rgba(0, 0, 0, 0.2)',
        margin: '0 0 10px',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        '&:last-child': {
          margin: 0,
        },
      },
    },
    uploadMore: {
      fontSize: 13,
      color: '#fc9916',
      textTransform: 'uppercase',
      fontWeight: 'bold',
      display: 'block',
      textAlign: 'right',
      padding: '10px 0 0',
      [theme.breakpoints.down('xs')]: {
        textAlign: 'center',
      },
    },
    recordDetails: {
      display: 'flex',
      alignItems: 'flex-start',
      '& h5': {
        fontSize: 16,
        fontWeight: 'bold',
      },
      '& p': {
        fontSize: 12,
        color: '#0087ba',
        fontWeight: '600',
      },
      '& img': {
        margin: '0 16px 0 0',
      },
    },
    details: {
      display: 'flex',
      alignItems: 'center',
      margin: '6px 0',
      borderBottom: '1px solid rgb(2, 71, 91, 0.3)',
      padding: '0 0 5px',
      '& p': {
        fontSize: 12,
        color: 'rgb(2, 71, 91, 0.6)',
        fontWeight: '600',
        padding: '0 10px',
        lineHeight: '12px',
        '&:first-child': {
          borderRight: '1px solid rgb(2, 71, 91, 0.3)',
          paddingLeft: 0,
        },
      },
    },
    bottomPopover: {
      overflow: 'initial',
      backgroundColor: 'transparent',
      boxShadow: 'none',
      bottom: '0 !important',
      top: 'auto !important',
      [theme.breakpoints.down('xs')]: {
        left: '0px !important',
        maxWidth: '100%',
        width: '100%',
        top: '38px !important',
      },
    },
    thankyouPopoverWindow: {
      display: 'flex',
      marginRight: 5,
      marginBottom: 5,
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
      },
    },
    windowWrap: {
      width: 368,
      borderRadius: 10,
      padding: 20,
      boxShadow: '0 5px 40px 0 rgba(0, 0, 0, 0.3)',
      backgroundColor: theme.palette.common.white,
    },
    mascotIcon: {
      position: 'absolute',
      right: 12,
      top: -40,
      '& img': {
        maxWidth: 80,
      },
    },
    pUploadSuccess: {
      '& h2': {
        fontSize: 36,
        lineHeight: '44px',
        fontWeight: 'bold',
      },
      '& p': {
        fontSize: 17,
        color: '#0087ba',
        lineHeight: '24px',
        margin: '20px 0',
        fontWeight: '600',
      },
      '& a': {
        fontSize: 13,
        fontWeight: '600',
        display: 'block',
        textAlign: 'right',
        textTransform: 'uppercase',
      },
    },
  };
});

export const PrescriptionReview: React.FC = (props) => {
  const classes = useStyles({});
  const mascotRef = useRef(null);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState<boolean>(false);
  const [uploadPrescription, setUploadPrescription] = React.useState<boolean>(false);
  return (
    <div className={classes.prContainer}>
      <Header />
      <div className={classes.container}>
        <div className={classes.prContent}>
          {/* <div className={classes.backArrow}>
            <img className={classes.whiteArrow} src={require('images/ic_back_white.svg')} />
          </div> */}
          <div className={classes.pageHeader}>
            <h6>Check Drug Interactions</h6>
          </div>
          <Grid container spacing={2} className={classes.reviewContainer}>
            <Grid item xs={12} sm={6}>
              <div className={classes.pContent}>
                <div className={classes.consultDetails}>
                  <div className={classes.cdContent}>
                    <img src={require('images/pharmacologist.png')} />
                    <div>
                      <h4>
                        Consult a <span className={classes.whiteText}>Pharmacologist</span>
                      </h4>
                      <ul className={classes.pList}>
                        <li>
                          If you are taking multiple medications, it’s important to understand the
                          potential impact that it can have on your health.
                        </li>
                        <li>
                          To know if your medications react with each other or with certain foods?
                        </li>
                        <li>To know how to store &amp; take your medications? </li>
                      </ul>
                    </div>
                  </div>
                  <div className={classes.disclaimer}>
                    <Typography>
                      <span className={classes.bold}>Diclaimer: </span>The information contained
                      herein should be used in conjunction with the advice of an appropriately
                      qualified and licensed doctor. Please check with your doctor if you have
                      health questions or concerns.
                    </Typography>
                  </div>
                </div>
                <div className={classes.validateContainer}>
                  <div className={classes.vHead}>
                    <h4>
                      Three Easy Steps{' '}
                      <span className={classes.yellowText}>
                        to Validate Prescription and Order Medicine
                      </span>
                    </h4>
                  </div>
                  <div className={classes.vBody}>
                    <div className={classes.steps}>
                      <div className={classes.stepDetails}>
                        <img src={require('images/upload.png')} />
                        <Typography>Share all of your prescriptions with us</Typography>
                      </div>
                      <div className={classes.stepDetails}>
                        <img src={require('images/get-in-touch.png')} />
                        <Typography>
                          Our expert pharmacologist will analyze these for potential medicine and
                          food interaction risks
                        </Typography>
                      </div>
                      <div className={classes.stepDetails}>
                        <img src={require('images/call.png')} />
                        <Typography>
                          Order your medicines here if no risks identified, else consult a doctor
                          for a review of the medicines
                        </Typography>
                      </div>
                    </div>
                    <Typography>
                      You can also send us the prescriptions by email on{' '}
                      <a href="mailto:pharmacologist@apollo.org" className={classes.bold}>
                        pharmacologist@apollo.org
                      </a>
                    </Typography>
                  </div>
                </div>
              </div>
            </Grid>
            <Grid item xs={12} sm={6}>
              <div className={classes.prescriptionUpload}>
                <div className={classes.uploadContent}>
                  {!uploadPrescription ? (
                    <div className={classes.beforeUpload}>
                      <div className={classes.uploadArea}>
                        <img src={require('images/cloud-upload.png')} />
                        <Typography component="h5">
                          Drag &amp; Drop your prescription here
                        </Typography>
                        <Typography component="h5">or</Typography>
                        <div
                          className={classes.uploadFile}
                          onClick={() => setUploadPrescription(true)}
                        >
                          Choose File
                          <input type="file" />
                        </div>
                        <Typography component="p">(Pdf,jpeg,jpg)</Typography>
                      </div>
                      <div className={classes.instructions}>
                        <Typography component="h6">
                          Instructions For Uploading Prescriptions
                        </Typography>
                        <Typography>
                          Upload a clear picture of your entire prescription. Doctor details and
                          date of the prescription should be clearly visible.
                        </Typography>
                      </div>
                    </div>
                  ) : (
                    <div className={classes.afterUpload}>
                      <div className={classes.uploadHead}>
                        <Typography component="h6">Physical Prescriptions</Typography>
                      </div>
                      <ul className={classes.uploadList}>
                        <li>
                          <div className={classes.imageDetails}>
                            <img src={require('images/physical-prescription.png')} />
                            <div>
                              <Typography component="h5">IMG_20190726</Typography>
                              <span className={classes.uploadProgress}></span>
                            </div>
                          </div>
                          <a href="javascript:void(0);">
                            <img src={require('images/ic_cross_onorange_small.svg')} width="20" />
                          </a>
                        </li>
                        <li>
                          <div className={classes.imageDetails}>
                            <img src={require('images/physical-prescription.png')} />
                            <div>
                              <Typography component="h5">IMG_20190726</Typography>
                              <span className={classes.uploadProgress}></span>
                            </div>
                          </div>
                          <a href="javascript:void(0);">
                            <img src={require('images/ic_cross_onorange_small.svg')} width="20" />
                          </a>
                        </li>
                      </ul>
                      <div className={classes.uploadHead}>
                        <Typography component="h6">Prescriptions From Health Records</Typography>
                      </div>
                      <ul className={classes.hrList}>
                        <li>
                          <div className={classes.recordDetails}>
                            <img src={require('images/rx.png')} />
                            <div>
                              <Typography component="h5">Dr. Simran Rai</Typography>
                              <div className={classes.details}>
                                <Typography>27 June 2019</Typography>
                                <Typography>Preeti</Typography>
                              </div>
                              <Typography>Cytoplam, Metformin, Insulin, Crocin</Typography>
                            </div>
                          </div>
                          <a href="javascript:void(0);">
                            <img src={require('images/ic_cross_onorange_small.svg')} width="20" />
                          </a>
                        </li>
                      </ul>
                      <a href="javascript:void(0)" className={classes.uploadMore}>
                        Upload More Prescriptions
                      </a>
                    </div>
                  )}
                </div>
                <div className={classes.box}>
                  <AphInput
                    className={classes.emailId}
                    value=""
                    placeholder="Enter email ID here"
                  />
                </div>
                <div className={` ${classes.box} ${classes.queryBox}`}>
                  <span>Queries(if any)</span>
                  <AphInput className={classes.queries} value="" placeholder="Type here.." />
                </div>
                <div className={classes.buttonContainer}>
                  <AphButton color="primary" onClick={() => setIsPopoverOpen(true)}>
                    Submit
                  </AphButton>
                </div>
              </div>
            </Grid>
          </Grid>
        </div>
      </div>
      <Popover
        open={isPopoverOpen}
        anchorEl={mascotRef.current}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        classes={{ paper: classes.bottomPopover }}
      >
        <div className={classes.thankyouPopoverWindow}>
          <div className={classes.windowWrap}>
            <div className={classes.mascotIcon}>
              <img src={require('images/ic-mascot.png')} alt="" />
            </div>
            <div className={classes.pUploadSuccess}>
              <Typography component="h2">Thankyou :)</Typography>
              <Typography>Your prescriptions have been submitted successfully.</Typography>
              <Typography>Our pharmacologist will reply to your email within 24 hours.</Typography>
              <Link href="javascript:void(0);" onClick={() => setIsPopoverOpen(false)}>
                Ok, Got It
              </Link>
            </div>
          </div>
        </div>
      </Popover>
    </div>
  );
};
