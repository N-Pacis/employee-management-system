const { Logs, validateLogging } = require("../models/logs.model");
exports.log = async(action,details,by)=>{
    let{err} = validateLogging({
        Action:action,
        details:details,
        HappenedAt: new Date(),
        By: by
    })

    if(err) return res.status(400).send(`Unable to perform system logs due to:${err.message}`)
    let logs = new Logs({
        Action:action,
        details:details,
        HappenedAt: new Date(),
        By:by
    })
    await logs.save()
}
