const Item=require('../../models/item')
const homeController=()=>{
    return{
        async index(req,res){
            const items=await Item.find()
            // console.log(items);
            res.render("home",{allItems:items})
        }
    }
}
module.exports=homeController;