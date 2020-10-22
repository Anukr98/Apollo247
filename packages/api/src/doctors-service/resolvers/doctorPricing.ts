// import gql from 'graphql-tag';
// import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
// import { Resolver } from 'api-gateway';
// import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
// import { AphError } from 'AphError';
// import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
// import { ApiConstants } from 'ApiConstants';
// import { DoctorPricing } from 'doctors-service/entities/doctorPricing';

// export const addDoctorPricingTypeDefs = gql`
//   type addDoctorPricingOutput {
//     success: Boolean
//   }
//   input DoctorPricingInputArgs {
//     doctorPricingInput: 
//   }

//   extend type Mutation {
//     addDoctorPricing(
//       doctorPricingInput: DoctorPricingInputArgs
//     ): addDoctorPricingOutput!
//   }
// `;
// type addDoctorPricingOutput = {
//   success: boolean
// };
// type DoctorPricingInputArgs = {
//   doctorPricingInput: DoctorPricing
// }

// const addDoctorPricing: Resolver<
//   null,
//   {},
//   DoctorsServiceContext,
//   addDoctorPricingOutput
// > = async (parent, args, { doctorsDb }) => {
//   try {
//     // const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
//     // await doctorRepository.addDoctorPricing(doctorPricingInput);
//     return {
//       success: true
//     }
//   } catch (err) {
//     console.error("error in adding pricing ", err);
//     return {
//       success: false
//     }
//   }
// };

// export const doctorPricingResolvers = {
//   Mutation: {
//     addDoctorPricing,
//   },
// };
