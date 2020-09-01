import React, { useState, useEffect } from 'react';
import Rating from '@material-ui/lab/Rating';
import TextField from '@material-ui/core/TextField';
import {
  Theme,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText,
  AppBar,
  Tabs,
  Tab,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import VolumeUpIcon from '@material-ui/icons/VolumeUp';
import VideocamIcon from '@material-ui/icons/Videocam';
import Typography from '@material-ui/core/Typography';
import { AphButton } from '@aph/web-ui-components';
import { MultiSelectComponent } from 'components/ConsultRoom/MultiSelectComponent';
import { CALL_FEEDBACK_RESPONSES_TYPES } from 'graphql/types/globalTypes';

export interface RateCallProps {
  submitRatingCallback: (data: {
    rating: number;
    feedbackResponseType: CALL_FEEDBACK_RESPONSES_TYPES | null;
    audioFeedbacks: {}[];
    videoFeedbacks: {}[];
  }) => void;
  visible: boolean;
}

const useStyles = makeStyles((theme: Theme) => {
  return {
    dialogContainer: {
      padding: 20,
      width: 600,
    },
    title: {
      color: '#07AE8B',
      fontFamily: 'IBM Plex Sans',
      fontWeight: 600,
      fontSize: 24,
      marginTop: 20,
    },
    subTitle: {
      fontSize: 24,
      color: '#555',
    },
    rating: {
      margin: '20px 0px',
    },
    flexRow: {
      margin: '20px 0px',
    },
    appbar: {
      height: 70,
      width: 200,
      background: 'none',
      boxShadow: 'none',
      marginTop: 20,
    },
    tab: {
      minWidth: 100,
      width: 50,
      fontSize: 14,
    },
    otherTextField: {
      margin: '20px 0px',
      width: '100%',
    },
    submitButton: {
      marginTop: 10,
      float: 'right',
    },
  };
});

export const RateCall: React.FC<RateCallProps> = (props) => {
  const callType = [
    {
      title: 'Audio',
      selectedIcon: <img src={require('../../images/audioActive.png')} />,
      unselectedIcon: <img src={require('../../images/audioInactive.png')} />,
    },
    {
      title: 'Video',
      selectedIcon: <img src={require('../../images/videoActive.png')} />,
      unselectedIcon: <img src={require('../../images/videoInactive.png')} />,
    },
  ];
  const classes = useStyles({});

  const [rating, setRating] = useState<number>(5);
  const [feedbackResponseType, setFeedbackResponseType] = useState<string>(callType[0].title);
  const [othersAudioFeedback, setOthersAudioFeedback] = useState<string>('');
  const [othersVideoFeedback, setOthersVideoFeedback] = useState<string>('');
  const [audioFeedbacks, setAudioFeedbacks] = useState<{}[]>([]);
  const [videoFeedbacks, setVideoFeedbacks] = useState<{}[]>([]);
  const [refreshState, setRefreshState] = useState<boolean>(false);
  const [isOtherAudioFeedback, setIsOtherAudioFeedback] = useState<boolean>(false);
  const [isOtherVideoFeedback, setIsOtherVideoFeedback] = useState<boolean>(false);
  const hasFeedbackIssue = rating !== 0 && rating < 3;
  const isBtnDisabled = rating < 3 && audioFeedbacks.length === 0 && videoFeedbacks.length === 0;

  useEffect(() => {
    const otherAudioFeedback = audioFeedbacks.filter(
      (item: any) => item.responseName === 'AUDIO_OTHER'
    );
    if (otherAudioFeedback && otherAudioFeedback.length > 0) {
      setIsOtherAudioFeedback(true);
    } else {
      setIsOtherAudioFeedback(false);
    }

    const otherVideoFeedback = videoFeedbacks.filter(
      (item: any) => item.responseName === 'VIDEO_OTHER'
    );
    if (otherVideoFeedback && otherVideoFeedback.length > 0) {
      setIsOtherVideoFeedback(true);
    } else {
      setIsOtherVideoFeedback(false);
    }
  }, [refreshState]);

  const handleRating = (rating: number) => {
    setRating(rating);
    setFeedbackResponseType('audio');
  };

  const renderRating = () => {
    return (
      <Rating
        className={classes.rating}
        size="large"
        value={rating}
        onChange={(event, newValue) => {
          handleRating(newValue);
        }}
      />
    );
  };

  const audioFeedbackCallback = (
    data: {
      responseValue: string;
      responseName: string;
    }[]
  ) => {
    setAudioFeedbacks(data);
    setRefreshState(!refreshState);
  };

  const videoFeedbackCallback = (
    data: {
      responseValue: string;
      responseName: string;
    }[]
  ) => {
    setVideoFeedbacks(data);
    setRefreshState(!refreshState);
  };

  const handleCallTypeChange = (value: number) => {
    value === 1 ? setFeedbackResponseType('video') : setFeedbackResponseType('audio');
  };

  const renderCalltypeTab = () => {
    return (
      <div style={{ display: hasFeedbackIssue ? 'flex' : 'none' }}>
        <AppBar position="static" color="default" className={classes.appbar}>
          <Tabs
            value={feedbackResponseType === 'audio' ? 0 : 1}
            onChange={(event, newAppBarValue) => {
              handleCallTypeChange(newAppBarValue);
            }}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="Audio" className={classes.tab} icon={<VolumeUpIcon />} />
            <Tab label="Video" className={classes.tab} icon={<VideocamIcon />} />
          </Tabs>
        </AppBar>
      </div>
    );
  };

  const renderMultiSelectQuestions = () => {
    return (
      <div style={{ display: hasFeedbackIssue ? 'flex' : 'none' }}>
        {feedbackResponseType === 'audio' ? renderAudioQuestions() : renderVideoQuestions()}
      </div>
    );
  };

  const audioReviews = [
    { responseValue: 'Patient Did not pick up the call', responseName: 'AUDIO_CALL_NOT_PICKED' },
    {
      responseValue: 'Call Disconnected Abruptly',
      responseName: 'AUDIO_CALL_DISCONNECTED_ABRUPTLY',
    },
    { responseValue: 'Could not hear any sound', responseName: 'AUDIO_NO_SOUND_HEARED' },
    { responseValue: 'Patient could not hear me', responseName: 'AUDIO_NO_SOUND_RECEIVED' },
    { responseValue: 'Audio Echo was heard', responseName: 'AUDIO_ECHO' },
    {
      responseValue: 'I heard a strange noise',
      responseName: 'AUDIO_STRANGE_NOISE',
    },
    { responseValue: 'Volume was low', responseName: 'AUDIO_VOLUME_LOW' },
    { responseValue: 'Other', responseName: 'AUDIO_OTHER' },
  ];

  const videoReviews = [
    { responseValue: 'Patient Did not pick up the call', responseName: 'VIDEO_CALL_NOT_PICKED' },
    {
      responseValue: 'Call Disconnected Abruptly',
      responseName: 'VIDEO_CALL_DISCONNECTED_ABRUPTLY',
    },
    { responseValue: 'Could not see anything in the video', responseName: 'VIDEO_NOT_VISIBLE' },
    { responseValue: 'Video was working but not clear', responseName: 'VIDEO_NOT_CLEAR' },
    { responseValue: 'Patient could not see my video', responseName: 'VIDEO_NOT_RECEIVED' },
    { responseValue: 'Video froze during the call', responseName: 'VIDEO_FREEZE' },
    { responseValue: 'Video Stopped working during call', responseName: 'VIDEO_STOPPED' },
    { responseValue: 'Video and audio was not in sync', responseName: 'VIDEO_AUDIO_NOT_SYNC' },
    { responseValue: 'Other', responseName: 'VIDEO_OTHER' },
  ];

  const renderAudioQuestions = () => {
    return (
      <div className={classes.flexRow}>
        <MultiSelectComponent
          data={audioReviews}
          itemSelectionCallback={(data) => audioFeedbackCallback(data)}
        />

        {isOtherAudioFeedback ? (
          <TextField
            className={classes.otherTextField}
            placeholder="Other Feedback"
            value={othersAudioFeedback}
            onChange={(e) => setOthersAudioFeedback(e.target.value)}
          />
        ) : (
          <></>
        )}
      </div>
    );
  };

  const renderVideoQuestions = () => {
    return (
      <div>
        <MultiSelectComponent
          data={videoReviews}
          itemSelectionCallback={(data) => videoFeedbackCallback(data)}
        />

        {isOtherVideoFeedback ? (
          <TextField
            className={classes.otherTextField}
            placeholder="Other Feedback"
            value={othersVideoFeedback}
            onChange={(e) => setOthersVideoFeedback(e.target.value)}
          />
        ) : (
          <></>
        )}
      </div>
    );
  };

  const renderSubmitBtn = () => {
    return (
      <AphButton
        title="SUBMIT"
        disabled={isBtnDisabled}
        color="primary"
        className={classes.submitButton}
        onClick={() => {
          const newAudioFeedbacks = audioFeedbacks.filter((item: any) =>
            item.responseName.includes('AUDIO')
          );
          const filteredAudioFeedbacks = newAudioFeedbacks.map((item: any) => {
            var obj = Object.assign({}, item);
            if (obj.responseName === 'AUDIO_OTHER') {
              obj.comment = othersAudioFeedback;
              obj.responseName = 'OTHER';
            }
            return obj;
          });

          const newVideoFeedbacks = videoFeedbacks.filter((item: any) =>
            item.responseName.includes('VIDEO')
          );
          const filteredVideoFeedbacks = newVideoFeedbacks.map((item: any) => {
            var obj = Object.assign({}, item);
            if (obj.responseName === 'VIDEO_OTHER') {
              obj.comment = othersVideoFeedback;
              obj.responseName = 'OTHER';
            }
            return obj;
          });
          props.submitRatingCallback({
            rating: rating,
            feedbackResponseType: hasFeedbackIssue
              ? filteredAudioFeedbacks.length > 0 && filteredVideoFeedbacks.length > 0
                ? CALL_FEEDBACK_RESPONSES_TYPES.AUDIOVIDEO
                : filteredAudioFeedbacks.length > 0
                ? CALL_FEEDBACK_RESPONSES_TYPES.AUDIO
                : CALL_FEEDBACK_RESPONSES_TYPES.VIDEO
              : null,
            audioFeedbacks: hasFeedbackIssue ? filteredAudioFeedbacks : [],
            videoFeedbacks: hasFeedbackIssue ? filteredVideoFeedbacks : [],
          });
          cleanupState();
        }}
      >
        SUBMIT
      </AphButton>
    );
  };

  const cleanupState = () => {
    setRating(0);
    setFeedbackResponseType(callType[0].title);
    setAudioFeedbacks([]);
    setVideoFeedbacks([]);
    setOthersAudioFeedback('');
    setOthersVideoFeedback('');
    setIsOtherAudioFeedback(false);
    setIsOtherVideoFeedback(false);
  };

  return (
    <Dialog open={props.visible}>
      <DialogContent className={classes.dialogContainer}>
        <div>
          <Typography className={classes.title}>
            How was your experience ? <br />
            Please rate us !
          </Typography>
          {renderRating()}
          {rating !== 0 && (
            <Typography className={classes.subTitle}>
              {hasFeedbackIssue ? 'What went wrong ?' : 'Thank you !'}
            </Typography>
          )}
          {rating !== 0 && (
            <Typography>
              {hasFeedbackIssue
                ? 'We are sorry, please let us know'
                : 'we will keep up the service !'}
            </Typography>
          )}
          {renderCalltypeTab()}
          {renderMultiSelectQuestions()}
          {rating !== 0 && renderSubmitBtn()}
        </div>
      </DialogContent>
    </Dialog>
  );
};
