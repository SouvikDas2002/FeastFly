const order=require('../../../models/order')
const orderController=()=>{
    return {
       async index(req,res){
            const orders=await order.find({status:{$ne:'completed'}},null,{sort:{'createdAt':-1}}).populate('customerId','-password').exec()
            // console.log(orders);
            if(req.xhr){
                return res.json(orders)
            }else{
            return res.render("admin/orders.ejs")
            }
        },

        async status(req,res){
            try{
            const updateStatus=await order.updateOne({_id:req.body.orderId},{status:req.body.status});
            return res.redirect('/admin/orders')
            }catch(err){
                return res.redirect('/admin/orders')
            }
        }
    }
}
module.exports=orderController;