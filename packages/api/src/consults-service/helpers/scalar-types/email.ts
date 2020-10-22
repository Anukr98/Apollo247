import { GraphQLError, GraphQLScalarType } from 'graphql';
import { isEmailValid } from '@aph/universal/dist/aphValidators';

const emailValidator = (value: string) => {
    if (isEmailValid(value)) {
        return value;
    }
    throw new GraphQLError("Invalid value for email id");
}

export const Email = new GraphQLScalarType({
    name: "Email",
    description: "Email type",
    serialize: value => emailValidator(value),
    parseValue: value => emailValidator(value),

})

