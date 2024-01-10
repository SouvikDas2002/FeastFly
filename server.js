const express=require("express");
const app=express();
require("dotenv").config();
const expressLayout=require("express-ejs-layouts");
const path=require("path");
const PORT=process.env.PORT || 3000;
const DB=require("./mongodb/connection")
const session=require('express-session')
const flash=require('express-flash');
const MongoDBStore=require("connect-mongo")
const passport=require('passport')
DB();



//session store

// const mongoStore=MongoDBStore.create({
    //     url:"mongodb://127.0.0.1:27017/FoodDelivery",
    //     collection:'sessions'
    // })
    
    //session config
    
    app.use(session({
        secret:process.env.COOKIE_SECRET,
        resave:false,
        // store:new MongoDBStore({url:"mongodb://127.0.0.1:27017/FoodDelivery"}),
        saveUninitialized:false,
        cookie:{maxAge:1000*60*60*24} //1D
    }))

    // passport config
    const passportInit=require('./app/config/passport')
    passportInit(passport);
    app.use(passport.initialize())
    app.use(passport.session())

// golbal middleware

app.use((req,res,next)=>{
   
    res.locals.session=req.session;
    res.locals.user=req.user;
    next();
})

app.use(express.urlencoded({extended:true}))
app.use(flash());
app.use(express.json())
app.set('views',path.join(__dirname,'/resources/views'))
app.set("view engine","ejs");
app.use(express.static('public'));
app.use(express.static('resources/js'));


const routeGateWay=require("./routes/web");
routeGateWay(app);

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})