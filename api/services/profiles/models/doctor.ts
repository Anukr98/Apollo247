import { Sequelize, Model, DataTypes } from 'sequelize';

// See: http://docs.sequelizejs.com/manual/typescript.html
class DoctorModel extends Model {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  readonly createdAt!: Date;
  readonly updatedAt!: Date;
}

export const Doctor = (sequelize: Sequelize) => {
  DoctorModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'doctors',
    }
  );

  return DoctorModel;
};
