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
        }
    }
}
module.exports=orderController;