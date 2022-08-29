const mongoose = require('mongoose')
const Schema = mongoose.Schema


const codesSchema = new Schema({

    ktp:{
        type:String,
        require:true
    },
    sahipID:{
        type:Number,
        require:true
    },
    kod:{
        type:String,
        require:true
    },
    baslık:{
        type:String,
        require:true
    },
    acıklama:{
        type:String,
        require:true
    },
    altyapı:{
        type:String,
        require:true
    }
} , {timestamps:true})

const codes = mongoose.model('codes' ,codesSchema )
module.exports = codes