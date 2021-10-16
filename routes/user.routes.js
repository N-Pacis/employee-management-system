const express = require("express")
const router = express.Router()
const {getUserInformation, validateUserByEmail, createUser, login,sendResetLink,updateUserInformation, resetPassword, resetPasswordLink,changePassword, deleteAccount} = require("../controllers/user.controller")
const authenticate = require('../middlewares/auth.middleware')
const { validateManager } = require("../validators/manager.validator")

/**
 * @swagger
 * /user/profile:
 *   get:
 *     tags: [AUTHENTICATION AND ACCOUNT MANAGEMENT(FOR MANAGER)]
 *     description: Get user information    
 *     summary: Get user profile information    
 *     parameters: 
 *       - name: Authorization
 *         description: JWT token of the user
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
 router.get("/user/profile",authenticate,getUserInformation)

/**
 * @swagger
 * /verification/{token}:
 *   get:
 *     tags: [AUTHENTICATION AND ACCOUNT MANAGEMENT(FOR MANAGER)]
 *     description: Confirm User Email
 *     summary: User Email confirmation
 *     parameters: 
 *       - name: token
 *         description: Token sent to the user in the email link
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
router.get("/verification/:token", validateUserByEmail)

/**
 * @swagger
 * /register:
 *   post:
 *     tags: [AUTHENTICATION AND ACCOUNT MANAGEMENT(FOR MANAGER)]
 *     description: Register a new user
 *     summary: Register a new user
 *     parameters:
 *       - name: Name
 *         description: Names of the user
 *         type: string
 *         in: formData
 *         required: true
 *       - name: NationalId
 *         description: NationalId of the user
 *         type: string
 *         in: formData
 *         required: true
 *       - name: Phone
 *         description: Phone number of the user Format=> 07xxxxxxxx
 *         type: string
 *         in: formData
 *         required: true
 *       - name: DateOfBirth
 *         description: Date of birth of the user Format=> mm-dd-yyy
 *         type: string
 *         in: formData
 *         example: 01-01-2000
 *         required: true
 *       - name: Email
 *         description: Email of the user
 *         type: string
 *         in: formData
 *         required: true
 *       - name: Password
 *         description: Password of the user
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
 router.post("/register",validateManager, createUser)

/**
 * @swagger
 * /login:
 *   post:
 *     tags: [AUTHENTICATION AND ACCOUNT MANAGEMENT(FOR MANAGER)]
 *     description: Login
 *     summary: login to your account
 *     parameters: 
 *       - name: Email
 *         description: Email of the user
 *         type: string
 *         in: formData
 *         required: true
 *       - name: Password
 *         description: Password of the user
 *         type: string
 *         in: formData
 *         required: true
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description:Bad Request
 *       404:
 *         description:Not Found
 *       500:
 *         description: Internal Server Error
 */
router.post("/login", login)

/**
 * @swagger
 * /sendResetLink:
 *   post:
 *     tags: [AUTHENTICATION AND ACCOUNT MANAGEMENT(FOR MANAGER)]
 *     description: Send Password Reset Link
 *     summary: Get your reset password link
 *     parameters: 
 *       - name: Email
 *         description: Email of the user
 *         type: string
 *         in: formData
 *         required: true
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description:Bad Request
 *       404:
 *         description:Not Found
 *       500:
 *         description: Internal Server Error
 */
router.post("/sendResetLink",sendResetLink)

/**
 * @swagger
 * /resetPassword/{userId}/{token}:
 *   patch:
 *     tags: [AUTHENTICATION AND ACCOUNT MANAGEMENT(FOR MANAGER)]
 *     description: Reset Password
 *     summary: Reset Your Password 
 *     parameters: 
 *       - name: userId
 *         description: Id of the user
 *         type: string
 *         in: path
 *         required: true
 *       - name: token
 *         description: Token they sent the user in email
 *         type: string
 *         in: path
 *         required: true
 *       - name: newPassword
 *         description: New Password of the user
 *         type: string
 *         in: formData
 *         required: true
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description:Bad Request
 *       404:
 *         description:Not Found
 *       500:
 *         description: Internal Server Error
 */
router.patch("/resetPassword/:userId/:token",resetPassword)

router.get("/resetPassword",resetPasswordLink)

/**
 * @swagger
 * /user/profile/update:
 *   put:
 *     tags: [AUTHENTICATION AND ACCOUNT MANAGEMENT(FOR MANAGER)]
 *     description: Update user information
 *     summary: Update your profile info
 *     parameters: 
 *       - name: Authorization
 *         description: JWT token of the user
 *         type: string
 *         in: header
 *         required: true
 *       - name: Names
 *         description: Full names of the user
 *         type: string
 *         example: John Doe
 *         in: formData
 *       - name: DateOfBirth
 *         description: DateOfBirth of the user
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
 router.put("/user/profile/update",[authenticate],updateUserInformation)

 
/**
 * @swagger
 * /user/profile/changePassword:
 *   patch:
 *     tags: [AUTHENTICATION AND ACCOUNT MANAGEMENT(FOR MANAGER)]
 *     description: Change password
 *     summary: Change your account password 
 *     parameters:
 *       - name: Authorization
 *         description: JWT token of the user
 *         type: string
 *         in: header
 *         required: true 
 *       - name: oldPassword
 *         description: Old Password of the user
 *         type: string
 *         in: formData
 *         required: true 
 *       - name: newPassword
 *         description: New Password of the user
 *         type: string
 *         in: formData
 *         required: true
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description:Bad Request
 *       404:
 *         description:Not Found
 *       500:
 *         description: Internal Server Error
 */
 router.patch("/user/profile/changePassword",authenticate,changePassword) 

 /**
 * @swagger
 * /user/profile/delete:
 *   delete:
 *     tags: [AUTHENTICATION AND ACCOUNT MANAGEMENT(FOR MANAGER)]
 *     description: Delete A User
 *     summary: Delete Your Profile
 *     parameters:
 *       - name: Authorization
 *         description: JWT token of the user
 *         type: string
 *         in: header
 *         required: true 
 *     responses:
 *       400:
 *         description:Bad Request
 *       404:
 *         description:Not Found
 *       500:
 *         description: Internal Server Error
 */
router.delete("/user/profile/delete",authenticate,deleteAccount)

module.exports = router