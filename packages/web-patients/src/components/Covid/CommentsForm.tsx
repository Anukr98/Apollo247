import React, { useState, useEffect } from 'react';
import { Theme, FormControlLabel, Checkbox, Popover, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { isEmailValid, isNameValid } from '@aph/universal/dist/aphValidators';
import { AphTextField, AphButton } from '@aph/web-ui-components';
import fetchUtil from 'helpers/fetch';
import { MascotWithMessage } from '../MascotWithMessage';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      position: 'relative',
    },
    formRow: {
      paddingBottom: 16,
    },
    commentsBox: {
      '& label': {
        textTransform: 'uppercase',
        color: '#0087ba',
      },
      '& textarea': {
        borderRadius: 0,
        backgroundColor: 'rgba(216, 216, 216, 0.2)',
        border: 'none',
        marginTop: 8,
        fontSize: 12,
        fontWeight: 500,
        color: 'rgba(1,71,91,0.6)',
        padding: 12,
        minHeight: 58,
      },
    },
    checkboxGroup: {
      paddingTop: 10,
      '& label': {
        fontSize: 12,
        fontWeight: 500,
        color: '#02475b',
        alignItems: 'center',
        marginLeft: 0,
        '& span': {
          fontSize: 12,
          fontWeight: 500,
          color: '#02475b',
        },
      },
    },
    checkboxRoot: {
      padding: 0,
      marginRight: 5,
      '& svg': {
        width: 24,
        height: 24,
        fill: '##02475b',
      },
    },
    bottomActions: {
      textAlign: 'right',
      '& button': {
        display: 'inline-block',
        boxShadow: 'none',
        backgroundColor: 'transparent',
        color: '#fc9916',
        padding: '0 8px',
        '&:hover': {
          backgroundColor: 'transparent',
          color: '#fc9916',
        },
        '&:last-child': {
          paddingRight: 0,
        },
      },
    },
    buttonDisabled: {
      backgroundColor: 'transparent',
      color: '#fc9916 !important',
      opacity: 0.6,
      '&:hover': {
        backgroundColor: 'transparent',
        color: '#fc9916 !important',
      },
    },
    error: {
      color: '#890000',
    },
    bottomPopover: {
      overflow: 'initial',
      backgroundColor: 'transparent',
      boxShadow: 'none',
    },
    loader: {
      margin: '20px auto',
      textAlign: 'center',
      display: 'block',
    },
  };
});

interface CommentsFormProps {
  titleId: string;
}

export const CommentsForm: React.FC<CommentsFormProps> = (props) => {
  const classes = useStyles({});
  const [subscribe, setSubscribe] = useState<boolean>(true);
  const [maskEmail, setMaskEmail] = useState<boolean>(false);
  const [isPostSubmitDisable, setIsPostSubmitDisable] = useState<boolean>(true);
  const [comment, setComment] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [emailValid, setEmailValid] = useState<boolean>(true);
  const [userNameValid, setUserNameValid] = useState<boolean>(true);
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const postCommentUrl = process.env.POST_COMMENT_URL || '';

  useEffect(() => {
    if (isEmailValid(userEmail) && comment.length) {
      setIsPostSubmitDisable(false);
    } else {
      setIsPostSubmitDisable(true);
    }
  }, [userEmail, comment]);

  const handleCancelForm = () => {
    setComment('');
    setUserName('');
    setUserEmail('');
    setEmailValid(true);
    setUserNameValid(true);
    setMaskEmail(false);
    setSubscribe(true);
  };

  const handleEmailValidityCheck = () => {
    if (userEmail.length && !isEmailValid(userEmail)) {
      setEmailValid(false);
    } else {
      setEmailValid(true);
    }
  };

  const handleNameChange = (ev: any) => {
    if (isNameValid(ev && ev.target.value)) {
      setUserNameValid(true);
    } else {
      setUserNameValid(false);
    }
    setUserName(ev && ev.target.value);
  };

  const submitComment = () => {
    setIsLoading(true);
    const commentData = {
      comment,
      email: userEmail,
      name: userName,
      maskEmail,
      subcription: subscribe,
      id: props.titleId,
    };
    fetchUtil(postCommentUrl, 'POST', commentData, '', true).then((res: any) => {
      if (res && res.success) {
        handleCancelForm();
        setIsLoading(false);
        setIsPopoverOpen(true);
      } else {
      }
    });
  };

  return (
    <div className={classes.root}>
      <div className={classes.formRow}>
        <div className={classes.commentsBox}>
          <AphTextField
            label="Comments"
            onChange={(event) => setComment(event.target.value)}
            value={comment}
            multiline
            inputProps={{
              maxLength: 300,
            }}
          />
        </div>
      </div>
      <div className={classes.formRow}>
        <AphTextField
          onChange={(event) => setUserEmail(event.target.value)}
          label="Email*"
          placeholder="Add your email"
          value={userEmail}
          onBlur={handleEmailValidityCheck}
        />
        {!emailValid && <div className={classes.error}>Invalid email</div>}

        <div className={classes.checkboxGroup}>
          <FormControlLabel
            control={
              <Checkbox
                checked={maskEmail}
                onChange={() => setMaskEmail(!maskEmail)}
                classes={{
                  root: classes.checkboxRoot,
                }}
              />
            }
            label="Mask Email address while posting comment"
          />
        </div>
      </div>
      <div className={classes.formRow}>
        <AphTextField
          onChange={(event) => handleNameChange(event)}
          label="Full Name"
          placeholder="Add your name"
          value={userName}
        />
        {!userNameValid && <div className={classes.error}>Invalid name</div>}
      </div>
      <div className={classes.formRow}>
        <div className={classes.checkboxGroup}>
          <FormControlLabel
            control={
              <Checkbox
                checked={subscribe}
                onChange={() => setSubscribe(!subscribe)}
                classes={{
                  root: classes.checkboxRoot,
                }}
              />
            }
            label="I would like to subscribe to Apollo 24|7 newsletter"
          />
        </div>
      </div>
      {!isLoading ? (
        <div className={classes.bottomActions}>
          <AphButton onClick={() => handleCancelForm()}>Cancel</AphButton>
          <AphButton
            disabled={isPostSubmitDisable}
            onClick={() => submitComment()}
            className={isPostSubmitDisable ? classes.buttonDisabled : ''}
          >
            Post comment
          </AphButton>
        </div>
      ) : (
        <div className={classes.loader}>
          <CircularProgress />
        </div>
      )}

      <Popover
        open={isPopoverOpen}
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
        <MascotWithMessage
          messageTitle=""
          message="We have received your comment. We will let you know once it is approved."
          closeButtonLabel="OK"
          closeMascot={() => {
            setIsPopoverOpen(false);
          }}
          // refreshPage
        />
      </Popover>
    </div>
  );
};
