
import Student from "../models/student.js";

//this is for creating user
export const createStudent = async (req, res) => {

    try {
        const {fullName, email, password} = req.body;

        const student = await Student.create({fullName, email, password});
        req.status(201).json({message: "student created successfully", student})
    }catch(err){
        console.error( err);
        res.status(500).json({error:"failed to create student"})
    }
};

//this is to get users
export const getStudents = async (req, res) => {
    try{
        const students = await Student.findAll();
        res.json(students);

    }catch (err) {
        console.error( err);
        res.status(500).json({error:"failed to fetch students"})
    }

}