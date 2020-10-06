import React, { createContext, useState, useEffect, useContext } from 'react';
import PubNub, { PubnubStatus, PublishResponse, HistoryResponse } from 'pubnub';
import { useAllCurrentPatients } from 'hooks/authHooks';

export interface ApolloPubNubContextProps {
  publishMessage: (channelName: string, message: string) => void | null;
  messages: any;
  newMessage: any;
}

export const ApolloPubNubContext = createContext<ApolloPubNubContextProps>({
  publishMessage: (channelName: string, message: string) => {},
  messages: [],
  newMessage: '',
});

// interface ApolloPubNubProviderProps {
//   appointmentId: string;
//   message: string;
// }

interface MessagesObjectProps {
  id: string;
  message: string;
  automatedText: string;
  duration: string;
  url: string;
  transferInfo: any;
  messageDate: string;
  // username: string;
  // text: string;
}

// type Params = { appointmentId: string; doctorId: string };

export const ApolloPubNubProvider: React.FC = (props) => {
  const { currentPatient } = useAllCurrentPatients();
  const [messages, setMessages] = useState<any>([]);
  const [newMessage, setNewMessage] = useState<any>('');

  const pathName = window.location.pathname; // not sure react router hooks is not working
  const appointmentId = pathName.split('/')[2];

  const pubnubClient = new PubNub({
    publishKey: process.env.PUBLISH_KEY,
    subscribeKey: process.env.SUBSCRIBE_KEY,
    uuid: currentPatient && currentPatient.id,
    ssl: false,
    origin: 'apollo.pubnubapi.com',
  });

  useEffect(() => {
    if (appointmentId.length > 0) {
      // subscribe to channel
      pubnubClient.subscribe({
        channels: [appointmentId],
        withPresence: true,
      });

      // adding listener
      pubnubClient.addListener({
        status: (status) => {
          console.log('status...............', status);
        },
        message: (message) => {
          console.log(message, 'message is..............');
          setNewMessage(message);
        },
      });

      // get latest 100 messages
      pubnubClient.history(
        { channel: appointmentId, count: 100, stringifiedTimeToken: true },
        (status: PubnubStatus, response: HistoryResponse) => {
          // console.log(response, '-------------------------');
          setMessages(response.messages);
        }
      );
      return function cleanup() {
        pubnubClient.unsubscribe({ channels: [appointmentId] });
      };
    }
  }, [appointmentId]);

  const publishMessage: ApolloPubNubContextProps['publishMessage'] = (channelName, message) => {
    pubnubClient.publish(
      {
        channel: channelName,
        message: message,
        storeInHistory: true,
      },
      (status: PubnubStatus, response: PublishResponse) => {
        if (status.error) {
          console.log('message not published', status.error);
        } else {
          console.log('message published', response);
        }
      }
    );
  };

  return (
    <ApolloPubNubContext.Provider
      value={{
        publishMessage,
        messages,
        newMessage,
      }}
    >
      {props.children}
    </ApolloPubNubContext.Provider>
  );
};
