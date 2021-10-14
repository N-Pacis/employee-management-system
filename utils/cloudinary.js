const cloudinary = require('cloudinary').v2

const cloud_name= (process.env.CLOUD_NAME).toString().trim()
const api_key = (process.env.API_KEY).toString().trim()
const api_secret= process.env.API_SECRET

cloudinary.config({
    cloud_name: ''+cloud_name,
    api_key: ''+api_key,
    api_secret: ''+api_secret,
})

module.exports=cloudinary;