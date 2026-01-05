import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import bcrypt from "bcryptjs";

const Student = sequelize.define(
    "Student",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        fullName: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        matricNumber: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        department: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        companyName: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        companyAddress: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        assignedSupervisor: {
            type: DataTypes.INTEGER,
            references: {
                model: "institutionsupervisors", // Use string table name
                key: "id",
            },
        },
        assignedIndustrySupervisor: {
            type: DataTypes.INTEGER,
            references: {
                model: "industrysupervisors", // Use string table name
                key: "id",
            },
        },
        isVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        verificationCodeUsed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        phone: {
            type: DataTypes.STRING(20),
        },
        profileImage: {
            type: DataTypes.STRING,
        },
        progress: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            validate: {
                min: 0,
                max: 100,
            },
        },
        status: {
            type: DataTypes.ENUM("ACTIVE", "INACTIVE", "COMPLETED"),
            defaultValue: "ACTIVE",
        },
    },
    {
        tableName: "students",
        timestamps: true,
        hooks: {
            beforeCreate: async (student) => {
                if (student.password) {
                    const salt = await bcrypt.genSalt(10);
                    student.password = await bcrypt.hash(student.password, salt);
                }
            },
            beforeUpdate: async (student) => {
                if (student.changed("password")) {
                    const salt = await bcrypt.genSalt(10);
                    student.password = await bcrypt.hash(student.password, salt);
                }
            },
        },
    }
);

Student.prototype.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

export default Student;