import gql from 'graphql-tag';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { Resolver } from 'api-gateway';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { uploadFileToBlobStorage } from 'helpers/uploadFileToBlob';

export const uploadDoctorSignatureTypeDefs = gql`
  type uploadDoctorSignatureResult {
    filePath: String
  }

  extend type Mutation {
    uploadDoctorSignature(
      doctorId: String!
      fileType: String!
      base64FileInput: String!
    ): uploadDoctorSignatureResult!
  }
`;
type uploadDoctorSignatureResult = {
  filePath: string;
};

const uploadDoctorSignature: Resolver<
  null,
  { doctorId: string; fileType: string; base64FileInput: string },
  DoctorsServiceContext,
  uploadDoctorSignatureResult
> = async (parent, args, { doctorsDb }) => {
  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const doctordata = await doctorRepository.findDoctorByIdWithoutRelations(args.doctorId);
  if (!doctordata) throw new AphError(AphErrorMessages.INVALID_DOCTOR_ID);
  const filePath = await uploadFileToBlobStorage(args.fileType, args.base64FileInput);
  doctorRepository.updateDoctorSignature(args.doctorId, filePath);

  return { filePath };
};

export const uploadDoctorSignatureResolvers = {
  Mutation: {
    uploadDoctorSignature,
  },
};
