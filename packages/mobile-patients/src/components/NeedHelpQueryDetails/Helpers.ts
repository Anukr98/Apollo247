import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import AsyncStorage from '@react-native-community/async-storage';

const helpTicketKey = 'com.apollo247.helpTicket';

export const Helpers = {
  getFilteredReasons: (queryCategory: string, isOrderRelated?: boolean) => {
    const needHelp = AppConfig.Configuration.NEED_HELP;
    const category = needHelp.find(({ category }) => category === queryCategory);
    const queryReasons = category?.options || [];

    return category?.orderRelatedIndices
      ? queryReasons.filter((_, index) =>
          isOrderRelated
            ? (category?.orderRelatedIndices || [])?.indexOf(index) > -1
            : (category?.orderRelatedIndices || [])?.indexOf(index) === -1
        )
      : queryReasons;
  },

  saveNeedHelpQuery: async (ticket: Query) => {
    await AsyncStorage.setItem(helpTicketKey, JSON.stringify(ticket));
  },
  getNeedHelpQuery: async (): Promise<Query | null> => {
    const ticket = await AsyncStorage.getItem(helpTicketKey);
    return ticket ? JSON.parse(ticket) : null;
  },
};

export type Query = {
  createdDate: Date;
  orderType: string;
  orderId: string;
};
