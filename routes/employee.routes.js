const express = require("express")
const router = express.Router()
const {getEmployees, validateEmployeeByEmail, registerEmployee,updateEmployeeInformation, deleteEmployee, suspendEmployee, activateEmployee, searchEmployee, registerEmployeesByFileUpload} = require("../controllers/employee.controller")
const authenticate = require('../middlewares/auth.middleware')
const manager = require('../middlewares/manager.middleware')
const {validateEmployee} = require("../validators/employee.validator")
const { uploadFile } = require("../utils/uploadExcelSheet")
const upload = uploadFile();

/**
 * @swagger
 * /employees:
 *   get:
 *     tags: [EMPLOYEE MANAGEMENT MODULE]
 *     description: Get all employees information    
 *     summary: Get all employees    
 *     parameters: 
 *       - name: Authorization
 *         description: JWT token of the manager
 *         type: string
 *         in: header
 *         required: true
 *     responses:
 *       200:
 *         description:Success
 *       400:
 *         description:Bad Request
 *       404:
 *         description:Not Found
 *       500:
 *         description: Internal Server Error
 */
 router.get("/employees",authenticate,manager,getEmployees)

/**
 * @swagger
 * /employee/search:
 *   get:
 *     tags: [EMPLOYEE MANAGEMENT MODULE]
 *     description: Search an employee's record by providing atleast one of the properties below. You can also fill multiple fields 
 *     summary: Search an employee
 *     parameters:
 *       - name: Authorization
 *         description: JWT token of the manager
 *         type: string
 *         in: header
 *         required: true
 *       - name: name
 *         description: Names of the employee
 *         type: string
 *         in: query
 *       - name: phone
 *         description: Phone number of the employee Format=> 07xxxxxxxx
 *         type: string
 *         in: query
 *       - name: email
 *         description: Email of the employee
 *         type: string
 *         in: query
 *       - name: code
 *         description: Code of the employee
 *         type: string
 *         in: query
 *       - name: position
 *         description: Position of the employee
 *         enum: ['DEVELOPER', 'DESIGNER', 'TESTER', 'DEVOPS']
 *         type: string
 *         in: query
 *     responses:
 *       200:
 *         description: Success
 *       201:
 *         description: Created
 *       400:
 *         description:Bad Request
 *       404:
 *         description:Not Found
 *       500:
 *         description: Internal Server Error
 */
 router.get("/employee/search", authenticate,manager,searchEmployee)

/**
 * @swagger
 * /employee/verification/{token}:
 *   get:
 *     tags: [EMPLOYEE MANAGEMENT MODULE]
 *     description: Confirm employee Email
 *     summary: Employee Email confirmation
 *     parameters: 
 *       - name: token
 *         description: Token sent to the employee in the email link
 *         type: string
 *         in: path
 *         required: true
 *     responses:
 *       200:
 *         description:Success
 *       400:
 *         description:Bad Request
 *       404:
 *         description:Not Found
 *       500:
 *         description: Internal Server Error
 */
router.get("/employee/verification/:token", validateEmployeeByEmail)

/**
 * @swagger
 * /employee/register:
 *   post:
 *     tags: [EMPLOYEE MANAGEMENT MODULE]
 *     description: Register a new employee
 *     summary: Register a new employee
 *     parameters:
 *       - name: Authorization
 *         description: JWT token of the manager
 *         type: string
 *         in: header
 *         required: true
 *       - name: Name
 *         description: Names of the employee
 *         type: string
 *         in: formData
 *         required: true
 *       - name: NationalId
 *         description: NationalId of the employee
 *         type: string
 *         in: formData
 *         required: true
 *       - name: Phone
 *         description: Phone number of the employee Format=> 07xxxxxxxx
 *         type: string
 *         in: formData
 *         required: true
 *       - name: DateOfBirth
 *         description: Date of birth of the employee Format=> dd-mm-yyy
 *         type: string
 *         in: formData
 *         example: 01-01-2000
 *         required: true
 *       - name: Email
 *         description: Email of the employee
 *         type: string
 *         in: formData
 *         required: true
 *       - name: Position
 *         description: Position of the employee
 *         enum: ['DEVELOPER', 'DESIGNER', 'TESTER', 'DEVOPS']
 *         type: string
 *         in: formData
 *         required: true
 *     responses:
 *       200:
 *         description: Success
 *       201:
 *         description: Created
 *       400:
 *         description:Bad Request
 *       404:
 *         description:Not Found
 *       500:
 *         description: Internal Server Error
 */
 router.post("/employee/register", authenticate,manager,validateEmployee,registerEmployee)

 /**
 * @swagger
 * /employee/registerMultiple:
 *   post:
 *     tags: [EMPLOYEE MANAGEMENT MODULE]
 *     description: Register multiple employees by uploading an excel sheet containing  Name, NationalId,Phone, Email, DateOfBirth, Status and Position
 *     summary: Register multiple employees
 *     parameters:
 *       - name: Authorization
 *         description: JWT token of the manager
 *         type: string
 *         in: header
 *         required: true
 *       - name: ExcelFile
 *         description: Excel sheet containing a list of employees
 *         type: file
 *         in: formData
 *         required: true
 *     responses:
 *       200:
 *         description: Success
 *       201:
 *         description: Created
 *       400:
 *         description:Bad Request
 *       404:
 *         description:Not Found
 *       500:
 *         description: Internal Server Error
 */
  router.post("/employee/registerMultiple", [authenticate,manager,upload.single("ExcelFile")],registerEmployeesByFileUpload)

/**
 * @swagger
 * /employee/{employeeId}/update:
 *   put:
 *     tags: [EMPLOYEE MANAGEMENT MODULE]
 *     description: Update employee information
 *     summary: Update employee information
 *     parameters: 
 *       - name: Authorization
 *         description: JWT token of the manager
 *         type: string
 *         in: header
 *         required: true
 *       - name: employeeId
 *         description: Id of the employee
 *         type: string
 *         in: path
 *         required: true
 *       - name: Names
 *         description: Full names of the employee
 *         type: string
 *         example: John Doe
 *         in: formData
 *       - name: DateOfBirth
 *         description: DateOfBirth of the employee
 *         type: string
 *         example: 01-01-2000
 *         in: formData
 *     responses:
 *       200:
 *         description:Success
 *       400:
 *         description:Bad Request
 *       404:
 *         description:Not Found
 *       500:
 *         description: Internal Server Error
 */
 router.put("/employee/:employeeId/update",authenticate,manager,updateEmployeeInformation)

 /**
 * @swagger
 * /employee/{employeeId}/suspend:
 *   patch:
 *     tags: [EMPLOYEE MANAGEMENT MODULE]
 *     description: Deactivate employee's account
 *     summary: Suspend an employee
 *     parameters: 
 *       - name: Authorization
 *         description: JWT token of the manager
 *         type: string
 *         in: header
 *         required: true
 *       - name: employeeId
 *         description: Id of the employee
 *         type: string
 *         in: path
 *         required: true
 *     responses:
 *       200:
 *         description:Success
 *       400:
 *         description:Bad Request
 *       404:
 *         description:Not Found
 *       500:
 *         description: Internal Server Error
 */
  router.patch("/employee/:employeeId/suspend",authenticate,manager,suspendEmployee)

   /**
 * @swagger
 * /employee/{employeeId}/activate:
 *   patch:
 *     tags: [EMPLOYEE MANAGEMENT MODULE]
 *     description: Activate employee's account
 *     summary: Activate an employee
 *     parameters: 
 *       - name: Authorization
 *         description: JWT token of the manager
 *         type: string
 *         in: header
 *         required: true
 *       - name: employeeId
 *         description: Id of the employee
 *         type: string
 *         in: path
 *         required: true
 *     responses:
 *       200:
 *         description:Success
 *       400:
 *         description:Bad Request
 *       404:
 *         description:Not Found
 *       500:
 *         description: Internal Server Error
 */
 router.patch("/employee/:employeeId/activate",authenticate,manager,activateEmployee)

 /**
 * @swagger
 * /employee/{employeeId}/delete:
 *   delete:
 *     tags: [EMPLOYEE MANAGEMENT MODULE]
 *     description: Delete An employee
 *     summary: Delete employee record
 *     parameters:
 *       - name: Authorization
 *         description: JWT token of the manager
 *         type: string
 *         in: header
 *         required: true 
 *       - name: employeeId
 *         description: Id of the employee
 *         type: string
 *         in: path
 *         required: true
 *     responses:
 *       400:
 *         description:Bad Request
 *       404:
 *         description:Not Found
 *       500:
 *         description: Internal Server Error
 */
router.delete("/employee/:employeeId/delete",authenticate,manager,deleteEmployee)

module.exports = router