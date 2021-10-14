const multer = require("multer")
const fs = require("fs")

exports.uploadFile=(destination)=>{
    const storage = multer.diskStorage({})

    const fileFilter = (req,file,cb)=>{
        if(file.mimetype==='image/jpeg' ||file.mimetype==='image/jpg' || file.mimetype==='image/png' || file.mimetype === 'video/mp4'){
            cb(null,true)
        }
        else{
            cb("File Type not supported",false)
        }
    }

    const upload = multer({
        storage:storage,
        limits:{
            fileSize:1024 * 1024 * 5
        },
        fileFilter: fileFilter
    })

    return upload
}

//upload image question

exports.uploadImageQuestion = ()=>{
    const storage = multer.diskStorage({})

    const fileFilter = (req,file,cb)=>{
        if(file.mimetype==='image/jpeg' ||file.mimetype==='image/jpg' || file.mimetype==='image/png'){
            cb(null,true)
        }
        else{
            cb("File Type not supported",false)
        }
    }
    
    let upload = multer({storage: storage, limits:{
        fileSize:1024 * 1024 * 5
    }, fileFilter: fileFilter})
    return upload;
}

//upload image bug

exports.uploadImageBugs = ()=>{

    const storage = multer.diskStorage({})

    const fileFilter = (req,file,cb)=>{
        if(file.mimetype==='image/jpeg' ||file.mimetype==='image/jpg' || file.mimetype==='image/png'){
            cb(null,true)
        }
        else{
            cb("File Type not supported",false)
        }
    }
    
    let upload = multer({storage: storage, limits:{
        fileSize:1024 * 1024 * 5
    }, fileFilter: fileFilter})
    return upload;
}