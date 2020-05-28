import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { DeepLinkInput, DeepLinkInputData } from 'types/deeplinks';
import { getDeeplink } from 'helpers/appsflyer';

export const deepLinkTypeDefs = gql``;

const addDoctorsDeeplink: Resolver<
  null,
  { doctorId: string },
  DoctorsServiceContext,
  string
> = async (parent, args, { doctorsDb, mobileNumber }) => {
  //get doctors data
  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const doctordata = await doctorRepository.findDoctorByIdWithoutRelations(args.doctorId);
  if (doctordata == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  const deepLinkAttrs: DeepLinkInput = {
    brand_domain: 'apollo247.onelink.me',
    ttl: '31',
    data: {
      pid: 'Doctor patient Download',
      c: '<doctor full name>-<MCI Number>',
      af_channel: 'Doctor Connect',
      af_dp: 'apollopatients://Doctor?<doctor id>',
      af_sub1: '<doctor referral code>',
      af_force_deeplink: 'true',
    },
  };

  getDeeplink(deepLinkAttrs);

  return '';
};

export const deepLinkResolvers = {
  Mutation: {
    addDoctorsDeeplink,
  },
};
