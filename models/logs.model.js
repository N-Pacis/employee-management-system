const mongoose = require("mongoose")
const Joi = require('joi')
const idvalidator = require("mongoose-id-validator");

function validateLogging(log){
    const schema = Joi.object({
        Action: Joi.string().valid('login','logout','profile-update','profile-deletion','password-reset','password-change','register-employee','update-employee','delete-employee','suspend-employee','activate-employee').required(),
        Details: Joi.object(), 
        HappenedAt: Joi.date().required(),
        By: Joi.string().required()
    })   
    return schema.validate(log)
}

const logSchema = new mongoose.Schema({
    Action:{
        type:String,
        enum:['login','logout','profile-update','profile-deletion','password-reset','password-change','register-employee','update-employee','delete-employee','suspend-employee','activate-employee'],
        required:true
    },
    details:{
        type:Object,
    },
    HappenedAt:{
        type:Date,
        required:true
    },
    By:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    }
})
logSchema.plugin(idvalidator);


const Logs = mongoose.model('logs ',logSchema)

exports.validateLogging = validateLogging
exports.Logs = Logs
