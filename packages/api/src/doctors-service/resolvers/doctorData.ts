import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { DoctorSpecialtyRepository } from 'doctors-service/repositories/doctorSpecialtyRepository';
import { DoctorSpecialty, Doctor } from 'doctors-service/entities';

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

  console.log(finalSpecialtiesList);
  //specialty ends

  //insert doctor starts
  doctorData.forEach((element: any) => {
    const filteredSpecialty = finalSpecialtiesList.filter(
      (specialty) => element.SPECIALITY == specialty.name
    );
    //if (filteredSpecialty.length > 0) element.SPECIALITY = filteredSpecialty[0].id;
    element.SPECIALITY = filteredSpecialty[0].id;
  });
  //console.log(doctorData);

  const formatedDoctorData = doctorData.map((element: any) => {
    const DoctorDetails: Partial<Doctor> = {};
    DoctorDetails.salutation = element.TITLE;
    DoctorDetails.fullName = element.FULLNAME;
  });

  console.log(formatedDoctorData);
  //insert doctor ends

  //hospital details starts
  /*const hospitals = doctorData.map((row: any) => {
    return {
      name: row.PHYSICALCONSULTATIONLOCATIONNAME,
      streetLine1: row.PHYSICALCONSULTATIONLOCATIONADDRESS,
      city: row.PHYSICALCONSULTATIONLOCATIONCITY,
      state: row.PHYSICALCONSULTATIONLOCATIONSTATE,
      country: row.PHYSICALCONSULTATIONLOCATIONCOUNTRY,
    };
  });
  const uniqueHospitals = Array.from(new Set(hospitals)); */
  //console.log('uniqueHospitals', uniqueHospitals);
  //hospital details ends

  return "I'm in progress";
};
//insert data features ends here

export const doctorDataResolvers = {
  Query: { insertData },
};
