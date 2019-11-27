import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import {
  DoctorsFavouriteMedicine,
  MEDICINE_TIMINGS,
  MEDICINE_TO_BE_TAKEN,
} from 'doctors-service/entities';
import { DoctorFavouriteMedicineRepository } from 'doctors-service/repositories/doctorFavouriteMedicineRepository';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

export const saveDoctorFavouriteMedicineTypeDefs = gql`
  enum MEDICINE_TIMINGS {
    EVENING
    MORNING
    NIGHT
    NOON
  }

  enum MEDICINE_TO_BE_TAKEN {
    AFTER_FOOD
    BEFORE_FOOD
  }

  input SaveDoctorsFavouriteMedicineInput {
    externalId: String
    medicineConsumptionDurationInDays: Int!
    medicineDosage: String!
    medicineUnit: String!
    medicineInstructions: String
    medicineTimings: [MEDICINE_TIMINGS]!
    medicineToBeTaken: [MEDICINE_TO_BE_TAKEN]
    medicineName: String!
    doctorId: ID!
  }

  type DoctorFavouriteMedicine {
    externalId: String
    medicineConsumptionDurationInDays: Int
    medicineDosage: String
    medicineUnit: String
    medicineInstructions: String
    medicineTimings: MEDICINE_TIMINGS
    medicineToBeTaken: MEDICINE_TO_BE_TAKEN
    medicineName: String!
    doctorId: ID
    id: ID!
  }

  type DoctorFavouriteMedicineResult {
    favouriteMedicine: DoctorFavouriteMedicine
  }

  extend type Mutation {
    saveDoctorsFavouriteMedicine(
      saveDoctorsFavouriteMedicineInput: SaveDoctorsFavouriteMedicineInput
    ): DoctorFavouriteMedicineResult!
  }
`;

type SaveDoctorsFavouriteMedicineInput = {
  externalId: string;
  medicineConsumptionDurationInDays: number;
  medicineDosage: string;
  medicineUnit: string;
  medicineInstructions: string;
  medicineTimings: MEDICINE_TIMINGS;
  medicineToBeTaken: MEDICINE_TO_BE_TAKEN;
  medicineName: string;
  doctorId: string;
};

type DoctorFavouriteMedicineResult = {
  favouriteMedicine: DoctorsFavouriteMedicine;
};

type saveDoctorsFavouriteMedicineInputArgs = {
  saveDoctorsFavouriteMedicineInput: SaveDoctorsFavouriteMedicineInput;
};

const saveDoctorsFavouriteMedicine: Resolver<
  null,
  saveDoctorsFavouriteMedicineInputArgs,
  DoctorsServiceContext,
  DoctorFavouriteMedicineResult
> = async (parent, { saveDoctorsFavouriteMedicineInput }, { doctorsDb, mobileNumber }) => {
  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const doctordata = await doctorRepository.findById(saveDoctorsFavouriteMedicineInput.doctorId);
  if (doctordata == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  const favouriteMedicineRepo = doctorsDb.getCustomRepository(DoctorFavouriteMedicineRepository);
  const saveDoctorFavouriteMedicineAttrs: Partial<DoctorsFavouriteMedicine> = {
    ...saveDoctorsFavouriteMedicineInput,
    doctor: doctordata,
  };
  const saveFavouriteMedicine = await favouriteMedicineRepo.saveDoctorFavouriteMedicine(
    saveDoctorFavouriteMedicineAttrs
  );
  return { favouriteMedicine: saveFavouriteMedicine };
};

export const saveDoctorFavouriteMedicineResolver = {
  Mutation: {
    saveDoctorsFavouriteMedicine,
  },
};
