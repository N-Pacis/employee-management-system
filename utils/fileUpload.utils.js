const multer = require("multer")

exports.uploadFile=()=>{
    
    const fileFilter = (req,file,cb)=>{
        if(file.mimetype == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"){
            cb(null,true)
        }
        else{
            cb("File Type not supported. Please upload an excel file",false)
        }
    }
    
    const storage = multer.diskStorage({})
    const upload = multer({
        storage:storage,
        limits:{
            fileSize:1024 * 1024 * 10
        },
        fileFilter: fileFilter
    })

    return upload
}
