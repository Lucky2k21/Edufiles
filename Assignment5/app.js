let express=require('express');
let app=express();
let port=9500;
let bodyParser=require('body-parser');
let cors=require('cors');
let mongo=require('mongodb');
const MongoClient=mongo.MongoClient;
const mongoUrl = "mongodb://localhost:27017";
let db;
app.use(express.json());

// middleware
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))

app.get('/',(req,res)=>{
    res.send('<h1>welcome</h1>')
})

app.get('/location',(req,res) => {
   db.collection('location').find().toArray((err,result) => {
       if(err) throw err;
       res.send(result)
   })
})

app.get('/restaurants',(req,res) => {
    let stateId = Number(req.query.stateId)
    let mealId = Number(req.query.mealId)
    let query = {}
    if(stateId && mealId){
        query={state_id:stateId,"mealTypes.mealtype_id":mealId}
    }else if(stateId){
        query={state_id:stateId}
    }else if(mealId){
        query={"mealTypes.mealtype_id":mealId}
    }
    db.collection('restaurants').find(query).toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
 })

 app.get('/filters/:mealId',(req,res) => {
     let query = {};
     let mealId = Number(req.params.mealId);
     let cuisineId = Number(req.query.cuisineId);
     let lcost = Number(req.query.lcost);
     let hcost = Number(req.query.hcost);
     let sort = {cost:1};
     if(req.query.sort){
         sort={cost:req.query.sort}
     }

     if(cuisineId){
         query={
            "mealTypes.mealtype_id":mealId,
            "cuisines.cuisine_id":cuisineId
         }
     }else if(lcost && hcost){
        query={
            "mealTypes.mealtype_id":mealId,
            $and:[{cost:{$gt:lcost,$lt:hcost}}]
         }
     }
     db.collection('restaurants').find(query).sort(sort).toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
 })


 app.get('/mealType',(req,res) => {
    db.collection('mealType').find().toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
 })


app.get('/details/:restId',(req,res) => {
    //let id = mongo.ObjectId(req.params.restId)
    let id = Number(req.params.restId)
    db.collection('restaurants').find({restaurant_id:id}).toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
})


app.listen(port,()=>{
    console.log(`server running on ${port}`)
})




// connect with mongodb
MongoClient.connect(mongoUrl,{useNewUrlParser:true},(err,dc)=>{
    if(err) console.log('error while connecting');
    db = dc.db('intern');

})
