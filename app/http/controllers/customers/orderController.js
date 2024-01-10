const Order=require('../../../models/order')
const moment=require('moment')

const orderController=()=>{
    return{
        async store(req,res){
            // console.log(req.body);
            const {number,address}=req.body;

            if(!number || !address){
                req.flash('err','All fields are required')
                return res.redirect('/cart')
            }
            // console.log(req.user._conditions);
        
            const order=new Order({
                customerId:req.user._conditions._id,
                items:req.session.cart.items,
                phone:number,
                address:address
            })
            const confirmOrder=await order.save();
            if(confirmOrder){
               const result=await Order.populate(confirmOrder,{path:'customerId'})

                    req.flash('success','Order placed successfully')
                    delete req.session.cart
                    // Emit
                    const eventEmitter=req.app.get('eventEmitter')
                    eventEmitter.emit('orderPlaced',result)
                    
                    return res.redirect('/customer/order')
                
                }
            return res.redirect('/cart')
        },
        async index(req,res){
            const orders=await Order.find({customerId:req.user._conditions._id},null,{sort:{'createdAt':-1}})
            // console.log(orders);
            res.render('customers/order',{orders:orders,moment:moment})
        },

        async show(req,res){
           
            const order= await Order.findById({_id:req.params.id})
            try{
                // console.log(req.user._conditions._id);
                // console.log(order.customerId.toString());
           if(req.user._conditions._id===order.customerId.toString()){
            res.render('customers/singleOrder',{order})
           }else{
            res.redirect('/')
           }
        }catch(err){
            res.redirect('/login')
        }
        }
    }
}
module.exports=orderController;