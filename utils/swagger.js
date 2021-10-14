const swaggerDocs = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const options = {
    openapi: "1.0.0",
    definition: {
        components: { },
        info: {
            title: "Employee Management System",
            description:
                "This is a REST API Documentation for Employee Management System, that will allow managers to register and manage their employees.\n\nMade with ❤️ by NKUBITO Pacis",
            version: "1.0.0",
        },
        consumes: ["application/x-www-form-urlencoded", "application/json", "multipart/form-data"],
        produces: ["application/json"],
        basePath: "/",
    },
    apis: ["./routes/*.js"],
};

const swaggerJsdoc = swaggerDocs(options);

exports.swaggerJsdoc = swaggerJsdoc;
exports.swaggerUi = swaggerUi