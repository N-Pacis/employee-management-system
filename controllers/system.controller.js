const { Logs } = require("../models/logs.model");

exports.getSystemLogsOfALoggedInUser = async(req, res) => {
    try {
        let logs = await Logs.find({By:req.user._id}).sort([['HappenedAt', 'descending']]);
        if (logs.length == 0) return res.status(404).send("You don't have any logs")
        return res.send({
            status: 200,
            message: "ok",
            data: logs
        })
    } catch (ex) {
        res.status(400).send(ex.message)
    }
}
exports.getAllLogs = async(req, res) => {
    try {
        let logs = await Logs.find().sort([['HappenedAt', 'descending']]);
        if (logs.length == 0) return res.status(404).send("The system doesn't have any logs")
        return res.send({
            status: 200,
            message: "ok",
            data: logs
        })
    } catch (ex) {
        res.status(400).send(ex.message)
    }
}