import React, { useEffect, useState } from 'react';
import { Theme, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { AphInput } from '@aph/web-ui-components';
import { Header } from 'components/Header';
import Pubnub from 'pubnub';

const useStyles = makeStyles((theme: Theme) => {
  return {
    welcome: {
      paddingTop: 68,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 68,
      },
    },
    booksLink: {
      color: theme.palette.primary.main,
      textDecoration: 'underline',
    },
    headerSticky: {
      position: 'fixed',
      width: '100%',
      zIndex: 99,
      top: 0,
    },
    chatContainer: {
      border: '1px solid #ff0000',
      marginTop: 50,
      minHeight: 500,
    },
    petient: {
      color: '#ff0000',
      backgroundColor: '#fff',
      textAlign: 'left',
    },
    doctor: {
      color: '#00ff00',
      backgroundColor: '#fff',
      textAlign: 'right',
    },
    boldTxt: {
      fontWeight: 700,
    },
    sendMsgBtn: {
      backgroundColor: '#F9F9F9',
      color: '#000',
      width: '30 %',
      align: 'right',
    },
    inputWidth: {
      width: '60 %',
      align: 'left',
    },
  };
});
interface MessagesProps {
  [index: number]: { id: string; message: string; username: string; text: string };
}
export const ConsultRoom: React.FC = (props) => {
  const classes = useStyles();
  const [messages, setMessages] = useState<MessagesProps[]>([]);
  const [messageText, setMessageText] = useState<string>('');

  const config: Pubnub.PubnubConfig = {
    subscribeKey: 'sub-c-58d0cebc-8f49-11e9-8da6-aad0a85e15ac',
    publishKey: 'pub-c-e3541ce5-f695-4fbd-bca5-a3a9d0f284d3',
    ssl: true,
  };
  let leftComponent = 0;
  let rightComponent = 0;
  const pubnub = new Pubnub(config);
  useEffect(() => {
    pubnub.subscribe({
      channels: ['Channel3'],
      withPresence: true,
    });

    getHistory();
    pubnub.addListener({
      status: (statusEvent) => {
        if (statusEvent.category === Pubnub.CATEGORIES.PNConnectedCategory) {
          console.log(statusEvent.category);
        } else if (statusEvent.operation === Pubnub.OPERATIONS.PNAccessManagerAudit) {
          console.log(statusEvent.operation);
        }
      },
      message: (message) => {
        getHistory();
      },
      presence: (presenceEvent) => {
        console.log('presenceEvent', presenceEvent);
      },
    });
    return function cleanup() {
      pubnub.unsubscribe({ channels: ['Channel3'] });
    };
  }, []);

  const getHistory = () => {
    pubnub.history({ channel: 'Channel3', reverse: true, count: 1000 }, (status, res) => {
      const newmessage: MessagesProps[] = [];
      res.messages.forEach((element, index) => {
        newmessage[index] = element.entry;
      });
      if (messages.length !== newmessage.length) {
        setMessages(newmessage);
      }
    });
  };

  const send = () => {
    const text = {
      id: 'Ravi',
      message: messageText,
    };
    pubnub.publish(
      {
        channel: 'Channel3',
        message: text,
        storeInHistory: true,
        sendByPost: true,
      },
      (status, response) => {
        /*
         * Do something
         */
        console.log('response', response);
        console.log('status', status);
        setMessageText('');
      }
    );
  };

  const renderChatRow = (rowData: any, index: number) => {
    if (rowData.id === 'Ravi') {
      leftComponent++;
      rightComponent = 0;
      return (
        <div className={classes.doctor}>
          {leftComponent == 1 && <span className={classes.boldTxt}>Me: </span>}
          <span>{rowData.message}</span>
        </div>
      );
    }
    if (rowData.id === 'Sai') {
      leftComponent = 0;
      rightComponent++;
      return (
        <div className={classes.petient}>
          {rightComponent == 1 && <span className={classes.boldTxt}>Sai: </span>}
          <span>{rowData.message}</span>
        </div>
      );
    }
    if (rowData.id !== 'Sai' && rowData.id !== 'Ravi') {
      return '';
    }
  };
  const messagessHtml =
    messages && messages.length > 0
      ? messages.map((item: MessagesProps, index: number) => {
          return <div key={index.toString()}>{renderChatRow(item, index)}</div>;
        })
      : '';
  return (
    <div className={classes.welcome}>
      <div className={classes.headerSticky}>
        <Header />
      </div>
      <div className={classes.chatContainer}>{messagessHtml}</div>
      <div>
        <AphInput
          className={classes.inputWidth}
          inputProps={{ type: 'text' }}
          value={messageText}
          onChange={(event) => {
            setMessageText(event.currentTarget.value);
          }}
        />
        <Button variant="text" className={classes.sendMsgBtn} onClick={() => send()}>
          Send
        </Button>
      </div>
    </div>
  );
};
