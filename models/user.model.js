const mongoose = require("mongoose")
const Joi = require('joi')
const jwt = require('jsonwebtoken')

function validateUserRegistration(user){
    const schema = Joi.object({
        Name: Joi.string().min(5).required(),
        NationalId: Joi.number().min(16).required(),
        Phone: Joi.number().min(10).required(),
        DateOfBirth: Joi.date().required(),
        Email:Joi.string().min(5).required(),
        Password:Joi.string().min(6).required()
    })   
    return schema.validate(user)
}

function validateUserLogin(user){
    const schema = Joi.object({
        Email:Joi.string().min(5).required(),
        Password:Joi.string().min(6).required(),
    })
    return schema.validate(user)
}

function validateSendResetLink(user){
    const schema  = Joi.object({
        Email:Joi.string().min(5).required()
    })
    return schema.validate(user)
}

function validatePasswordReset(user){
    const schema = Joi.object({
        newPassword:Joi.string().min(6).required()
    })
    return schema.validate(user)
}

function validateUserUpdate(user){
    const schema = Joi.object({
        Names: Joi.string().min(5),
        DateOfBirth: Joi.date().required()
    })
    return schema.validate(user)
}

function validatePasswordChange(user){
    const schema = Joi.object({
        oldPassword:Joi.string().min(6).required(),
        newPassword:Joi.string().min(6).required()
    })
    return schema.validate(user)
}

const userSchema = new mongoose.Schema({
    Name:{
        type:String,
        minLength:5,
        required:true
    },
    NationalId:{
        type:Number,
        minLength:16,
        maxLength:16,
        required:true,
        unique:true
    },
    Code:{
        type:String,
        minLength:7,
        required:true,
        unique:true
    },
    Phone:{
        type:String,
        minLength:10,
        maxLength:10,
        required:true
    },
    Email:{
        type:String,
        minLength:5,
        unique:true,
        match: [/\S+@\S+\.\S+/, 'Email is invalid'],
        required:true
    },
    DateOfBirth:{
        type:Date,
        required:true
    },
    Status:{
        type:String,
        enum:['ACTIVE','INACTIVE'],
        default:'ACTIVE'
    },
    Position:{
        type:String,
        enum:['MANAGER', 'DEVELOPER', 'DESIGNER', 'TESTER', 'DEVOPS'],
        default:'MANAGER'
    },
    Password:{
        type:String,
        minLength:6,
        required:true
    },
    isVerified:{
        type: Boolean,
        default: false
    },
    CreatedAt:{
        type:Date,
        default:null
    }
})

userSchema.methods.generateAuthToken = function(){
    const token = jwt.sign(
        {_id:this._id,email:this.Email,Position: this.Position},
        process.env.JWT
    )
    const finalToken = 'Bearer '+token
    return finalToken
}
userSchema.methods.generateVerificationToken = function(){
    const token = jwt.sign(
        {_id:this._id,names:this.Names,email:this.Email},
        process.env.JWT
    )
    return token
}

const User = mongoose.model('user',userSchema)

exports.validateRegistration = validateUserRegistration
exports.validateLogin = validateUserLogin
exports.validateSendResetLink = validateSendResetLink
exports.validateUpdate = validateUserUpdate
exports.validatePasswordChange = validatePasswordChange
exports.validatePasswordReset = validatePasswordReset
exports.User = User
