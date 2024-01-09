const passport = require('passport');
const User=require('../../models/user');
const bcrypt=require('bcrypt');
const authController=()=>{
    return{
        login(req,res){
            res.render("auth/login")
        },
        postLogin(req,res,next){
            passport.authenticate('local',(err,user,info)=>{
                if(err){
                    req.flash('err',info.message)
                    return next(err)
                }
                if(!user){
                    req.flash('err',info.message)
                    return res.redirect('/login')
                }
                req.logIn(user,(err)=>{
                    if(err){
                        req.flash('err',info.message)
                        return next(err)
                    }
                    return res.redirect('/')
                })
            })(req,res,next)
        },
        register(req,res){
            res.render("auth/register")
        },
        async postRegister(req,res){
            const {username,email,password}=req.body;
            
            // validation
            if(!username || !email || !password){
                req.flash('err','All fields are required')
                req.flash('username',username);
                req.flash('email',email);
                return res.redirect('/register')
            }
            // if email already exists
            const existUser=await User.findOne({"email":email});
            if(existUser){
                req.flash('err','Email already exists')
                req.flash('email',email)
                req.flash('username',username)
                return  res.redirect("/register");
            }
            console.log(req.body);

            // hashed pass
            const hashedPass=await bcrypt.hash(password,10);

            // if everything is ok create user
            const user=new User({
                username:username,
                email:email,
                password:hashedPass
            })

            user.save().then(()=>{
                return res.redirect('/');
            }).catch(err=>{
                req.flash('err','something west wrong')
                return res.redirect('/register')
            })
        },
        logout(req,res){
            req.logout((err)=>{
                if(err){
                    console.error("Logging out error : "+ err);
                    return res.redirect('/');
                }
                res.redirect('/login')
            })
        }
    }
}
module.exports=authController;