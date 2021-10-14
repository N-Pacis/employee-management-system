const mongoose = require("mongoose")
const Joi = require('joi')
const jwt = require('jsonwebtoken')

function validateEmployeeRegistration(employee){
    const schema = Joi.object({
        Name: Joi.string().min(5).required(),
        NationalId: Joi.number().min(16).required(),
        Phone: Joi.number().min(10).required(),
        DateOfBirth: Joi.date().required(),
        Email:Joi.string().min(5).required(),
        Position:Joi.string().uppercase().valid('DEVELOPER', 'DESIGNER', 'TESTER', 'DEVOPS').required()
    })   
    return schema.validate(employee)
}

function validateEmployeeUpdate(employee){
    const schema = Joi.object({
        Names: Joi.string().min(5),
        DateOfBirth: Joi.date()
    })
    return schema.validate(employee)
}


const employeeSchema = new mongoose.Schema({
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
        enum:['DEVELOPER', 'DESIGNER', 'TESTER', 'DEVOPS'],
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

employeeSchema.methods.generateAuthToken = function(){
    const token = jwt.sign(
        {_id:this._id,email:this.Email,Position: this.Position},
        process.env.JWT
    )
    const finalToken = 'Bearer '+token
    return finalToken
}
employeeSchema.methods.generateVerificationToken = function(){
    const token = jwt.sign(
        {_id:this._id,names:this.Names,email:this.Email},
        process.env.JWT
    )
    return token
}

const Employee = mongoose.model('employee',employeeSchema)

exports.validateRegistration = validateEmployeeRegistration
exports.validateUpdate = validateEmployeeUpdate
exports.Employee = Employee
