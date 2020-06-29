import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { DoctorSpecialtyRepository } from 'doctors-service/repositories/doctorSpecialtyRepository';
import {
  DoctorSpecialty,
  Doctor,
  FacilityType,
  DoctorAndHospital,
  ConsultType,
  CityPincodeMapper,
} from 'doctors-service/entities';
import {
  DoctorRepository,
  CityPincodeMapperRepository,
} from 'doctors-service/repositories/doctorRepository';
import { FacilityRepository } from 'doctors-service/repositories/facilityRepository';
import path from 'path';
import { DoctorHospitalRepository } from 'doctors-service/repositories/doctorHospitalRepository';
import { DoctorConsultHoursRepository } from 'doctors-service/repositories/doctorConsultHoursRepository';
import { ApiConstants } from 'ApiConstants';

export const doctorDataTypeDefs = gql`
  extend type Query {
    insertData: String
    insertPincodeData: String
    seniorDoctorCount: Int
    juniorDoctorCount: Int
  }
`;
const getRepos = ({ doctorsDb }: DoctorsServiceContext) => ({
  docRepo: doctorsDb.getCustomRepository(DoctorRepository),
});
const seniorDoctorCount: Resolver<
  null,
  { docOffset: number; docLimit: number },
  DoctorsServiceContext,
  number
> = async (parent, args, context) => {
  const { docRepo } = getRepos(context);
  const seniorCount = await docRepo.getSeniorDoctorCount();
  return seniorCount;
};
const juniorDoctorCount: Resolver<
  null,
  { docOffset: number; docLimit: number },
  DoctorsServiceContext,
  number
> = async (parent, args, context) => {
  const { docRepo } = getRepos(context);
  const juniorCount = await docRepo.getJuniorDoctorCount();
  return juniorCount;
};
const insertData: Resolver<null, {}, DoctorsServiceContext, string> = async (
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
    sourceFile: assetsDir + '/doctorsData.xlsx',
    sheets: [
      {
        name: 'sheet1',
        header: {
          rows: 1,
        },
        columnToKey: {
          A: 'FULLNAME',
          B: 'TYPE',
          c: 'TITLE',
          D: 'FIRSTNAME',
          E: 'MIDDLENAME',
          F: 'LASTNAME',
          G: 'GENDER',
          H: 'EDUCATION',
          I: 'EXPERIRNCE',
          J: 'SPECIALITY',
          K: 'LANGUAGES',
          L: 'PHYSICALCONSULTATIONLOCATIONNAME',
          M: 'PHYSICALCONSULTATIONLOCATIONADDRESS',
          N: 'PHYSICALCONSULTATIONLOCATIONCITY',
          O: 'PHYSICALCONSULTATIONLOCATIONSTATE',
          P: 'PHYSICALCONSULTATIONLOCATIONZIP',
          Q: 'PHYSICALCONSULTATIONLOCATIONCOUNTRY',
          R: 'CONSULTATIONMODE',
          S: 'ONLINECONSULTATIONFEES',
          T: 'PHYSICALCONSULTATIONFEES',
          U: 'MCINO',
          V: 'AWARDS',
          W: 'AVAILABILITY',
          X: 'WEEKDAYS',
          Y: 'PHONE',
          Z: 'EMAIL',
          AA: 'SECRETARYNAME',
          AB: 'SECRETARYNUMBER',
          AC: 'IMAGEURL',
          AD: 'THUMBNAILURL',
          AE: 'DISPLAYNAME',
          AF: 'SALUTATION',
        },
      },
      {
        name: 'sheet2',
        header: {
          rows: 1,
        },
        columnToKey: {
          A: 'name',
          B: 'userFriendlyNomenclature',
          C: 'specialistSingularTerm',
          D: 'specialistPluralTerm',
          E: 'image',
          F: 'displayOrder',
        },
      },
    ],
  });
  const specialtyData = rowData.sheet2;
  const doctorData = rowData.sheet1;

  //Specialty starts
  const specialtyRepo = doctorsDb.getCustomRepository(DoctorSpecialtyRepository);
  const existingSpecialties = await specialtyRepo.findAll();

  const existingSpecialtyNames = existingSpecialties.map((row: DoctorSpecialty) => {
    return row.name;
  });

  const newSpecialties = specialtyData.filter(
    (e: DoctorSpecialty) => existingSpecialtyNames.indexOf(e.name) == -1
  );

  const partialSpecialtyList = existingSpecialties.map((element) => {
    return { id: element.id, name: element.name };
  });

  const addedSpecialty = await specialtyRepo.insertOrUpdateAllSpecialties(newSpecialties);
  const partialAddedSpecialtyList = addedSpecialty.map((element) => {
    return { id: element.id, name: element.name };
  });

  const finalSpecialtiesList = Object.assign(partialSpecialtyList, partialAddedSpecialtyList);
  //specialty ends

  //hospital details starts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hospitals = doctorData.map((row: any) => {
    return {
      name: row.PHYSICALCONSULTATIONLOCATIONNAME,
      streetLine1: row.PHYSICALCONSULTATIONLOCATIONADDRESS,
      city: row.PHYSICALCONSULTATIONLOCATIONCITY,
      state: row.PHYSICALCONSULTATIONLOCATIONSTATE,
      country: row.PHYSICALCONSULTATIONLOCATIONCOUNTRY,
      facilityType: FacilityType.HOSPITAL,
    };
  });

  const facilityRepo = doctorsDb.getCustomRepository(FacilityRepository);
  const facilitiesResult = await facilityRepo.insertOrUpdateAllFacilities(hospitals);
  console.log('FacilityResult >>>>>>:: ', facilitiesResult);
  //hospital details ends

  //insert doctor starts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await doctorData.map((element: any) => {
    //mapping specialties
    finalSpecialtiesList.forEach((specialty) => {
      if (element.SPECIALITY == specialty.name) {
        element.SPECIALITY = specialty.id;
        return;
      }
    });
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatedDoctorData = doctorData.map((element: any) => {
    const doctorProfilePhoto =
      typeof element.IMAGEURL == 'undefined'
        ? 'https://prodaphstorage.blob.core.windows.net/doctors/no_photo.png'
        : element.IMAGEURL;

    const thumbnail =
      typeof element.THUMBNAILURL == 'undefined'
        ? 'https://prodaphstorage.blob.core.windows.net/doctors/no_photo.png'
        : element.THUMBNAILURL;

    const DoctorDetails: Partial<Doctor> = {};
    DoctorDetails.salutation = element.SALUTATION;
    DoctorDetails.fullName = element.FULLNAME;
    DoctorDetails.doctorType = element.TYPE;
    DoctorDetails.firstName = element.FIRSTNAME;
    DoctorDetails.middleName = element.MIDDLENAME == 'undefined' ? '' : element.MIDDLENAME;
    DoctorDetails.lastName = element.LASTNAME || '';
    DoctorDetails.gender = element.GENDER;
    DoctorDetails.qualification = element.EDUCATION;
    DoctorDetails.experience = element.EXPERIRNCE;
    DoctorDetails.languages = element.LANGUAGES;
    DoctorDetails.isActive = true;
    DoctorDetails.photoUrl = doctorProfilePhoto;
    DoctorDetails.onlineConsultationFees = element.ONLINECONSULTATIONFEES || 0;
    DoctorDetails.physicalConsultationFees = element.PHYSICALCONSULTATIONFEES || 0;
    DoctorDetails.registrationNumber =
      !element.MCINO || element.MCINO == 'undefined' ? '' : element.MCINO;
    DoctorDetails.awards = element.AWARDS;
    DoctorDetails.mobileNumber = element.PHONE;
    DoctorDetails.specialty = element.SPECIALITY;
    DoctorDetails.emailAddress = '';
    if (element.EMAIL && element.EMAIL.length > 0)
      DoctorDetails.emailAddress =
        process.env.NODE_ENV === 'production' ? element.EMAIL : element.EMAIL + ' .popcornapps.com';
    DoctorDetails.delegateName = element.SECRETARYNAME == 'undefined' ? '' : element.SECRETARYNAME;
    DoctorDetails.delegateNumber =
      element.SECRETARYNUMBER == 'undefined' ? '' : element.SECRETARYNUMBER;
    DoctorDetails.thumbnailUrl = thumbnail;
    DoctorDetails.displayName = element.DISPLAYNAME;
    return DoctorDetails;
  });
  console.log('DoctorsData >>>>>>>', formatedDoctorData);

  //Doctor starts
  const doctorRepo = doctorsDb.getCustomRepository(DoctorRepository);
  const doctorInsertResult = await doctorRepo.insertOrUpdateAllDoctors(formatedDoctorData);
  //doctor Hospital

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await doctorData.map((element: any) => {
    //mapping specialties
    doctorInsertResult.forEach((doctor) => {
      if (element.PHONE == doctor.mobileNumber) {
        element.FULLNAME = doctor.id;
        return;
      }
    });
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await doctorData.map((element: any) => {
    //mapping specialties
    facilitiesResult.forEach((facility) => {
      if (element.PHYSICALCONSULTATIONLOCATIONNAME == facility.name) {
        element.PHYSICALCONSULTATIONLOCATIONNAME = facility.id;
        return;
      } else if (
        typeof element.PHYSICALCONSULTATIONLOCATIONNAME == 'undefined' &&
        facility.name == ''
      ) {
        element.PHYSICALCONSULTATIONLOCATIONNAME = facility.id;
        return;
      }
    });
  });

  const virtualHospital = facilitiesResult.filter((element) => element.name == '');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dostorHospital: Partial<DoctorAndHospital>[] = await doctorData.map((element: any) => {
    return {
      doctor: element.FULLNAME,
      facility:
        typeof element.PHYSICALCONSULTATIONLOCATIONNAME == 'undefined'
          ? virtualHospital[0].id
          : element.PHYSICALCONSULTATIONLOCATIONNAME,
    };
  });

  //DoctorAndHospital Map Table insertion
  const doctorHospitalRepo = doctorsDb.getCustomRepository(DoctorHospitalRepository);
  const doctorHospitalResult = await doctorHospitalRepo.insertDoctorAndHospitals(dostorHospital);

  console.log('DoctorHospitalResult >>>>>>:: ', dostorHospital);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const consultHours: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  doctorData.forEach((element: any) => {
    //mapping specialties
    doctorHospitalResult.forEach((docFacility) => {
      if (element.FULLNAME == docFacility.doctor) {
        consultHours.push({
          doctor: element.FULLNAME,
          doctorHospital: docFacility.id,
          facility: element.PHYSICALCONSULTATIONLOCATIONNAME,
          consultMode: element.CONSULTATIONMODE,
          consultType: ConsultType.FIXED,
          availability: element.AVAILABILITY,
          weekDays: element.WEEKDAYS,
        });
      }
    });
  });

  const consultHoursRepo = doctorsDb.getCustomRepository(DoctorConsultHoursRepository);
  const consultHoursResult = await consultHoursRepo.insertOrUpdateAllConsultHours(consultHours);

  console.log('ConsultHoursLength: ', consultHoursResult.length);
  console.log('Reference ConsultHours Record:', consultHoursResult[0]);
  return 'Data Insertion Completed :)';
};
//insert data features ends here

const insertPincodeData: Resolver<null, {}, DoctorsServiceContext, string> = async (
  parent,
  args,
  { doctorsDb }
) => {
  const excelToJson = require('convert-excel-to-json');
  let assetsDir = path.resolve(ApiConstants.ASSETS_DIR);
  if (process.env.NODE_ENV != 'local') {
    assetsDir = path.resolve(<string>process.env.ASSETS_DIRECTORY);
  }
  const rowData = excelToJson({
    sourceFile: assetsDir + '/pincodeData.xlsx',
    header: {
      rows: 1,
    },
    sheets: [
      {
        name: 'Sheet1',
        columnToKey: {
          A: 'facilityId',
          B: 'pincode',
          c: 'place',
          D: 'city',
          E: 'demo',
          F: 'district',
          G: 'region',
          H: 'demo2',
          I: 'zone',
        },
      },
    ],
  });
  const pincodes: string[] = [];
  const cityPincodeMapperRepositoryRepo = doctorsDb.getCustomRepository(
    CityPincodeMapperRepository
  );
  rowData.Sheet1.map(async (row: Partial<CityPincodeMapper>) => {
    if (row.pincode) {
      const flag = pincodes.includes(row.pincode);
      if (!flag) {
        pincodes.push(row.pincode);
      }
      await cityPincodeMapperRepositoryRepo.addPincodeDetails(row, flag);
    }
  });

  return ApiConstants.PINCODE_API_RESPONSE.toString();
};

export const doctorDataResolvers = {
  Query: { insertData, insertPincodeData, seniorDoctorCount, juniorDoctorCount },
};
