const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE_ATLAS_CONNECTION_LINK,{
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(()=>console.log("Connected to database successfully"))
.catch(err=>console.log(err))