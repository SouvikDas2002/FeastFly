const user=require('../../models/user');
async function admin(req,res,next){
    try{
    const admin=await user.findOne({_id:req.user._conditions._id})
    if(req.isAuthenticated() && admin.role==='admin'){
        return next();
    }
}catch(err){
    return res.redirect('/')
}
}
module.exports=admin;