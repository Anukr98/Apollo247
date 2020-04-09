import React, { Fragment, useContext, useEffect, useState } from 'react';
import {
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  createMuiTheme,
  Grid,
  IconButton,
  Card,
  CardContent,
  Modal,
} from '@material-ui/core';
import { DOWNLOAD_DOCUMENTS } from 'graphql/profiles';
import { useApolloClient, useQuery } from 'react-apollo-hooks';
import { downloadDocuments } from 'graphql/types/downloadDocuments';
import { Link } from 'react-router-dom';
import { makeStyles, ThemeProvider } from '@material-ui/styles';
import { format } from 'date-fns';
import { CaseSheetContext } from 'context/CaseSheetContext';
import { GetCaseSheet_getCaseSheet_pastAppointments } from 'graphql/types/GetCaseSheet';
import ReactPanZoom from 'react-image-pan-zoom-rotate';
import { GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_appointment_appointmentDocuments as appointmentDocumentType } from 'graphql/types/GetJuniorDoctorCaseSheet';

const useStyles = makeStyles(() => ({
  vaultContainer: {
    width: '100%',
    '& h5': {
      fontSize: 14,
      fontWeight: 500,
      color: 'rgba(2,71,91,0.6)',
      padding: 0,
      marginTop: 15,
    },
    '& h4': {
      fontSize: 14,
      fontWeight: 600,
      color: '#0087ba',
      padding: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      width: '90%',
    },
    '& h6': {
      fontSize: 10,
      fontWeight: 500,
      color: 'rgba(2,71,91,0.6)',
      marginTop: 6,
    },
  },
  modalWindowWrap: {
    display: 'table',
    height: '100%',
    width: '100%',
    outline: 'none',
    '&:focus': {
      outline: 'none',
    },
  },
  modalWindow: {
    backgroundColor: theme.palette.common.black,
    maxWidth: 900,
    margin: 'auto',
    borderRadius: 10,
    boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.2)',
    outline: 'none',
    '&:focus': {
      outline: 'none',
    },
  },
  tableContent: {
    display: 'table-cell',
    verticalAlign: 'middle',
    width: '100%',
    '&:focus': {
      outline: 'none',
    },
  },
  modalContent: {
    textAlign: 'center',
    maxHeight: 'calc(100vh - 212px)',
    overflow: 'hidden',
    position: 'relative',
    '& img': {
      maxWidth: '100%',
      maxHeight: 'calc(100vh - 212px)',
    },
  },
  modalHeader: {
    minHeight: 56,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: 0.5,
    color: theme.palette.common.white,
    padding: '16px 50px',
    textTransform: 'uppercase',
    position: 'relative',
    wordBreak: 'break-word',
  },
  modalClose: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 24,
    height: 24,
    cursor: 'pointer',
  },
  modalFooter: {
    height: 56,
    textAlign: 'center',
    padding: 16,
    textTransform: 'uppercase',
  },
  bigAvatar: {
    width: '60px',
    height: '60px',
    borderRadius: '5px',
    marginRight: '10px',
  },
  listContainer: {
    flowWrap: 'wrap',
    width: '100%',
  },
  listItem: {
    width: '49%',
    marginRight: '1%',
    padding: 0,
    display: 'inline-flex',
    overflow: 'hidden',
    marginBottom: 15,
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    marginright: 20,
  },
  stepperHeading: {
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: 'normal',
    color: '#0087ba !important',
    position: 'relative',
    top: -5,
  },
  videoIcon: {
    position: 'absolute',
    top: 7,
    right: 15,
    '& img': {
      width: 20,
    },
  },
  circleDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#02475b',
    position: 'absolute',
    left: -5,
  },
  listStyle: {
    display: 'flex',
    flexFlow: 'column',
    alignItems: 'start',
    width: '100%',
    borderLeft: '1px solid #02475b',
    padding: 0,
  },
  childListStyle: {
    display: 'flex',
    flexFlow: 'column',
    alignItems: 'start',
    width: '100%',
    borderLeft: 'none',
    paddingLeft: 0,
  },
  nodataFound: {
    fontSize: 14,
  },
  body2: {
    fontSize: '10px',
    fontWeight: 500,
    lineHeight: 1.2,
    color: 'rgba(2, 71, 91, 0.6)',
  },
}));

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#0087ba',
    },
  },
  typography: {
    fontFamily: ['IBM Plex Sans', 'sans-serif'].join(','),
    body2: {
      fontSize: '10px',
      fontWeight: 500,
      lineHeight: 1.2,
      color: 'rgba(2, 71, 91, 0.6)',
    },

    h5: {
      fontSize: '14px',
    },
  },
});

interface PastAppointmentProps {
  data: GetCaseSheet_getCaseSheet_pastAppointments[] | null;
  isChild: boolean;
}

const PastAppointment: React.FC<PastAppointmentProps> = ({ data, isChild }) => {
  const classes = useStyles();
  const ischild: boolean = true;
  return (
    <List className={isChild ? classes.childListStyle : classes.listStyle}>
      {data &&
        data.map((item, idx) => (
          <ListItem
            key={idx}
            style={{
              display: 'flex',
              flexFlow: 'column',
              paddingRight: 0,
              paddingLeft: 0,
              alignItems: 'start',
            }}
          >
            <AppointmentCard data={item} />
          </ListItem>
        ))}
    </List>
  );
};

interface AppointmentCardProps {
  data: GetCaseSheet_getCaseSheet_pastAppointments;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ data }) => {
  const classes = useStyles();
  return (
    <Card style={{ width: '100%', height: 45 }}>
      <CardContent>
        <Link to={`/consulttabs/${data.id}/${data.patientId}/0`} target="_blank">
          <Grid item xs={12} style={{ width: '100%' }}>
            <Grid item container spacing={2}>
              <Grid item lg={5} sm={5} xs={4} key={1} container>
                <Grid lg={12} sm={12} xs={12} key={6} item>
                  <div className={classes.body2}>
                    <div>
                      <div className={classes.circleDot}></div>
                      {`${format(
                        new Date(data.appointmentDateTime),
                        'dd  MMMMMMMMMMMM yyyy, h:mm a'
                      )}`}
                    </div>
                  </div>
                </Grid>
              </Grid>
              {data &&
                data.caseSheet &&
                data.caseSheet.length > 1 &&
                data.caseSheet[1]!.doctorType !== 'JUNIOR'
                ? data &&
                data.caseSheet &&
                data.caseSheet.length > 0 &&
                !!data.caseSheet[1]!.symptoms &&
                !!data.caseSheet[1]!.symptoms.length && (
                  <Grid lg={6} sm={6} xs={5} key={2} item>
                    <div className={classes.stepperHeading}>
                      {(data.caseSheet[1]!.symptoms.length > 3
                        ? data.caseSheet[1]!.symptoms.slice(0, 2).map((data) => data!.symptom)
                        : data.caseSheet[1]!.symptoms.map((data) => data!.symptom)
                      ).join(', ')}
                      {data.caseSheet[1]!.symptoms!.length > 3 && (
                        <Typography gutterBottom variant="body1" component="span">
                          {`, +${data.caseSheet[1]!.symptoms.length - 2}`}
                        </Typography>
                      )}
                    </div>
                  </Grid>
                )
                : data &&
                data.caseSheet &&
                data.caseSheet.length > 0 &&
                !!data.caseSheet[0]!.symptoms &&
                !!data.caseSheet[0]!.symptoms.length && (
                  <Grid lg={6} sm={6} xs={5} key={2} item>
                    <div className={classes.stepperHeading}>
                      {(data.caseSheet[0]!.symptoms.length > 3
                        ? data.caseSheet[0]!.symptoms.slice(0, 2).map((data) => data!.symptom)
                        : data.caseSheet[0]!.symptoms.map((data) => data!.symptom)
                      ).join(', ')}
                      {data.caseSheet[0]!.symptoms!.length > 3 && (
                        <Typography gutterBottom variant="body1" component="span">
                          {`, +${data.caseSheet[0]!.symptoms.length - 2}`}
                        </Typography>
                      )}
                    </div>
                  </Grid>
                )}
              {data &&
                data.caseSheet &&
                data.caseSheet.length > 1 &&
                data.caseSheet[1] &&
                data.caseSheet[1]!.doctorType !== 'JUNIOR' ? (
                  <Grid lg={1} sm={1} xs={3} key={3} item>
                    <div>
                      <IconButton aria-label="Video call" className={classes.videoIcon}>
                        {data &&
                          data.caseSheet &&
                          data.caseSheet.length > 1 &&
                          data.caseSheet[1]!.consultType === 'ONLINE' ? (
                            <img src={require('images/ic_video.svg')} alt="" />
                          ) : (
                            <img src={require('images/ic_physical_consult_icon.svg')} alt="" />
                          )}
                      </IconButton>
                    </div>
                  </Grid>
                ) : (
                  <Grid lg={1} sm={1} xs={3} key={3} item>
                    <div>
                      <IconButton aria-label="Video call" className={classes.videoIcon}>
                        {data &&
                          data.caseSheet &&
                          data.caseSheet.length > 0 &&
                          data.caseSheet[0] &&
                          data.caseSheet[0]!.consultType === 'ONLINE' ? (
                            <img src={require('images/ic_video.svg')} alt="" />
                          ) : (
                            <img src={require('images/ic_physical_consult_icon.svg')} alt="" />
                          )}
                      </IconButton>
                    </div>
                  </Grid>
                )}
            </Grid>
          </Grid>
        </Link>
      </CardContent>
    </Card>
  );
};
export const HealthVault: React.FC = () => {
  const classes = useStyles();
  const ischild: boolean = false;
  const { healthVault, appointmentDocuments, pastAppointments, patientDetails } = useContext(
    CaseSheetContext
  );
  const client = useApolloClient();
  var prismIdList: any = [];
  const [prismImageList, setPrismImageList] = useState<any>([]);

  const [modalOpen, setModalOpen] = React.useState(false);
  const [imgPrevUrl, setImgPrevUrl] = React.useState();
  const { documentArray, setDocumentArray } = useContext(CaseSheetContext);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    if (documentArray && documentArray.documentPath) {
      const data = {
        documentPath: documentArray.documentPath,
        prismFileId: documentArray.prismFileId,
      };
      appointmentDocuments && appointmentDocuments.push(data as appointmentDocumentType);
      setDocumentArray((null as unknown) as appointmentDocumentType);
    }
  });
  const downloadDocumentsInputVariable = {
    fileIds: prismIdList,
    patientId: patientDetails && patientDetails.id,
  };
  useEffect(() => {
    if (downloadDocumentsInputVariable.patientId) {
      client
        .query<downloadDocuments>({
          query: DOWNLOAD_DOCUMENTS,
          variables: { downloadDocumentsInput: downloadDocumentsInputVariable },
          fetchPolicy: 'no-cache',
        })
        .then(({ data }) => {
          setPrismImageList(data.downloadDocuments.downloadPaths);
          setLoading(false);
        });
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Typography component="div" className={classes.vaultContainer}>
        <Typography component="div">
          <Typography component="h5" variant="h5">
            Photos uploaded
          </Typography>
          <List className={classes.listContainer}>
            {appointmentDocuments && appointmentDocuments.length > 0 ? (
              appointmentDocuments.map((item, index) => (
                <ListItem
                  key={index}
                  className={classes.listItem}
                  onClick={() => {
                    if (
                      item &&
                      item.documentPath &&
                      item.documentPath.substr(-4).toLowerCase() !== '.pdf'
                    ) {
                      setModalOpen(true);
                      setImgPrevUrl(item.documentPath as string);
                    }
                  }}
                >
                  <ListItemAvatar>
                    {item &&
                      item.documentPath &&
                      item.documentPath.substr(-4).toLowerCase() !== '.pdf' ? (
                        <Avatar
                          alt={item.documentPath as string}
                          src={item.documentPath as string}
                          className={classes.bigAvatar}
                        />
                      ) : (
                        <a href={item.documentPath as string} target="_blank">
                          <Avatar
                            alt={item.documentPath as string}
                            src={require('images/pdf_thumbnail.png')}
                            className={classes.bigAvatar}
                          />
                        </a>
                      )}
                  </ListItemAvatar>
                  <div hidden>
                    {prismIdList && prismIdList.push(item && item.prismFileId && item.prismFileId)}{' '}
                  </div>
                  <ListItemText
                    primary={
                      <Fragment>
                        <Typography component="h4" variant="h4" color="primary">
                          {item.documentPath!.substr(item.documentPath!.lastIndexOf('/') + 1)}
                        </Typography>
                      </Fragment>
                    }
                    secondary={
                      <Fragment>
                        <Typography component="h6" variant="h6"></Typography>
                      </Fragment>
                    }
                  />
                </ListItem>
              ))
            ) : (
                <span className={classes.nodataFound}>
                  {`${!loading && prismImageList && prismImageList.length === 0 && 'No data Found'}`}{' '}
                </span>
              )}
            {!loading &&
              prismImageList &&
              prismImageList.length > 0 &&
              prismImageList.map((item: any, index: any) => (
                <ListItem
                  key={index}
                  className={classes.listItem}
                  onClick={() => {
                    setModalOpen(true);
                    setImgPrevUrl(item as string);
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      alt={item as string}
                      src={item as string}
                      className={classes.bigAvatar}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Fragment>
                        <Typography component="h4" variant="h4" color="primary">
                          {item.substr(item.lastIndexOf('=') + 1)}
                        </Typography>
                      </Fragment>
                    }
                    secondary={
                      <Fragment>
                        <Typography component="h6" variant="h6"></Typography>
                      </Fragment>
                    }
                  />
                </ListItem>
              ))}
            {
              <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                <div className={classes.modalWindowWrap}>
                  <div className={classes.tableContent}>
                    <div className={classes.modalWindow}>
                      <div className={classes.modalHeader}>
                        <div className={classes.modalClose} onClick={() => setModalOpen(false)}>
                          <img src={require('images/ic_round_clear.svg')} alt="" />
                        </div>
                      </div>
                      <div className={classes.modalContent}>
                        <ReactPanZoom image={imgPrevUrl} alt="" />
                      </div>
                      <div className={classes.modalFooter}></div>
                    </div>
                  </div>
                </div>
              </Modal>
            }
          </List>
        </Typography>
        <Typography component="div">
          {/* <Typography component="h5" variant="h5">
            Reports
          </Typography>
          <span className={classes.nodataFound}>No Data Found</span> */}
          {/* <List className={classes.listContainer}>
            {appointmentDocuments && appointmentDocuments.length > 0 ? (
              appointmentDocuments!.map((item, index) => (
                <ListItem key={index} className={classes.listItem}>
                  <ListItemAvatar>
                    <Link to={(item.reportUrls as unknown) as string} target="_blank">
                      <Avatar
                        alt={(item.reportUrls as unknown) as string}
                        src={(item.reportUrls as unknown) as string}
                        className={classes.bigAvatar}
                      />
                    </Link>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Fragment>
                        <Typography component="h4" variant="h4" color="primary">
                          {item.reportUrls!.substr(item.reportUrls!.lastIndexOf('/') + 1)}
                        </Typography>
                      </Fragment>
                    }
                    // secondary={
                    //   <Fragment>
                    //     <Typography component="h6" variant="h6">
                    //       {'5mb'} | {'2019-01-01T11:30'}
                    //     </Typography>
                    //   </Fragment>
                    // }
                  />
                </ListItem>
              ))
            ) : (
              <span className={classes.nodataFound}>No data Found</span>
            )}
          </List> */}
        </Typography>
        <Typography component="div">
          <Typography component="h5" variant="h5">
            Past Consultations
          </Typography>
          <PastAppointment data={pastAppointments} isChild={ischild} />
        </Typography>
      </Typography>
    </ThemeProvider>
  );
};
