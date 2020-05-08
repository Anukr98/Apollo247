import React, { createContext, useContext, useState } from 'react';
import CryptoJS from 'crypto-js';
import { AppConfig } from '@aph/mobile-doctors/src/helpers/AppConfig';
import {
  getNotifications,
  getNotificationsVariables,
  getNotifications_getNotifications_notificationData,
} from '@aph/mobile-doctors/src/graphql/types/getNotifications';
import { useApolloClient } from 'react-apollo-hooks';
import moment from 'moment';
import { GET_NOTIFICATIONS, MARK_MESSAGE_UNREAD } from '@aph/mobile-doctors/src/graphql/profiles';
import { useAuth } from '@aph/mobile-doctors/src/hooks/authHooks';
import { markMessageToUnread } from '@aph/mobile-doctors/src/graphql/types/markMessageToUnread';
import { g } from '@aph/mobile-doctors/src/helpers/helperFunctions';
import { CommonBugFender } from '@aph/mobile-doctors/src/helpers/DeviceHelper';

export interface NotificationContextProps {
  notifications: (getNotifications_getNotifications_notificationData | null)[] | null | undefined;
  fetchNotifications: (callback?: (success: boolean) => void) => void;
  markAsRead: (id: string, callback?: (success: boolean) => void) => void;
  decryptMessage: (ciphertext: string) => string;
  encryptMessage: (message: string) => string;
}

export const NotificationContext = createContext<NotificationContextProps>({
  notifications: null,
  fetchNotifications: () => {},
  markAsRead: (id) => {
    return true;
  },
  decryptMessage: (ciphertext) => {
    return ciphertext;
  },
  encryptMessage: (message) => {
    return message;
  },
});

export const NotificationProvider: React.FC = (props) => {
  const client = useApolloClient();
  const { doctorDetails } = useAuth();

  const [notifications, setNotifications] = useState<
    (getNotifications_getNotifications_notificationData | null)[] | null | undefined
  >([]);
  const fetchNotifications = (callback?: (success: boolean) => void) => {
    if (doctorDetails) {
      client
        .query<getNotifications, getNotificationsVariables>({
          query: GET_NOTIFICATIONS,
          variables: {
            toId: doctorDetails.id,
            startDate: moment(new Date())
              .add(-6, 'day')
              .format('YYYY-MM-DD'),
            endDate: moment(new Date())
              .add(1, 'day')
              .format('YYYY-MM-DD'),
          },
          fetchPolicy: 'no-cache',
        })
        .then((data) => {
          const sortedNotifications = g(data, 'data', 'getNotifications', 'notificationData');
          if (sortedNotifications) {
            sortedNotifications.sort(
              (a, b) =>
                moment(b && b.lastUnreadMessageDate)
                  .toDate()
                  .getTime() -
                moment(a && a.lastUnreadMessageDate)
                  .toDate()
                  .getTime()
            );
          }
          setNotifications(sortedNotifications);
          callback && callback(true);
        })
        .catch((error) => {
          callback && callback(false);
          CommonBugFender('Notification_Get_Doctor', error);
        });
    }
  };

  const markAsRead = (id: string, callback?: (success: boolean) => void) => {
    client
      .mutate<markMessageToUnread>({
        mutation: MARK_MESSAGE_UNREAD,
        variables: {
          eventId: id,
        },
      })
      .then((data) => {
        if ((g(data, 'data', 'markMessageToUnread', 'notificationData') || []).length > 0) {
          callback && callback(true);
        }
      })
      .catch((error) => {
        callback && callback(false);
        CommonBugFender('Notification_Mark_Read_Doctor', error);
      });
  };

  const decryptMessage = (ciphertext: string) => {
    return CryptoJS.AES.decrypt(ciphertext, AppConfig.Configuration.CHAT_ENCRYPTION_KEY).toString(
      CryptoJS.enc.Utf8
    );
  };

  const encryptMessage = (message: string) => {
    return CryptoJS.AES.encrypt(message, AppConfig.Configuration.CHAT_ENCRYPTION_KEY).toString();
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        fetchNotifications,
        markAsRead,
        decryptMessage,
        encryptMessage,
      }}
    >
      {props.children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext<NotificationContextProps>(NotificationContext);
