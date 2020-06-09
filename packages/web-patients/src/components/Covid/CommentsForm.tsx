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
      padding: 16,
      boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.15)',
      borderRadius: 5,
      backgroundColor: '#fff',
    },
    formRow: {
      paddingBottom: 16,
      '& label': {
        opacity: 0.6,
      },
    },
    commentsBox: {
      '& textarea': {
        borderWidth: 2,
        marginTop: 8,
        fontWeight: 500,
        color: '#01475b',
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
        opacity: 1,
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
    },
    cancelBtn: {
      display: 'inline-block',
      boxShadow: 'none',
      backgroundColor: 'transparent',
      color: '#fc9916',
      padding: '0 8px',
      marginRight: 16,
      '&:hover': {
        backgroundColor: 'transparent',
        color: '#fc9916',
      },
    },
    buttonDisabled: {
      opacity: 0.6,
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
  onCancel: () => void;
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
    if (isEmailValid(userEmail) && comment.length && isNameValid(userName)) {
      setIsPostSubmitDisable(false);
    } else {
      setIsPostSubmitDisable(true);
    }
  }, [userEmail, comment, userName]);

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
            label="Comment"
            onChange={(event) => setComment(event.target.value)}
            value={comment}
            multiline
            autoFocus={true}
            inputProps={{
              maxLength: 300,
            }}
          />
        </div>
      </div>
      <div className={classes.formRow}>
        <AphTextField
          onChange={(event) => handleNameChange(event)}
          label="Name"
          placeholder="Enter your name"
          value={userName}
        />
        {!userNameValid && <div className={classes.error}>Invalid name</div>}
      </div>
      <div className={classes.formRow}>
        <AphTextField
          onChange={(event) => setUserEmail(event.target.value)}
          label="Email"
          placeholder="Enter your email ID"
          value={userEmail}
          onBlur={handleEmailValidityCheck}
        />
        {!emailValid && <div className={classes.error}>Invalid email</div>}

        {/* <div className={classes.checkboxGroup}>
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
        </div> */}
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
            label="Subscribe to the Apollo 247 newsletter"
          />
        </div>
      </div>
      {!isLoading ? (
        <div className={classes.bottomActions}>
          <AphButton
            className={classes.cancelBtn}
            onClick={() => {
              handleCancelForm();
              props.onCancel();
            }}
          >
            Cancel
          </AphButton>
          <AphButton
            color="primary"
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
            props.onCancel();
            setIsPopoverOpen(false);
          }}
          // refreshPage
        />
      </Popover>
    </div>
  );
};
