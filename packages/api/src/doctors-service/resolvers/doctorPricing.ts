import gql from 'graphql-tag';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { Resolver } from 'api-gateway';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { ApiConstants } from 'ApiConstants';
import { DoctorPricing } from 'doctors-service/entities/doctorPricing';
import { DoctorPricingRepository } from 'doctors-service/repositories/doctorPricing';

export const addDoctorPricingTypeDefs = gql`
  type addDoctorPricingOutput {
    success: Boolean
  }
  input DoctorPricingInputArgs {
    doctorPricingInput: 
  }

  extend type Mutation {
    addDoctorPricing(
      doctorPricingInput: DoctorPricingInputArgs
    ): addDoctorPricingOutput!
  }
`;
type addDoctorPricingOutput = {
  success: boolean
};
type DoctorPricingInputArgs = {
  doctorPricingInput: DoctorPricing
}

const addDoctorPricing: Resolver<
  null,
  DoctorPricingInputArgs,
  DoctorsServiceContext,
  addDoctorPricingOutput
> = async (parent, { doctorPricingInput }, { doctorsDb }) => {
  try {
    const doctorPricingRepository = doctorsDb.getCustomRepository(DoctorPricingRepository);
    await doctorPricingRepository.saveDoctorPricing(doctorPricingInput);
    return {
      success: true
    }
  } catch (err) {
    console.error("error in adding pricing ", err);
    return {
      success: false
    }
  }
};

export const doctorPricingResolvers = {
  Mutation: {
    addDoctorPricing,
  },
};
