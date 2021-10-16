const Joi = require('joi');
const { User} = require("../models/user.model")

exports.validateManager = async(req,res,next)=>{

    const schema = Joi.object({
        Name: Joi.string().min(5).required(),
        NationalId: Joi.number().min(16).required(),
        Phone: Joi.number().min(10).required(),
        DateOfBirth: Joi.date().required(),
        Email:Joi.string().min(5).required(),
        Password:Joi.string().min(6).required()
    })
    const {error} = schema.validate(req.body);   
    if(error){
        return res.status(400).json({
            data: error.message,
            message: "Unable to register the manager."
        })
    }
     
    let checkEmail = await User.findOne({ Email: req.body.Email })
    if (checkEmail) return res.status(400).send("Email is already registered!")
    
    let checkNationalID = await User.findOne({ NationalId: req.body.NationalId })
    if (checkNationalID) return res.status(400).send("National Id is already registered!")
    
    let checkPhone = await User.findOne({ Phone: req.body.Phone })
    if (checkPhone) return res.status(400).send("Phone Number is already registered!")
    if((req.body.Phone).length < 10 || (req.body.Phone).length > 10) return res.status(400).send("Phone Number must be 10 characters!")
    req.body.Phone = (req.body.Phone).toString()
    let validRwandanPhoneNumbers = ['078','079','072','073']
    let first3Characters = (req.body.Phone.toString()).substring(0,3)
    if(validRwandanPhoneNumbers.includes(first3Characters) != true){
        return res.status(400).send("Phone Number must be a valid Rwandan Phone Number!")
    }
    
    if(req.body.DateOfBirth){
        let date = new Date(req.body.DateOfBirth).getFullYear()
        let today = new Date()
        if((today.getFullYear() - date) < 18){
            return res.status(400).send("You are not eligible to register because the provided age is less than 18 years")
        }
    }
    return next()
}
