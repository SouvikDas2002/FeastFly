const homeController=require("../app/http/controllers/homeController")
const authController=require("../app/http/controllers/authController")
const cartController=require("../app/http/controllers/customers/cartController")
const guest=require('../app/http/middlewares/guest')
const orderController=require("../app/http/controllers/customers/orderController")
const auth=require('../app/http/middlewares/auth')
const admin=require('../app/http/middlewares/admin')
const adminController=require('../app/http/controllers/admin/orderController');

const routeGateWay=(app)=>{
    app.get("/",homeController().index)

    app.get("/login",guest,authController().login)
    
    app.post("/login",authController().postLogin)
    
    app.get("/register",guest,authController().register)
    
    app.post("/register",authController().postRegister)
    
    app.get("/cart",cartController().cart)
    
    app.post("/update-cart",cartController().update);

    app.post("/logout",authController().logout);

    app.post("/orders",auth,orderController().store);

    app.get('/customer/order',auth,orderController().index)

    app.get('/customer/order/:id',auth,orderController().show)

    // Admin routes

    app.get('/admin/orders',admin,adminController().index)
    app.post('/admin/orders/status',admin,adminController().status)


    // same work but keep the logics in controller folders
    // app.get("/",(req,res)=>{
    //     res.render('home')
    // })
    // app.get("/cart",(req,res)=>{
    //     res.render('customers/cart')
    // })
    // app.get("/login",(req,res)=>{
    //     res.render('auth/login')
    // })
    // app.get("/register",(req,res)=>{
    //     res.render('auth/register')
    // })
}
module.exports=routeGateWay;