const {  validateLogin,validateSendResetLink,validatePasswordReset,validateUpdate,validatePasswordChange, User} = require("../models/user.model")
const _ = require("lodash")
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')
const { sendEmail } = require("../utils/emailConfig.utils");
const { log } = require("../utils/log.utils");

exports.getUserInformation = async(req, res) => {
    try {
        let user = await User.findById(req.user._id).select("-Password");
        if (!user) return res.status(404).send("User not found!")
        return res.send({
            status: 200,
            message: "ok",
            data: user
        })
    } catch (ex) {
        res.status(400).send(ex.message)
    }
}

exports.resetPasswordLink = async(req, res) => {
    try {
        let token = req.query.t;
        if(!token || token == "") return res.status(404).send("Invalid URL!")
        return res.status(200).send(`Please copy this token as it'll be used when resetting your password: ${token}`)
    } catch (ex) {
        res.status(400).send(ex.message)
    }
}

exports.createUser = async(req, res) => {
    try {
        let user = new User(_.pick(req.body, ['Name','NationalId','Phone','DateOfBirth','Email','Password']))
        const time = new Date();
        user.CreatedAt = time;
        let randomCode = Math.floor(1000 + Math.random() * 9000);
        user.Code = 'EMP'+randomCode.toString();

        const salt = await bcrypt.genSalt(10)
        user.Password = await bcrypt.hash(user.Password, salt)

        try {
            await user.save()
            const token = user.generateVerificationToken()
            const subject = "Employee Management System: Verify your email by clicking the link below. IF YOU DID NOT REQUEST THIS, PLEASE IGNORE THE MESSAGE!"
                var url = `https://employee-management-sys-pacis.herokuapp.com`

    
            const html = `<a href='${url}/verification/${token}'>Employee Management System email Verification Link.</a>`;
            sendEmail(user.Email, subject, html) 
            res.send({
                status: 201,
                message: "Check your mail for email verification. If you don't find it in inbox, Check your spam"
            })
        } catch (ex) {
            res.status(400).send(ex.message);
        }
    } catch (ex) {
        res.status(500).send(ex.message);
    }
}

exports.validateUserByEmail = async(req, res) => {
    const token = req.params.token;
    if (!token) return res.status(400).send("Invalid URL!")
    try {
        const decoded = jwt.verify(token, process.env.JWT)
        const userId = decoded._id
        
        let user = await User.findByIdAndUpdate(userId, { isVerified: true }, { new: true })
        res.status(200).send("Email verification completed successfully. You can now login to your account!")
    } catch (ex) {
        res.status(400).send(ex.message)
    }
}

exports.login = async(req, res) => {
    try {
        const { error } = validateLogin(_.pick(req.body, ["Email", "Password"]))
        if (error) return res.status(400).send(error.details[0].message)
        
        let user = await User.findOne({ Email: req.body.Email })
        if (!user) return res.status(400).send("Invalid Email or Password!")

        if(user.Status != 'ACTIVE'){
            return res.status(400).send("Your account is inactive!")
        }
        
        const validPassword = await bcrypt.compare(req.body.Password, user.Password)
        if (!validPassword) return res.status(400).send("Invalid Email or Password!")

        if(user.isVerified != true){
            return res.status(400).send("You must first confirm your email. Check your inbox for confirmation link!")
        }

        const token =user.generateAuthToken()
        await log('login',{managerId: user._id,managerCode: user.Code,managerNames: user.Name},user._id)
        res.header('Authorization', token).send({
            status: 200,
            message: "Login Successful",
            data: user
        })
    } catch (ex) {
        res.status(400).send(ex.message)
    }
}

exports.sendResetLink = async(req, res) => {
    try {
        const {error} = validateSendResetLink(_.pick(req.body,['Email']))
        if(error) return res.status(400).send(error.details[0].message)

        let user = await User.findOne({Email: req.body.Email})
        if(!user) return res.status(400).send("Unable to find the user with the provided email")

        let identifierSalt = await bcrypt.genSalt(10)
        let identifier = await bcrypt.hash((user._id).toString(), identifierSalt)
            var url = `https://employee-management-sys-pacis.herokuapp.com`

        let subject = "EMPLOYEE MANAGEMENT SYSTEM: Reset Your password by clicking the link below. If you have not requested this please ignore the message"
        let html = `<h1>EMPLOYEE MANAGEMENT SYSTEM PASSWORD RESET LINK</h1><br><a href='${url}/resetPassword?t=${identifier}'>Click Here To Reset Your Password</a>`

        sendEmail(user.Email, subject, html)

        res.status(200).send({
            message:`Sent the verification link to ${user.Email}`,
            data:{
                message: "Copy this userId as it'll be used in the next step of resetting password",
                userId:(user._id).toString(),
            }
        })
    } catch (ex) {
        res.status(400).send(ex.message)
    }
}

exports.resetPassword = async(req, res) => {
    try {
        let validateToken = await bcrypt.compare(req.params.userId, req.params.token)
        if (!validateToken) return res.status(400).send("Invalid Token!")

        const { error } = validatePasswordReset(req.body)
        if (error) return res.status(400).send(error.details[0].message)

        let salt = await bcrypt.genSalt(10)
        let newPassword = await bcrypt.hash(req.body.newPassword, salt)

        await User.findByIdAndUpdate(req.params.userId, { Password: newPassword }, { new: true })
        await log(
            'password-reset',
            {},
            req.params.userId
        ) 
        res.status(200).send("Reset Password Successfully!You can now login with your new password")
    } catch (ex) {
        res.status(400).send(ex.message)
    }
}

exports.updateUserInformation = async(req, res) => {
    try {
        const { error } = validateUpdate(req.body)
        if (error) return res.status(400).send(error.details[0].message)
        try {
            let userInfo = await User.findById(req.user._id).select("-Password");
            if (!userInfo) return res.status(404).send("User not found!")
            
            let names = (req.body.Names) ? req.body.Names : userInfo.Names
            let dob = (req.body.DateOfBirth) ? req.body.DateOfBirth : userInfo.DateOfBirth
            
            if(req.body.DateOfBirth){
                let date = new Date(req.body.DateOfBirth).getFullYear()
                let today = new Date()
                if((today.getFullYear() - date) < 18){
                    return res.status(400).send("You are not eligible to update the profile information because the provided age is less than 18 years")
                }
            } 
            let user = await User.findByIdAndUpdate(req.user._id, {
                Name: names,
                DateOfBirth: dob
            }, { new: true })
            await log(
                'profile-update',
                {
                    BeforeUpdate:userInfo,
                    AfterUpdate:user
                },
                req.user._id
            )    
            res.status(200).send({
                message: 'User updated successfully',
                data: user
            })
        } catch (ex) {
            res.status(400).send(ex.message)
        }
    } catch (ex) {
        res.status(500).send(ex.message)
    }
}

exports.changePassword = async(req,res)=>{
    try{
        const {error} = validatePasswordChange(req.body)
        if(error) return res.status(400).send(error.details[0].message)

        let user = await User.findOne({_id:req.user._id}).select("Password")
        let validatePassword = await bcrypt.compare(req.body.oldPassword , user.Password)
        if(!validatePassword) return res.status(400).send("Invalid old password!")
        let newPasswordSalt = await bcrypt.genSalt(10)
        let newPassword = await bcrypt.hash(req.body.newPassword,newPasswordSalt)

        await User.findByIdAndUpdate(req.user._id,{Password:newPassword},{new:true})
        await log(
            'password-change',
            {},
            req.user._id
        ) 
        res.status(200).send("Password Updated Successfully! Next time Log in with your new Password");

    }
    catch(ex){
        res.status(400).send(ex.message)
    }
}

exports.deleteAccount= async(req, res) => {
    try {
        let user = await User.findById(req.user._id)
        if(!user) return res.status(404).send("The manager does not exist")
        await log(
            'profile-deletion',
            {
                managerInfo: user
            },
            req.user._id
        ) 
        await User.findByIdAndRemove(req.user._id)
        res.status(200).send("User deleted successfully")
    } catch (ex) {
        res.status(400).send(ex.message)
    }
}