const express=require("express");
const app=express();
const expressLayout=require("express-ejs-layouts");
const path=require("path");
const PORT=process.env.PORT || 3000;

app.set('views',path.join(__dirname,'/resources/views'))
app.set("view engine","ejs");

app.get("/",(req,res)=>{
        res.render('home')
})

app.use(expressLayout);

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})