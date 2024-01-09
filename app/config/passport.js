const localStrategy=require("passport-local").Strategy
const User=require('../models/user');
const bcrypt=require('bcrypt');

const init=(passport)=>{
    passport.use(new localStrategy({usernameField:'email'},async(email,password,done)=>{
        const user=await User.findOne({email:email})
        if(!user){
            return done(null,false,{message:"No user found"});
        }
        bcrypt.compare(password,user.password).then(match=>{
            if(match){
                return done(null,user,{message:"Logged in Succesfull"})
            }
            return done(null,false,{message:"Check your credentials again"})
        }).catch(err=>{
            console.log(err);
            return done(null,false,{message:"something went wrong"})
        })
    }))
    passport.serializeUser((user,done)=>{
        done(null,user._id)
    })
    passport.deserializeUser((id,done)=>{
        const user=User.findById(id)
        done(null,user)
    })
}
module.exports=init;

