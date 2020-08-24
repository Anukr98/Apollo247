import Pubnub from 'pubnub';
import { ApiConstants } from 'ApiConstants';

export const sendBrowserNotitication = (id: string, message: string) => {
  const pubnub = new Pubnub({
    publishKey: process.env.PUBLISH_KEY ? process.env.PUBLISH_KEY : '',
    subscribeKey: process.env.SUBSCRIBE_KEY ? process.env.SUBSCRIBE_KEY : '',
  });
  pubnub.subscribe({
    channels: [id],
  });
  pubnub.publish(
    {
      channel: id,
      message: {
        id: id,
        message: message,
        messageDate: new Date(),
        sentBy: ApiConstants.SENT_BY_API,
      },
      storeInHistory: false,
      sendByPost: true,
    },
    (status, response) => {
      console.log('status,response==', status, response);
      pubnub.unsubscribe({
        channels: [id],
      });
    }
  );
};
