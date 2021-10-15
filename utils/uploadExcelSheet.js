const multer = require("multer")

exports.uploadFile=()=>{
    const storage = multer.diskStorage({
        destination: function(req,file,cb){
            cb(null,`./ExcelSheets/`);
        },
        filename: function(req,file,cb){
            let date = Math.random() * 10000 
            cb(null,date + file.originalname)
        }
    })

    const fileFilter = (req,file,cb)=>{
        if(file.mimetype == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"){
            cb(null,true)
        }
        else{
            cb("File Type not supported. Please upload an excel file",false)
        }
    }

    const upload = multer({
        storage:storage,
        limits:{
            fileSize:1024 * 1024 * 10
        },
        fileFilter: fileFilter
    })
    return upload
}