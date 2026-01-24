import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import bcrypt from "bcryptjs";

const HOD = sequelize.define(
    "HOD",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        fullName: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: "full_name", // Map to snake_case column
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        department: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        profileImage: {
            type: DataTypes.STRING,
            allowNull: true,
            field: "profile_image", // Map to snake_case
        },
    },
    {
        tableName: "h_o_ds",
        timestamps: true,
        hooks: {
            beforeCreate: async (hod) => {
                if (hod.password) {
                    const salt = await bcrypt.genSalt(10);
                    hod.password = await bcrypt.hash(hod.password, salt);
                }
            },
            beforeUpdate: async (hod) => {
                if (hod.changed("password")) {
                    const salt = await bcrypt.genSalt(10);
                    hod.password = await bcrypt.hash(hod.password, salt);
                }
            },
        },
    }
);

HOD.prototype.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

export default HOD;