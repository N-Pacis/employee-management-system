const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config({path:'./.env'});
require("./utils/db_connection");
const PORT = process.env.PORT
const cors = require('cors');
const {swaggerJsdoc,swaggerUi} = require("./utils/swagger")
const {corsFunction} = require("./utils/cors")

app.use(cors());
app.use(corsFunction);
require('./utils/production')(app)

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static("ExcelSheets"))

app.use("/documentation", swaggerUi.serve, swaggerUi.setup(swaggerJsdoc));
app.use(require("./routes/user.routes"))
app.use(require("./routes/employee.routes"))
app.use(require("./routes/system.routes"))

app.listen(process.env.PORT || PORT ,()=>{
    console.log(`Server is listening on port ${PORT}`);
})

module.exports = app