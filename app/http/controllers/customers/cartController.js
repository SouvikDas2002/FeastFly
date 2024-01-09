const cartController=()=>{
    return{
        cart(req,res){
            res.render("customers/cart")
        },
        update(req,res){
            //structure that have to follow
            // let cart={
            //     item:{
            //         Id:{item:Object,qty:0},
            //     },
            //     totalQty:0,
            //     totalPrice:0
            // }

            //for the first time creating cart and adding basic object structure
            if(!req.session.cart){
                req.session.cart={
                    items:{},
                    totalQty:0,
                    totalPrice:0
                }
            }
            let cart=req.session.cart;
            console.log(req.body);

            if(!cart.items[req.body._id]){
                cart.items[req.body._id]={
                    item:req.body,
                    qty:1
                }
                cart.totalQty=cart.totalQty+1
                cart.totalPrice=cart.totalPrice+(parseInt(req.body.price))
            }else{
                cart.items[req.body._id].qty += 1;
                cart.totalQty=cart.totalQty+1
                cart.totalPrice=cart.totalPrice+(parseInt(req.body.price))
            }

            return res.json({totalQty:req.session.cart.totalQty})
        }
    }
}
module.exports=cartController;