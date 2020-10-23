import gql from 'graphql-tag';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { Resolver } from 'api-gateway';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { ApiConstants } from 'ApiConstants';
import { DoctorPricing } from 'doctors-service/entities/doctorPricing';
import { DoctorPricingRepository } from 'doctors-service/repositories/doctorPricing';
import { log } from 'customWinstonLogger';

export const addDoctorPricingTypeDefs = gql`
  type addDoctorPricingOutput {
    success: Boolean
  }
  input DoctorPricingInput {
    slashed_price: Float!
    available_to: PLAN!
    group_plan: String!
    start_date: Date!
    end_date: Date!
    status: PLAN_STATUS!
    doctor_share: Float!
    apollo_share: Float!
    mrp: Float!
    appointment_type: CARE_APPOINTMENT_TYPE!
    doctorId: String!
  }

  extend type Mutation {
    addDoctorPricing(
      doctorPricingInput: DoctorPricingInput
    ): addDoctorPricingOutput!
  }
`;
enum PLAN {
  ALL = 'ALL',
  CARE_PLAN = 'CARE_PLAN'
}
enum PLAN_STATUS {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

enum CARE_APPOINTMENT_TYPE {
  ONLINE = 'ONLINE',
  PHYSICAL = 'PHYSICAL'
}
type addDoctorPricingOutput = {
  success: boolean
};

type DoctorPricingInput = {
  doctorPricingInput: {
    slashed_price: Number,
    available_to: PLAN,
    group_plan: string,
    start_date: Date,
    end_date: Date,
    status: PLAN_STATUS,
    doctor_share: Number,
    apollo_share: Number,
    mrp: Number
    appointment_type: CARE_APPOINTMENT_TYPE
    doctorId: string
  }

}

const addDoctorPricing: Resolver<
  null,
  DoctorPricingInput,
  DoctorsServiceContext,
  addDoctorPricingOutput
> = async (parent, { doctorPricingInput }, { doctorsDb }) => {
  try {
    const { appointment_type, doctorId } = doctorPricingInput;
    const doctorPricingRepository = doctorsDb.getCustomRepository(DoctorPricingRepository);
    // check for any active plans with appointment type
    const getActivePricing = await doctorPricingRepository.getDoctorPricing({ status: PLAN_STATUS.ACTIVE, appointment_type, doctorId });
    if (getActivePricing && getActivePricing.length > 0) {
      throw new AphError(`${AphErrorMessages.ACIVE_DOCTOR_PRICING_EXIST}_${appointment_type}`);
    }
    await doctorPricingRepository.saveDoctorPricing(doctorPricingInput);
    return {
      success: true
    }
  } catch (err) {
    log('doctorServiceLogger', `Error in adding doctorPricing`, 'addDoctorPricing', '', JSON.stringify(err));
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
