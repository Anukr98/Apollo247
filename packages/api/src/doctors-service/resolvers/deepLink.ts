import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { DeepLinkInput } from 'types/deeplinks';
import { getDeeplink, refreshLink, generateDeepLinkBody } from 'helpers/appsflyer';
import { Deeplink, DeepLinkType, DoctorType, Doctor } from 'doctors-service/entities';
import { ApiConstants } from 'ApiConstants';
import { DeeplinkRepository } from 'doctors-service/repositories/deepLinkRepository';
import { format, addDays, differenceInDays } from 'date-fns';
import { trim } from 'lodash';
import path from 'path';
import _ from 'lodash';

export const deepLinkTypeDefs = gql`
  type Deeplink {
    deepLink: String
  }

  extend type Mutation {
    upsertDoctorsDeeplink(doctorId: String): Deeplink
    insertBulkDeepLinks: String
    refreshDoctorDeepLinks(offset: Int!): String
    generateDeepLinksByCron: String
  }
`;

const upsertDoctorsDeeplink: Resolver<
  null,
  { doctorId: string },
  DoctorsServiceContext,
  { deepLink: string }
> = async (parent, args, { doctorsDb, mobileNumber }) => {
  //get doctors data
  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const doctordata = await doctorRepository.findDoctorByIdWithoutRelations(args.doctorId);
  if (doctordata == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  const todayDate = new Date(format(new Date(), 'yyyy-MM-dd'));
  const refreshDays = ApiConstants.LINK_TTL ? parseInt(ApiConstants.LINK_TTL, 10) : 0;

  //get deeplink details of doctor id.
  const linkRepository = doctorsDb.getCustomRepository(DeeplinkRepository);
  const linkData = await linkRepository.getDeepLinkByDoctorId(args.doctorId);

  if (linkData && trim(linkData.deepLink).length > 0) {
    //check expiry date of deeplink
    const refreshDate = new Date(format(linkData.linkRefreshDate, 'yyyy-MM-dd'));

    if (
      differenceInDays(refreshDate, todayDate) > refreshDays - 1 ||
      differenceInDays(refreshDate, todayDate) <= 0
    ) {
      const newRefreshDate = addDays(new Date(), refreshDays);
      const newLink = await refreshLink(linkData, doctordata.doctorType);

      const linkDetails = newLink.split('/');
      const shortId = linkDetails[linkDetails.length - 1];

      //update link data
      const updateData: Partial<Deeplink> = {
        shortId: shortId,
        linkRefreshDate: newRefreshDate,
        deepLink: newLink,
        updatedDate: new Date(),
      };
      await linkRepository.updateDeepLink(linkData.id, updateData);
      return { deepLink: newLink };
    }
    return { deepLink: linkData.deepLink };
  }

  const deepLinkAttrs: DeepLinkInput = generateDeepLinkBody(doctordata);
  const deepLink = await getDeeplink(deepLinkAttrs, doctordata.doctorType);

  const refreshDate = addDays(new Date(), refreshDays);

  const linkDetails = deepLink.split('/');
  const shortId = linkDetails[linkDetails.length - 1];

  const templateId =
    doctordata.doctorType == DoctorType.DOCTOR_CONNECT
      ? ApiConstants.DOCTOR_DEEPLINK_TEMPLATE_ID_NON_APOLLO.toString()
      : ApiConstants.DOCTOR_DEEPLINK_TEMPLATE_ID_APOLLO.toString();

  //insert link data
  const dataAttributes: Partial<Deeplink> = {
    shortId: shortId,
    linkRefreshDate: refreshDate,
    campaignName: deepLinkAttrs.data.c,
    channelName: deepLinkAttrs.data.af_channel,
    deepLink: deepLink,
    doctorId: doctordata.id,
    partnerId: deepLinkAttrs.data.pid,
    referralCode: deepLinkAttrs.data.af_sub1,
    templateId: templateId,
    type: DeepLinkType.DOCTOR,
  };
  await linkRepository.createDeeplink(dataAttributes);

  return { deepLink: deepLink };
};

const insertBulkDeepLinks: Resolver<null, {}, DoctorsServiceContext, string> = async (
  parent,
  args,
  { doctorsDb }
) => {
  const excelToJson = require('convert-excel-to-json');
  let assetsDir = path.resolve('/apollo-hospitals/packages/api/src/assets');
  if (process.env.NODE_ENV != 'local') {
    assetsDir = path.resolve(<string>process.env.ASSETS_DIRECTORY);
  }
  const rowData = excelToJson({
    sourceFile: assetsDir + '/deeplink.xlsx',
    sheets: [
      {
        name: 'sheet1',
        header: {
          rows: 1,
        },
        columnToKey: {
          A: 'doctorId',
          B: 'partnerId',
          c: 'channelName',
          D: 'campaignName',
          E: 'referralCode',
          F: 'deepLink',
          G: 'shortId',
          H: 'templateId',
          I: 'linkRefreshDate',
        },
      },
    ],
  });

  const linkData: Partial<Deeplink>[] = rowData.sheet1;

  const linkRepository = doctorsDb.getCustomRepository(DeeplinkRepository);
  const getDeeplinks: Deeplink[] = await linkRepository.getDeeplinks();

  const refreshDays = ApiConstants.LINK_TTL ? parseInt(ApiConstants.LINK_TTL, 10) : 0;
  const newRefreshDate = addDays(new Date(), refreshDays);

  linkData.map((item: Partial<Deeplink>) => {
    item.channelName =
      item.templateId == ApiConstants.DOCTOR_DEEPLINK_TEMPLATE_ID_NON_APOLLO
        ? ApiConstants.CHANNEL_NAME_NON_APOLLO.toString()
        : ApiConstants.CHANNEL_NAME_APOLLO.toString();

    item.linkRefreshDate = newRefreshDate;
    getDeeplinks.forEach((element: Deeplink) => {
      if (element.doctorId == item.doctorId) {
        item.partnerId = element.partnerId;
        item.channelName = element.channelName;
        item.campaignName = element.campaignName;
        item.referralCode = element.referralCode;
        item.deepLink = element.deepLink;
        item.shortId = element.shortId;
        item.templateId = element.templateId;
        item.id = element.id;
      }
    });
  });

  linkData.map(async (element: Deeplink) => {
    const doctorType =
      element.templateId == ApiConstants.DOCTOR_DEEPLINK_TEMPLATE_ID_NON_APOLLO
        ? DoctorType.DOCTOR_CONNECT
        : DoctorType.APOLLO;
    await refreshLink(element, doctorType);
  });

  await linkRepository.bulkUpsertDeepLinks(linkData);

  return 'Data Insertion Completed :)';
};

const refreshDoctorDeepLinks: Resolver<
  null,
  { offset: number },
  DoctorsServiceContext,
  string
> = async (parent, args, { doctorsDb }) => {
  const linkRepository = doctorsDb.getCustomRepository(DeeplinkRepository);

  const bulkRefreshCount = process.env.DEEPLINKS_RESFRESH_COUNT
    ? parseInt(process.env.DEEPLINKS_RESFRESH_COUNT, 10)
    : 1000;
  const delayInMilliSeconds = process.env.DEEPLINK_REFRESH_DELAY
    ? parseInt(process.env.DEEPLINK_REFRESH_DELAY, 10)
    : 3000;

  const offset = args.offset == 0 ? args.offset : args.offset * bulkRefreshCount;
  const limit = bulkRefreshCount;

  const getDeeplinks: Deeplink[] = await linkRepository.getDeeplinksByLimit(offset, limit);
  if (getDeeplinks.length == 0) return 'No Deeplinks to refresh';

  const refreshDays = ApiConstants.LINK_TTL ? parseInt(ApiConstants.LINK_TTL, 10) : 0;
  const newRefreshDate = addDays(new Date(), refreshDays);

  getDeeplinks.map(async (element: Deeplink) => {
    _.delay(async () => {
      const doctorType =
        element.templateId == ApiConstants.DOCTOR_DEEPLINK_TEMPLATE_ID_NON_APOLLO
          ? DoctorType.DOCTOR_CONNECT
          : DoctorType.APOLLO;
      const newLink = await refreshLink(element, doctorType);

      const linkDetails = newLink.split('/');
      const shortId = linkDetails[linkDetails.length - 1];

      element.linkRefreshDate = newRefreshDate;
      element.deepLink = newLink;
      element.updatedDate = new Date();
      element.shortId = shortId;

      await linkRepository.upsertDeepLink(element);
    }, delayInMilliSeconds); //in milliseconds
  });

  return 'Deeplink Refresh Completed :)';
};

const generateDeepLinksByCron: Resolver<null, {}, DoctorsServiceContext, string> = async (
  parent,
  args,
  { doctorsDb }
) => {
  const linkRepository = doctorsDb.getCustomRepository(DeeplinkRepository);
  const doctorsWithDeeplink = await linkRepository.getDoctorsWithDeepLink();

  if (doctorsWithDeeplink.length == 0) return 'No new doctors :)';
  const excludeDoctorIds = doctorsWithDeeplink.map((item) => item.doctorId);

  //get doctors excluding the above list
  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const doctorsWithOutDeeplink = await doctorRepository.getSeniorDoctorsFromExcludeList(
    excludeDoctorIds
  );

  doctorsWithOutDeeplink.forEach(async (doctordata: Doctor) => {
    const deepLinkAttrs: DeepLinkInput = generateDeepLinkBody(doctordata);
    const deepLink = await getDeeplink(deepLinkAttrs, doctordata.doctorType);
    const refreshDays = ApiConstants.LINK_TTL ? parseInt(ApiConstants.LINK_TTL, 10) : 0;
    const refreshDate = addDays(new Date(), refreshDays);

    const linkDetails = deepLink.split('/');
    const shortId = linkDetails[linkDetails.length - 1];

    const templateId =
      doctordata.doctorType == DoctorType.DOCTOR_CONNECT
        ? ApiConstants.DOCTOR_DEEPLINK_TEMPLATE_ID_NON_APOLLO.toString()
        : ApiConstants.DOCTOR_DEEPLINK_TEMPLATE_ID_APOLLO.toString();

    //insert link data
    const dataAttributes: Partial<Deeplink> = {
      shortId: shortId,
      linkRefreshDate: refreshDate,
      campaignName: deepLinkAttrs.data.c,
      channelName: deepLinkAttrs.data.af_channel,
      deepLink: deepLink,
      doctorId: doctordata.id,
      partnerId: deepLinkAttrs.data.pid,
      referralCode: deepLinkAttrs.data.af_sub1,
      templateId: templateId,
      type: DeepLinkType.DOCTOR,
    };

    await linkRepository.createDeeplink(dataAttributes);
  });

  return 'Data Insertion Completed :)';
};

export const deepLinkResolvers = {
  Mutation: {
    upsertDoctorsDeeplink,
    insertBulkDeepLinks,
    generateDeepLinksByCron,
    refreshDoctorDeepLinks,
  },
};
