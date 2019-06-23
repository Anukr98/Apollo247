import { Sequelize, Model, DataTypes } from 'sequelize';

export enum Sex {
  FEMALE = 'FEMALE',
  MALE = 'MALE',
  NOT_APPLICABLE = 'NOT_APPLICABLE',
  NOT_KNOWN = 'NOT_KNOWN',
  OTHER = 'OTHER',
}

// See: http://docs.sequelizejs.com/manual/typescript.html
export class PatientModel extends Model {
  id: number;
  firstName: string;
  lastName: string;
  sex: Sex;
  mobileNumber: string;
  readonly createdAt!: Date;
  readonly updatedAt!: Date;
}

export const Patient = (sequelize: Sequelize) => {
  PatientModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      firebaseId: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      firstName: {
        type: DataTypes.STRING,
      },
      lastName: {
        type: DataTypes.STRING,
      },
      sex: {
        type: DataTypes.ENUM('FEMALE', 'MALE', 'NOT_APPLICABLE', 'NOT_KNOWN', 'OTHER'),
      },
      mobileNumber: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      tableName: 'patients',
    }
  );

  return PatientModel;
};
