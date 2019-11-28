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
    medicineTimings: [MEDICINE_TIMINGS]
    medicineToBeTaken: [MEDICINE_TO_BE_TAKEN]
    medicineName: String!
    doctorId: ID
    id: ID!
  }

  input UpdateDoctorsFavouriteMedicineInput {
    externalId: String
    medicineConsumptionDurationInDays: Int
    medicineDosage: String
    medicineUnit: String
    medicineInstructions: String
    medicineTimings: [MEDICINE_TIMINGS]!
    medicineToBeTaken: [MEDICINE_TO_BE_TAKEN]
    medicineName: String!
    id: ID!
  }

  type FavouriteMedicineList {
    medicineList: [DoctorFavouriteMedicine]
  }

  extend type Query {
    getDoctorFavouriteMedicineList: FavouriteMedicineList
  }

  extend type Mutation {
    saveDoctorsFavouriteMedicine(
      saveDoctorsFavouriteMedicineInput: SaveDoctorsFavouriteMedicineInput
    ): FavouriteMedicineList!
    removeFavouriteMedicine(id: String): FavouriteMedicineList!
    updateDoctorFavouriteMedicine(
      updateDoctorsFavouriteMedicineInput: UpdateDoctorsFavouriteMedicineInput
    ): FavouriteMedicineList
  }
`;

type FavouriteMedicineList = {
  medicineList: DoctorsFavouriteMedicine[];
};

type SaveDoctorsFavouriteMedicineInput = {
  externalId: string;
  medicineConsumptionDurationInDays: number;
  medicineDosage: string;
  medicineUnit: string;
  medicineInstructions: string;
  medicineTimings: MEDICINE_TIMINGS[];
  medicineToBeTaken: MEDICINE_TO_BE_TAKEN[];
  medicineName: string;
  doctorId: string;
};

type saveDoctorsFavouriteMedicineInputArgs = {
  saveDoctorsFavouriteMedicineInput: SaveDoctorsFavouriteMedicineInput;
};

const saveDoctorsFavouriteMedicine: Resolver<
  null,
  saveDoctorsFavouriteMedicineInputArgs,
  DoctorsServiceContext,
  FavouriteMedicineList
> = async (parent, { saveDoctorsFavouriteMedicineInput }, { doctorsDb, mobileNumber }) => {
  //doctor check
  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const doctordata = await doctorRepository.findById(saveDoctorsFavouriteMedicineInput.doctorId);
  if (doctordata == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  if (saveDoctorsFavouriteMedicineInput.medicineName.length == 0)
    throw new AphError(AphErrorMessages.INVALID_ENTITY);

  const favouriteMedicineRepo = doctorsDb.getCustomRepository(DoctorFavouriteMedicineRepository);

  //check for medicine name exsitence
  const getMedicineByName = await favouriteMedicineRepo.getFavouriteMedicineByName(
    saveDoctorsFavouriteMedicineInput.medicineName.toLowerCase(),
    doctordata.id
  );
  if (getMedicineByName !== null && getMedicineByName.length > 0)
    throw new AphError(AphErrorMessages.MEDICINE_ALREADY_EXIST);

  //add fav medicine
  const saveDoctorFavouriteMedicineAttrs: Partial<DoctorsFavouriteMedicine> = {
    ...saveDoctorsFavouriteMedicineInput,
    doctor: doctordata,
  };
  await favouriteMedicineRepo.saveDoctorFavouriteMedicine(saveDoctorFavouriteMedicineAttrs);

  const favouriteTestRepo = doctorsDb.getCustomRepository(DoctorFavouriteMedicineRepository);
  const favouriteTestList = await favouriteTestRepo.favouriteMedicines(doctordata.id);
  return { medicineList: favouriteTestList };
};

const getDoctorFavouriteMedicineList: Resolver<
  null,
  {},
  DoctorsServiceContext,
  FavouriteMedicineList
> = async (parent, args, { mobileNumber, doctorsDb, consultsDb, firebaseUid }) => {
  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const doctordata = await doctorRepository.findByMobileNumber(mobileNumber, true);
  if (doctordata == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  const favouriteTestRepo = doctorsDb.getCustomRepository(DoctorFavouriteMedicineRepository);
  const favouriteTestList = await favouriteTestRepo.favouriteMedicines(doctordata.id);
  return { medicineList: favouriteTestList };
};

const removeFavouriteMedicine: Resolver<
  null,
  { id: string },
  DoctorsServiceContext,
  FavouriteMedicineList
> = async (parent, args, { mobileNumber, doctorsDb }) => {
  const favouriteMedicineRepo = doctorsDb.getCustomRepository(DoctorFavouriteMedicineRepository);

  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const doctordata = await doctorRepository.findByMobileNumber(mobileNumber, true);
  if (doctordata == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  // check if id exists or not
  const checkid = await favouriteMedicineRepo.findById(args.id);
  if (checkid == null) throw new AphError(AphErrorMessages.INVALID_FAVOURITE_ID);

  //delete medicine
  await favouriteMedicineRepo.removeFavouriteMedicineById(args.id);

  const doctorsOtherFavouriteMedicines = await favouriteMedicineRepo.favouriteMedicines(<string>(
    doctordata.id
  ));

  return { medicineList: doctorsOtherFavouriteMedicines };
};

type UpdateDoctorsFavouriteMedicineInput = {
  externalId: string;
  medicineConsumptionDurationInDays: number;
  medicineDosage: string;
  medicineUnit: string;
  medicineInstructions: string;
  medicineTimings: MEDICINE_TIMINGS[];
  medicineToBeTaken: MEDICINE_TO_BE_TAKEN[];
  medicineName: string;
  id: string;
};

type UpdateDoctorsFavouriteMedicineInputArgs = {
  updateDoctorsFavouriteMedicineInput: UpdateDoctorsFavouriteMedicineInput;
};

const updateDoctorFavouriteMedicine: Resolver<
  null,
  UpdateDoctorsFavouriteMedicineInputArgs,
  DoctorsServiceContext,
  FavouriteMedicineList
> = async (parent, { updateDoctorsFavouriteMedicineInput }, { doctorsDb, mobileNumber }) => {
  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const doctordata = await doctorRepository.findByMobileNumber(mobileNumber, true);
  if (doctordata == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  if (updateDoctorsFavouriteMedicineInput.medicineName.length == 0)
    throw new AphError(AphErrorMessages.INVALID_ENTITY);

  //check if id exists or not
  const favouriteMedicineRepo = doctorsDb.getCustomRepository(DoctorFavouriteMedicineRepository);
  const checkId = await favouriteMedicineRepo.findById(updateDoctorsFavouriteMedicineInput.id);
  if (checkId == null) throw new AphError(AphErrorMessages.INVALID_FAVOURITE_ID);

  //check for medicine name exsitence
  const getMedicineByName = await favouriteMedicineRepo.checkMedicineNameWhileUpdate(
    updateDoctorsFavouriteMedicineInput.medicineName.toLowerCase(),
    updateDoctorsFavouriteMedicineInput.id
  );
  if (getMedicineByName !== null && getMedicineByName.length > 0)
    throw new AphError(AphErrorMessages.MEDICINE_ALREADY_EXIST);

  //update medicine
  await favouriteMedicineRepo.updateFavouriteMedicine(
    updateDoctorsFavouriteMedicineInput.id,
    updateDoctorsFavouriteMedicineInput
  );

  //get medicine list
  const doctorsOtherFavouriteMedicines = await favouriteMedicineRepo.favouriteMedicines(
    doctordata.id
  );

  return { medicineList: doctorsOtherFavouriteMedicines };
};

export const saveDoctorFavouriteMedicineResolver = {
  Query: {
    getDoctorFavouriteMedicineList,
  },
  Mutation: {
    saveDoctorsFavouriteMedicine,
    removeFavouriteMedicine,
    updateDoctorFavouriteMedicine,
  },
};
