import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { Appointments, STATUS } from 'profiles-service/entity/appointment';
import { ProfilesServiceContext } from 'profiles-service/profiles-service';
import { addMinutes } from 'date-fns'

export const getAvailableSlotsTypeDefs = gql`
  
  input DoctorAvailabilityInput {
    availableDate: Date!
    doctorId: ID!
  }

  type AvailabilityResult {
    availableSlots: [String!]
  }

  extend type Query {
    getDoctorAvailableSlots(DoctorAvailabilityInput: DoctorAvailabilityInput): AvailabilityResult!
  }
`;

type AvailabilityResult = {
    availableSlots: string[];
};

type DoctorAvailabilityInput = {
  availableDate: Date;
  doctorId: string;
};

type AvailabilityInputArgs = { DoctorAvailabilityInput: DoctorAvailabilityInput };

const getDoctorAvailableSlots: Resolver<
  null,
  AvailabilityInputArgs,
  ProfilesServiceContext,
  AvailabilityResult
> = async (parent, { DoctorAvailabilityInput }) => {
    let startTime = new Date(DoctorAvailabilityInput.availableDate.toDateString()+" 09:00")
    const availableSlots = Array(12).fill(0).map(function(){
        const stTime = startTime
        startTime =  addMinutes(startTime,15)
        const stTimeHours = stTime.getHours().toString().padStart(2,'0')
        const stTimeMins = stTime.getMinutes().toString().padStart(2,'0')
        return `${stTimeHours}:${stTimeMins}`
    })
  return { availableSlots };
};

export const getAvailableSlotsResolvers = {
  Query: {
    getDoctorAvailableSlots,
  },
};
