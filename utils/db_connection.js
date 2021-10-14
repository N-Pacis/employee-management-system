const mongoose = require('mongoose');

if(process.env.NODE_ENV == 'production'){
    var database_url = process.env.DATABASE_ATLAS
}
else if(process.env.NODE_ENV == 'development'){
    var database_url = process.env.DATABASE_LOCAL
}
mongoose.connect(database_url,{
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(()=>console.log("Connected to database successfully"))
.catch(err=>console.log(err))