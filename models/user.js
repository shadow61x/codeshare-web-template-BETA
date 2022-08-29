const mongoose = require('mongoose')
const Schema = mongoose.Schema


const userSchema = new Schema({

username:{
    type:String,
    require:true
},
userıd:{
    type:Number,
    require:true
},
admin:{
    type:Boolean,
    require:true
},
sharer:{
    type:Boolean,
    require:true
},
vip:{
    type:Boolean,
    require:true
}

} , {timestamps:true})

const user = mongoose.model('user' ,userSchema )
module.exports = user