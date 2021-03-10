const mongoose = require('mongoose');


const patientSchema = new mongoose.Schema({

    name: 
    {
        type: String,
        required:true
    },
    type:
    {
        type:String,
        required:true

    },
    contact:
    {
        type:String
    },
    email:
    {
        type:String
    },
    gender:
    {
      type:String
    }

    


});

patientSchema.set('timestamps',true)



module.exports=  Patient = mongoose.model('Patient', patientSchema)