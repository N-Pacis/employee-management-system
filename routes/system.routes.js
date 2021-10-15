const express = require("express")
const { getSystemLogsOfALoggedInUser,getAllLogs } = require("../controllers/system.controller")
const router = express.Router()
const authenticate = require('../middlewares/auth.middleware')

/**
 * @swagger
 * /user/system/logs:
 *   get:
 *     tags: [SYSTEM]
 *     description: Get your system logs    
 *     summary: Get your system logs    
 *     parameters: 
 *       - name: Authorization
 *         description: JWT token of the user
 *         type: string
 *         in: header
 *         required: true
 *     responses:
 *       200:
 *         description:Success
 *       400:
 *         description:Bad Request
 *       404:
 *         description:Not Found
 *       500:
 *         description: Internal Server Error
 */
 router.get("/user/system/logs",authenticate,getSystemLogsOfALoggedInUser)

 /**
 * @swagger
 * /system/logs/all:
 *   get:
 *     tags: [SYSTEM]
 *     description: Get all system logs    
 *     summary: Get all system logs    
 *     parameters: 
 *       - name: Authorization
 *         description: JWT token of the user
 *         type: string
 *         in: header
 *         required: true
 *     responses:
 *       200:
 *         description:Success
 *       400:
 *         description:Bad Request
 *       404:
 *         description:Not Found
 *       500:
 *         description: Internal Server Error
 */
  router.get("/system/logs/all",authenticate,getAllLogs)

module.exports = router