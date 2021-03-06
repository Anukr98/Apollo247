import { Helpers as NeedHelpHelpers } from '@aph/mobile-patients/src/components/NeedHelp';
import AsyncStorage from '@react-native-community/async-storage';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';

const helpTicketKey = 'com.apollo247.helpTicket';

const helpSectionQueryId = AppConfig.Configuration.HELP_SECTION_CUSTOM_QUERIES;
export const Helpers = {
  saveNeedHelpQuery: async (ticket: Query) => {
    await AsyncStorage.setItem(helpTicketKey, JSON.stringify(ticket));
  },
  getNeedHelpQuery: async (): Promise<Query | null> => {
    const ticket = await AsyncStorage.getItem(helpTicketKey);
    return ticket ? JSON.parse(ticket) : null;
  },
  getQueryData: (
    queries: NeedHelpHelpers.HelpSectionQuery[],
    idLevel1: string | null,
    idLevel2: string | null,
    idLevel3: string | null
  ) => {
    const data =
    idLevel1 && idLevel2 && idLevel3
    ? queries.find((q1) => q1?.id === idLevel1)?.queries?.find((q2) => q2?.id === idLevel2)?.queries?.find((q3) => q3?.id === idLevel3)
      : idLevel1 && idLevel2
        ? queries.find((q1) => q1?.id === idLevel1)?.queries?.find((q2) => q2?.id === idLevel2)         
          : queries.find((q1) => q1.id === idLevel1);

    return data as NeedHelpHelpers.HelpSectionQuery;
  },
  getQueryDataByOrderStatus: (
    queryData: NeedHelpHelpers.HelpSectionQuery,
    isOrderRelatedIssue: boolean,
    orderStatus: any,
    buQuery: NeedHelpHelpers.HelpSectionQuery,
    idLevel2: string | null,
    ) => {
    let queries = [];
    const queriesByOrderStatus = queryData?.queriesByOrderStatus?.[orderStatus] as
      | string[]
      | undefined;
      const nonOrderQueries = queryData?.nonOrderQueries as string[] | undefined;
      
    if (idLevel2 && orderStatus && isOrderRelatedIssue) {
      buQuery?.queriesByOrderStatus?.[orderStatus].forEach((qId: string) => {
        queryData?.queries?.forEach(qElement => {
          if(qElement?.id === qId){
            queries.push(qElement);
          }
        });
      });
    } else if (queriesByOrderStatus && orderStatus) {
      queriesByOrderStatus.forEach((qId) => {
        queryData?.queries?.forEach(qElement => {
          if(qElement?.id === qId){
            queries.push(qElement);
          }
        });
      });
    } else if (nonOrderQueries && !isOrderRelatedIssue) {
      queries = nonOrderQueries.map((qId: any) => queryData?.queries?.find((q) => q?.id === qId));
    } else if (nonOrderQueries && isOrderRelatedIssue) {
      queries = queryData?.queries?.filter((q) => !nonOrderQueries.includes(q?.id!));
    }

    return (queries.length ?  queries :  queryData?.queries ? queryData?.queries : []) as NeedHelpHelpers.HelpSectionQuery[];
  },
  getBuData: (
    queries: NeedHelpHelpers.HelpSectionQuery[],
    idLevel1: string | null,
  ) => {
    const data = queries.find((q1) => q1.id === idLevel1);
    return data as NeedHelpHelpers.HelpSectionQuery;
  },
};

export type Query = {
  createdDate: Date;
  orderType: string;
  orderId: string;
};
