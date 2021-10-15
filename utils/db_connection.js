const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE_ATLAS,{
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(()=>console.log("Connected to database successfully"))
.catch(err=>console.log(err))