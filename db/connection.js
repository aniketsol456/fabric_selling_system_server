const mongoose = require("mongoose");
const DB = "mongodb+srv://aniketsolanki9054:Anikets_007@cluster1.ymz0h.mongodb.net/AuthUsers?retryWrites=true&w=majority&appName=Cluster1";

mongoose.connect(DB,{
    useUnifiedTopology: true,
    useNewUrlParser: true
}).then(()=>console.log("DataBase Connected")).catch((errr)=>{
    console.log(errr);
    
})