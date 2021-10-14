const { validateRegistration,validateUpdate, Employee} = require("../models/employee.model")
const _ = require("lodash")
const jwt = require('jsonwebtoken')
const { sendEmail } = require("../utils/emailConfig.utils");

exports.getAnEmployee = async(req, res) => {
    try {
        let employee = await Employee.findById(req.params.employeeId).select("-Password");
        if (!employee) return res.status(404).send("Employee not found!")
        return res.send({
            status: 200,
            message: "ok",
            data: employee
        })
    } catch (ex) {
        res.status(400).send(ex.message)
    }
}

exports.searchEmployee = async(req, res) => {
    try {
        let result = [];
        if(req.query.position){
            req.query.category = (req.query.position).toUpperCase()
            let employee = await Employee.find({Position: req.query.position})
            if (employee.length != 0) result.push({message:`Array of the search result for the employees with the position of ${req.query.position}`,data:employee})
        }
        if(req.query.name){
            let employee = await Employee.find({Name: req.query.name})
            if (employee.length != 0) result.push({message:`Array of the search result for the employees by the name of ${req.query.name}`,data:employee})      
        }
        if(req.query.email){
            let employee = await Employee.find({Email: req.query.email})
            if (employee.length != 0) result.push({message:`Array of the search result for the employees with the email of ${req.query.email}`,data:employee})      
        }
        if(req.query.phone){
            let employee = await Employee.find({Phone: req.query.phone})
            if (employee.length != 0) result.push({message:`Array of the search result for the employees with the phone number of ${req.query.phone}`,data:employee})      
        }
        if(req.query.code){
            let employee = await Employee.find({Code: req.query.code})
            if (employee.length != 0) result.push({message:`Array of the search result for the employees with the code of ${req.query.code}`,data:employee})      
        }

        if(result.length == 0){
            return res.status(404).send("Employee not found")
        }
        return res.status(200).send({
            message: "Employee found",
            data:result
        })
    } catch (ex) {
        res.status(400).send(ex.message)
    }
}

exports.getEmployees = async(req, res) => {
    try {
        let employee = await Employee.find({}).select("-Password");
        if (employee.length == 0) return res.status(404).send("You do not have any employees yet!")
        return res.send({
            status: 200,
            message: "ok",
            data: employee
        })
    } catch (ex) {
        res.status(400).send(ex.message)
    }
}

exports.registerEmployee = async(req, res) => {
    try {
        const { error } = validateRegistration(req.body)
        if (error) return res.status(400).send(error.details[0].message)

        let randomCode = Math.floor(1000 + Math.random() * 9000);

        let checkEmail = await Employee.findOne({ Email: req.body.Email })
        if (checkEmail) return res.status(400).send("Email is already registered!")

        let checkNationalID = await Employee.findOne({ NationalId: req.body.NationalId })
        if (checkNationalID) return res.status(400).send("National Id is already registered!")

        if((req.body.NationalId).length < 16 || (req.body.NationalId).length > 16) return res.status(400).send("National ID must be 16 characters!")

        let checkPhone = await Employee.findOne({ Phone: req.body.Phone })
        if (checkPhone) return res.status(400).send("Phone Number is already registered!")
        if((req.body.Phone).length < 10 || (req.body.Phone).length > 10) return res.status(400).send("Phone Number must be 10 characters!")
        req.body.Phone = (req.body.Phone).toString()
        let validRwandanPhoneNumbers = ['078','079','072','073']
        let first3Characters = (req.body.Phone.toString()).substring(0,3)
        if(validRwandanPhoneNumbers.includes(first3Characters) != true){
            return res.status(400).send("Phone Number must be a valid Rwandan Phone Number!")
        }
        
        let date = new Date(req.body.DateOfBirth).getFullYear()
        if(new Date().getFullYear - date < 18){
           return res.status(400).send("You are not eligible to register because you are younger than 18 years")
        }

        let employee = new Employee(_.pick(req.body, ['Name','NationalId','Phone','DateOfBirth','Email','Position']))
        const time = new Date();
        employee.CreatedAt = time;
        employee.Code = 'EMP'+randomCode.toString();
        employee.Positon = req.body.Position

        try {
            await employee.save()
            const token = employee.generateVerificationToken()
            const role = req.body.Position
            const subject = `Employee Management System: You have been hired as ${role} for the EMPLOYEE MANAGEMENT SYSTEM. All you have to do is click the link below to verify your email.
            IF YOU DO NOT ACCEPT THIS OFFER, PLEASE IGNORE THE MESSAGE!`
            if(process.env.NODE_ENV == 'development'){
                let port = process.env.PORT
                var url = `http://localhost:${port}`
            }
    
            if(process.env.NODE_ENV == 'production'){
                var url = `https://ski-design-backend.herokuapp.com`
            }
    
            const html = `<a href='${url}/employee/verification/${token}'>Employee Management System email Verification Link.</a>`;
            sendEmail(employee.Email, subject, html) 
            res.send({
                status: 201,
                message: "Employee Added SuccessFully. You can now wait for the invited employee to verify their email."
            })
        } catch (ex) {
            res.status(400).send(ex.message);
        }
    } catch (ex) {
        res.status(500).send(ex.message);
    }
}

exports.validateEmployeeByEmail = async(req, res) => {
    const token = req.params.token;
    if (!token) return res.status(400).send("Invalid URL!")
    try {
        const decoded = jwt.verify(token, process.env.JWT)
        const employeeId = decoded._id
        
        let employee = await Employee.findByIdAndUpdate(employeeId, { isVerified: true }, { new: true })
        res.status(200).send("Email verification completed successfully. You are now an employee of EMPLOYEE MANAGEMENT SYSTEM!")
    } catch (ex) {
        res.status(400).send(ex.message)
    }
}

exports.updateEmployeeInformation = async(req, res) => {
    try {
        const { error } = validateUpdate(req.body)
        if (error) return res.status(400).send(error.details[0].message)
        try {
            let employeeInfo = await Employee.findById(req.params.employeeId).select("-Password");
            if (!employeeInfo) return res.status(404).send("Employee not found!")
            
            let names = (req.body.Names) ? req.body.Names : employeeInfo.Names
            let dob = (req.body.DateOfBirth) ? req.body.DateOfBirth : employeeInfo.DateOfBirth

            if(req.body.DateOfBirth){
                let date = new Date(req.body.DateOfBirth).getFullYear()
                if(new Date().getFullYear - date < 18){
                    return res.status(400).send("You are not eligible to update the employee information because the provided age is less than 18 years")
                }
            }
            
            let employee = await Employee.findByIdAndUpdate(req.params.employeeId, {
                Name: names,
                DateOfBirth: dob
            }, { new: true })
                
            res.status(200).send({
                message: 'employee updated successfully',
                data: employee
            })
        } catch (ex) {
            res.status(400).send(ex.message)
        }
    } catch (ex) {
        res.status(500).send(ex.message)
    }
}

exports.suspendEmployee= async(req, res) => {
    try {
        let employee = await Employee.findById(req.params.employeeId)
        if(!employee) return res.status(404).send("The employee with the provided employee ID does not exist")
        await Employee.findByIdAndUpdate(req.params.employeeId,{Status:'INACTIVE'},{new:true})
        res.status(200).send({message:"Employee Suspended successfully",data:employee})
    } catch (ex) {
        res.status(400).send(ex.message)
    }
}

exports.activateEmployee= async(req, res) => {
    try {
        let employee = await Employee.findById(req.params.employeeId)
        if(!employee) return res.status(404).send("The employee with the provided employee ID does not exist")
        await Employee.findByIdAndUpdate(req.params.employeeId,{Status:'ACTIVE'},{new:true})
        res.status(200).send({message:"Employee Activated successfully",data:employee})
    } catch (ex) {
        res.status(400).send(ex.message)
    }
}

exports.deleteEmployee = async(req, res) => {
    try {
        let employee = await Employee.findById(req.params.employeeId)
        if(!employee) return res.status(404).send("The employee with the provided employee ID does not exist")
        await Employee.findByIdAndRemove(req.params.employeeId)
        res.status(200).send("Employee deleted successfully")
    } catch (ex) {
        res.status(400).send(ex.message)
    }
}