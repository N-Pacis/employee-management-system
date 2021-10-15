const Joi = require('joi');
const { User} = require("../models/user.model")

exports.validateManager = async(manager)=>{

    const schema = Joi.object({
        Name: Joi.string().min(5).required(),
        NationalId: Joi.number().min(16).required(),
        Phone: Joi.number().min(10).required(),
        DateOfBirth: Joi.date().required(),
        Email:Joi.string().min(5).required(),
        Password:Joi.string().min(6).required()
    })
    const employee = manager;
    const {error} = schema.validate(employee);   
    if(error){
        return res.status(400).json({
            data: error.message,
            message: "Unable to register the manager."
        })
    }
     
    let checkEmail = await User.findOne({ Email: manager.Email })
    if (checkEmail) return res.status(400).send("Email is already registered!")
    
    let checkNationalID = await User.findOne({ NationalId: manager.NationalId })
    if (checkNationalID) return res.status(400).send("National Id is already registered!")
    
    let checkPhone = await User.findOne({ Phone: manager.Phone })
    if (checkPhone) return res.status(400).send("Phone Number is already registered!")
    if((manager.Phone).length < 10 ) return res.status(400).send("Phone Number must be 10 characters!")
    manager.Phone = (manager.Phone).toString()
    let validRwandanPhoneNumbers = ['078','079','072','073']
    let first3Characters = (manager.Phone.toString()).substring(0,3)
    if(validRwandanPhoneNumbers.includes(first3Characters) != true){
        return res.status(400).send("Phone Number must be a valid Rwandan Phone Number!")
    }
    
    if(manager.DateOfBirth){
        let date = new Date(manager.DateOfBirth).getFullYear()
        let today = new Date()
        if((today.getFullYear() - date) < 18){
            return res.status(400).send("You are not eligible to register because the provided age is less than 18 years")
        }
    }
}
