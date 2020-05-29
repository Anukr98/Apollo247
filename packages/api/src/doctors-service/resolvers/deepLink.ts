import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { DeepLinkInput } from 'types/deeplinks';
import { getDeeplink, refreshLink, generateDeepLinkBody } from 'helpers/appsflyer';
import { Deeplink, DeepLinkType } from 'doctors-service/entities';
import { ApiConstants } from 'ApiConstants';
import { DeeplinkRepository } from 'doctors-service/repositories/deepLinkRepository';
import { format, addDays, differenceInDays } from 'date-fns';
import { trim } from 'lodash';

export const deepLinkTypeDefs = gql`
  type Deeplink {
    deepLink: String
  }

  extend type Mutation {
    upsertDoctorsDeeplink(doctorId: String): Deeplink
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

    console.log(differenceInDays(refreshDate, todayDate));
    if (
      differenceInDays(refreshDate, todayDate) > refreshDays - 1 ||
      differenceInDays(refreshDate, todayDate) <= 0
    ) {
      const newRefreshDate = addDays(new Date(), refreshDays);
      const newLink = await refreshLink(linkData);

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
  const deepLink = await getDeeplink(deepLinkAttrs);

  const refreshDate = addDays(new Date(), refreshDays);

  const linkDetails = deepLink.split('/');
  const shortId = linkDetails[linkDetails.length - 1];

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
    templateId: ApiConstants.DOCTOR_DEEPLINK_TEMPLATE_ID.toString(),
    type: DeepLinkType.DOCTOR,
  };
  await linkRepository.createDeeplink(dataAttributes);

  return { deepLink: deepLink };
};

export const deepLinkResolvers = {
  Mutation: {
    upsertDoctorsDeeplink,
  },
};
