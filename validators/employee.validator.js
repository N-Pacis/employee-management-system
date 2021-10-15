const Joi = require('joi');
const { Employee} = require("../models/employee.model")
const _ = require("lodash")

exports.validateEmployee = async(req,res,next) => {

    const schema = Joi.object({
        Name: Joi.string().min(5).required(),
        NationalId: Joi.number().min(16).required(),
        Phone: Joi.number().min(10).required(),
        DateOfBirth: Joi.date().required(),
        Email: Joi.string().min(5).required(),
        Position: Joi.string().uppercase().valid('DEVELOPER', 'DESIGNER', 'TESTER', 'DEVOPS').required()
    })
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            error: error.message,
            message: "Unable to register the employee."
        })
    }
    let checkEmail = await Employee.findOne({ Email: req.body.Email })
    if (checkEmail) return res.status(400).send("Email is already registered!")

    let checkNationalID = await Employee.findOne({ NationalId: req.body.NationalId })
    if (checkNationalID) return res.status(400).send("National Id is already registered!")

    if ((req.body.NationalId).length < 16 || (req.body.NationalId).length > 16) return res.status(400).send("National ID must be 16 characters!")

    let checkPhone = await Employee.findOne({ Phone: req.body.Phone })
    if (checkPhone) return res.status(400).send("Phone Number is already registered!")
    if ((req.body.Phone).length < 10 || (req.body.Phone).length > 10) return res.status(400).send("Phone Number must be 10 characters!")
    req.body.Phone = (req.body.Phone).toString()
    let validRwandanPhoneNumbers = ['078', '079', '072', '073']
    let first3Characters = (req.body.Phone.toString()).substring(0, 3)
    if (validRwandanPhoneNumbers.includes(first3Characters) != true) {
        return res.status(400).send("Phone Number must be a valid Rwandan Phone Number!")
    }

    if (req.body.DateOfBirth) {
        let date = new Date(req.body.DateOfBirth).getFullYear()
        let today = new Date()
        if ((today.getFullYear() - date) < 18) {
            return res.status(400).send("You are not eligible to register the employee because the provided age is less than 18 years")
        }
    }
    return next()
}

exports.validateEmployeeRegistrationByFileUpload = async(employeeInfo,recordNO) => {
    const schema = Joi.object({
        Name: Joi.string().min(5).required(),
        NationalId: Joi.number().min(16).required(),
        Phone: Joi.number().min(10).required(),
        DateOfBirth: Joi.date().required(),
        Email: Joi.string().min(5).required(),
        Status: Joi.string().uppercase().valid('ACTIVE', 'INACTIVE').required(),
        Position: Joi.string().uppercase().valid('DEVELOPER', 'DESIGNER', 'TESTER', 'DEVOPS').required()
    })
    const { error } = schema.validate(employeeInfo);
    if (error) {
        return ({
            type: `Error for the employee on row ${recordNO}`,
            error: error.message,
        })
    }
    let checkEmail = await Employee.findOne({ Email: employeeInfo.Email })
    if (checkEmail) return ({type: `Error for the employee on row ${recordNO}`,message:"Email is already registered!"})

    let checkNationalID = await Employee.findOne({ NationalId: employeeInfo.NationalId })
    if (checkNationalID) return ({type: `Error for the employee on row ${recordNO}`,message:`The NationalId number '${employeeInfo.NationalId}' is already registered!`})

    if ((employeeInfo.NationalId).length < 16 || (employeeInfo.NationalId).length > 16) return ({type: `Error for the employee on row ${recordNO}`,message:`The NationalId number '${employeeInfo.NationalId}' must be 16 characters`})

    let checkPhone = await Employee.findOne({ Phone: employeeInfo.Phone })
    if (checkPhone) return ({type: `Error for the employee on row ${recordNO}`,message:`Phone Number:'${employeeInfo.Phone}' is already registered!`})
    if ((employeeInfo.Phone).length < 10 || (employeeInfo.Phone).length > 10) return({type: `Error for the employee on row ${recordNO}`,message:`Phone Number:'${employeeInfo.Phone}' must be 10 characters!`})
    employeeInfo.Phone = (employeeInfo.Phone).toString()
    let validRwandanPhoneNumbers = ['078', '079', '072', '073']
    let first3Characters = (employeeInfo.Phone.toString()).substring(0, 3)
    if (validRwandanPhoneNumbers.includes(first3Characters) != true) {
        return ({type: `Error for the employee on row ${recordNO}`,message:`Phone Number:'${employeeInfo.Phone}' must be a valid Rwandan Phone Number!`})
    }

    if (employeeInfo.DateOfBirth) {
        let date = new Date(employeeInfo.DateOfBirth).getFullYear()
        let today = new Date()
        if ((today.getFullYear() - date) < 18) {
            return ({type: `Error for the employee on row ${recordNO}`,message:`You are not eligible to register the employee with the date of birth of:'${employeeInfo.DateOfBirth}' because the provided age is less than 18 years`})
        }
    }
    return({type:'success',message:'Validation Complete'})
}