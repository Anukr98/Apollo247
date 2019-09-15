import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { DoctorSpecialtyRepository } from 'doctors-service/repositories/doctorSpecialtyRepository';

export const doctorDataTypeDefs = gql`
  extend type Query {
    insertData: String
  }
`;

const insertData: Resolver<null, {}, DoctorsServiceContext, string> = async (
  parent,
  args,
  { doctorsDb }
) => {
  const excelToJson = require('convert-excel-to-json');
  const rowData = excelToJson({
    sourceFile: '/apollo-hospitals/data/doctorsData.xlsx',
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
        },
      },
    ],
  });

  const specialtyData = rowData.sheet2;
  const doctorData = rowData.sheet1;

  //Specialty starts
  const specialtyRepo = doctorsDb.getCustomRepository(DoctorSpecialtyRepository);
  const existingSpecialties = await specialtyRepo.findAll();
  const existingSpecialtyNames = existingSpecialties.map((row: any) => {
    return row.name;
  });
  console.log('existingSpecialtyNames', existingSpecialtyNames);

  const newSpecialties = specialtyData.filter((e: any) => existingSpecialtyNames.indexOf(e) == -1);
  console.log('newSpecialty', newSpecialties);
  //insert new specialty and get all IDS
  //specialty ends

  //hospital details starts
  const hospitals = doctorData.map((row: any) => {
    return {
      name: row.PHYSICALCONSULTATIONLOCATIONNAME,
      streetLine1: row.PHYSICALCONSULTATIONLOCATIONADDRESS,
      city: row.PHYSICALCONSULTATIONLOCATIONCITY,
      state: row.PHYSICALCONSULTATIONLOCATIONSTATE,
      country: row.PHYSICALCONSULTATIONLOCATIONCOUNTRY,
    };
  });
  const uniqueHospitals = Array.from(new Set(hospitals));
  console.log('uniqueHospitals', uniqueHospitals);
  //hospital details ends

  return "I'm in progress";
};
//insert data features ends here

export const doctorDataResolvers = {
  Query: { insertData },
};
