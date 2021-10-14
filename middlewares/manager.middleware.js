function manager(req,res,next){
    if(req.user.Position != 'MANAGER') return res.status(403).send("This route can be accessed by manager only!")
    next()
}

module.exports = manager;