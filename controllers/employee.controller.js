const { validateUpdate, Employee } = require("../models/employee.model")
const _ = require("lodash")
const jwt = require('jsonwebtoken')
const { sendEmail } = require("../utils/emailConfig.utils");
const readExcelFile = require('read-excel-file/node')
const { validateEmployeeRegistrationByFileUpload } = require('../validators/employee.validator');
const { User } = require("../models/user.model");
const { log } = require("../utils/log.utils");


exports.getAnEmployee = async (req, res) => {
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

exports.searchEmployee = async (req, res) => {
    try {
        let result = [];
        if (req.query.position) {
            req.query.category = (req.query.position).toUpperCase()
            let employee = await Employee.find({ Position: req.query.position })
            if (employee.length != 0) result.push({ message: `Array of the search result for the employees with the position of ${req.query.position}`, data: employee })
        }
        if (req.query.name) {
            let employee = await Employee.find({ Name: req.query.name })
            if (employee.length != 0) result.push({ message: `Array of the search result for the employees by the name of ${req.query.name}`, data: employee })
        }
        if (req.query.email) {
            let employee = await Employee.find({ Email: req.query.email })
            if (employee.length != 0) result.push({ message: `Array of the search result for the employees with the email of ${req.query.email}`, data: employee })
        }
        if (req.query.phone) {
            let employee = await Employee.find({ Phone: req.query.phone })
            if (employee.length != 0) result.push({ message: `Array of the search result for the employees with the phone number of ${req.query.phone}`, data: employee })
        }
        if (req.query.code) {
            let employee = await Employee.find({ Code: req.query.code })
            if (employee.length != 0) result.push({ message: `Array of the search result for the employees with the code of ${req.query.code}`, data: employee })
        }

        if (result.length == 0) {
            return res.status(404).send("Employee not found")
        }
        return res.status(200).send({
            message: "Employee found",
            data: result
        })
    } catch (ex) {
        res.status(400).send(ex.message)
    }
}

exports.getEmployees = async (req, res) => {
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

exports.registerEmployee = async (req, res) => {
    try {
        let employee = new Employee(_.pick(req.body, ['Name', 'NationalId', 'Phone', 'DateOfBirth', 'Email', 'Position']))
        const time = new Date();
        employee.CreatedAt = time;
        let randomCode = Math.floor(1000 + Math.random() * 9000);
        employee.Code = 'EMP' + randomCode.toString();

        try {
            await employee.save()
            const token = employee.generateVerificationToken()
            const role = req.body.Position
            const subject = `Employee Management System: You have been hired as ${role} for the EMPLOYEE MANAGEMENT SYSTEM. All you have to do is click the link below to verify your email.
            IF YOU DO NOT ACCEPT THIS OFFER, PLEASE IGNORE THE MESSAGE!`
                var url = `https://employee-management-sys-pacis.herokuapp.com`

            const html = `<a href='${url}/employee/verification/${token}'>Employee Management System email Verification Link.</a>`;
            sendEmail(employee.Email, subject, html)
            let manager = await User.findById(req.user._id)
            await log(
                'register-employee',
                {
                    employeeInfo: employee,
                    managerInfo: {
                        managerId: manager._id,
                        managerCode: manager.Code,
                        managerNames: manager.Name
                    }
                },
                manager._id
            )
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

exports.registerEmployeesByFileUpload = async (req, res) => {
    try {
        if (req.file == undefined) {
            return res.status(400).send("Please upload an excel file!");
        }
        readExcelFile(req.file.path)
            .then(async (rows) => {
                var employees = []
                var validationErrors = []
                for (let i = 0; i < rows.length; i++) {
                    let employeeInfo = {
                        Name: rows[i][0],
                        NationalId: rows[i][1],
                        Phone: rows[i][2],
                        Email: rows[i][3],
                        DateOfBirth: rows[i][4],
                        Status: rows[i][5],
                        Position: rows[i][6]
                    }
                    let recordNo = i + 1;
                    let validation = await validateEmployeeRegistrationByFileUpload(employeeInfo, recordNo)
                    if (validation.type != 'success') {
                        validationErrors.push(validation)
                    }
                    else {
                        employees.push(employeeInfo)
                    }
                }
                if (validationErrors.length != 0) {
                    return res.status(200).send({
                        message: "Validation Failed",
                        error: validationErrors
                    })
                }
                else {
                    let employeesUploaded = []
                    for (let i = 0; i < employees.length; i++) {
                        let employee = new Employee(_.pick(employees[i], ['Name', 'NationalId', 'Phone', 'DateOfBirth', 'Email', 'Position', 'Status']))
                        const time = new Date();
                        employee.CreatedAt = time;
                        let randomCode = Math.floor(1000 + Math.random() * 9000);
                        employee.Code = 'EMP' + randomCode.toString();

                        try {
                            await employee.save()
                            const token = employee.generateVerificationToken()
                            const role = req.body.Position
                            const subject = `Employee Management System: You have been hired as ${role} for the EMPLOYEE MANAGEMENT SYSTEM. All you have to do is click the link below to verify your email.
                        IF YOU DO NOT ACCEPT THIS OFFER, PLEASE IGNORE THE MESSAGE!`

                                var url = `https://employee-management-sys-pacis.herokuapp.com`

                            const html = `<a href='${url}/employee/verification/${token}'>Employee Management System email Verification Link.</a>`;
                            sendEmail(employee.Email, subject, html)
                            let manager = await User.findById(req.user._id)
                            await log(
                                'register-employee',
                                {
                                    employeeInfo: employee,
                                    managerInfo: {
                                        managerId: manager._id,
                                        managerCode: manager.Code,
                                        managerNames: manager.Name
                                    }
                                },
                                manager._id
                            )
                            employeesUploaded.push(employee)
                        } catch (ex) {
                            res.status(400).send(ex.message);
                        }
                    }
                    return res.status(200).send({
                        message: "Employees Registered Successfully",
                        data: employeesUploaded
                    })
                }
            })
            .catch(error => {
                return res.status(400).send({
                    message: "Failed to read the uploaded excel file!",
                    error: error.message
                });
            })
    } catch (ex) {
        res.status(500).send(ex.message);
    }
}

exports.validateEmployeeByEmail = async (req, res) => {
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

exports.updateEmployeeInformation = async (req, res) => {
    try {
        const { error } = validateUpdate(req.body)
        if (error) return res.status(400).send(error.details[0].message)
        try {
            let employeeInfo = await Employee.findById(req.params.employeeId).select("-Password");
            if (!employeeInfo) return res.status(404).send("Employee not found!")

            let names = (req.body.Names) ? req.body.Names : employeeInfo.Names
            let dob = (req.body.DateOfBirth) ? req.body.DateOfBirth : employeeInfo.DateOfBirth
            if (req.body.DateOfBirth) {
                let date = new Date(req.body.DateOfBirth).getFullYear()
                let today = new Date()
                if ((today.getFullYear() - date) < 18) {
                    return res.status(400).send("You are not eligible to update the employee information because the provided age is less than 18 years")
                }
            }

            let employee = await Employee.findByIdAndUpdate(req.params.employeeId, {
                Name: names,
                DateOfBirth: dob
            }, { new: true })
            let manager = await User.findById(req.user._id)
            await log(
                'update-employee',
                {
                    employeeInfo: {
                        BeforeUpdate: employeeInfo,
                        AfterUpdate: employee
                    },
                    managerInfo: {
                        managerId: manager._id,
                        managerCode: manager.Code,
                        managerNames: manager.Name
                    }
                },
                manager._id
            )
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

exports.suspendEmployee = async (req, res) => {
    try {
        let employee = await Employee.findById(req.params.employeeId)
        if (!employee) return res.status(404).send("The employee with the provided employee ID does not exist")
        await Employee.findByIdAndUpdate(req.params.employeeId, { Status: 'INACTIVE' }, { new: true })
        let manager = await User.findById(req.user._id)
        await log(
            'suspend-employee',
            {
                employeeInfo: employee,
                managerInfo: {
                    managerId: manager._id,
                    managerCode: manager.Code,
                    managerNames: manager.Name
                }
            },
            manager._id
        )
        res.status(200).send({ message: "Employee Suspended successfully", data: employee })
    } catch (ex) {
        res.status(400).send(ex.message)
    }
}

exports.activateEmployee = async (req, res) => {
    try {
        let employee = await Employee.findById(req.params.employeeId)
        if (!employee) return res.status(404).send("The employee with the provided employee ID does not exist")
        await Employee.findByIdAndUpdate(req.params.employeeId, { Status: 'ACTIVE' }, { new: true })
        let manager = await User.findById(req.user._id)
        await log(
            'activate-employee',
            {
                employeeInfo: employee,
                managerInfo: {
                    managerId: manager._id,
                    managerCode: manager.Code,
                    managerNames: manager.Name
                }
            },
            manager._id
        )
        res.status(200).send({ message: "Employee Activated successfully", data: employee })
    } catch (ex) {
        res.status(400).send(ex.message)
    }
}

exports.deleteEmployee = async (req, res) => {
    try {
        let employee = await Employee.findById(req.params.employeeId)
        if (!employee) return res.status(404).send("The employee with the provided employee ID does not exist")
        await Employee.findByIdAndRemove(req.params.employeeId)
        let manager = await User.findById(req.user._id)
        await log(
            'delete-employee',
            {
                employeeInfo: employee,
                managerInfo: {
                    managerId: manager._id,
                    managerCode: manager.Code,
                    managerNames: manager.Name
                }
            },
            manager._id
        )
        res.status(200).send("Employee deleted successfully")
    } catch (ex) {
        res.status(400).send(ex.message)
    }
}
