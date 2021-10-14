const nodemailer = require("nodemailer")

exports.sendEmail = (to,subject,html)=>{
    let transporter = nodemailer.createTransport({
        host:"smtp.gmail.com",
        port:465,
        secure:true,
        service:"gmail",
        auth:{
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    })

    let mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: subject,
        html: html
    }

    transporter.sendMail(mailOptions,function(error,info){
        if(error){
            console.log(error)
            return "Unable to send email"
        }
    })
}
