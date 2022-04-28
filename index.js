const express = require('express')
const app = express()
const cors = require('cors');
app.use(cors());
app.use(express.json())
require('dotenv').config();
const jwt = require('jsonwebtoken');

const port =process.env.PORT || 5000;


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.p7i47.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
      await client.connect();
        //  console.log('db connet')
        const productCollection = client.db("gadgetFreak").collection("products"); //database name ar product mongodb te jabe
        const orderCollection = client.db("gadgetFreak").collection("orders"); 
        
        app.post('/login', (req, res)=>{
            const email = req.body;
            console.log(email)
            const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET); //generating token and secret key
            // console.log(token)
            res.send({token})
        })

         app.post('/uploadPd', async(req, res)=>{
             const product = req.body;
             const tokenInfo = req.headers.authorization;
             console.log(tokenInfo)
             const [email, accessToken] = tokenInfo?.split(" ");

             const decoded = verifyToken(accessToken);
             console.log(decoded, decoded.email)
             if(email === decoded.email){
                const result = await productCollection.insertOne(product);
                res.send({success: "product uploaded successfully"})
             }
             else{
                 res.send({success: "unAuthorized Access"})
             }

            //  console.log(product)
            //  const result = await productCollection.insertOne(product);
            //  res.send({success: "product uploaded successfully"})
         })
         app.get('/products', async(req,res)=>{
             const products = await productCollection.find({}).toArray(); //obj dewate sob gula dekhabe
             res.send(products);
         })
         app.post('/addOrder', async(req, res)=>{
           const orderInfo = req.body;
          //  console.log(orderInfo)
          const result = await orderCollection.insertOne(orderInfo);
          res.send({success: "Order complete"})
         })

         app.get('/orderList', async(req, res)=>{
          const tokenInfo = req.headers.authorization;
          console.log(tokenInfo)
          const [email, accessToken] = tokenInfo?.split(" ");

          const decoded = verifyToken(accessToken);
          if(email === decoded.email){
           const orders = await orderCollection.find({email: email}).toArray();
           res.send(orders)
         }
         else{
             res.send({success: "unAuthorized Access"})
         }
         })
    } finally {
    //   await client.close();
    }
  }
  run().catch(console.dir);

  //verify email for token 
  function verifyToken(token){
    let email;
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded) {
        if(err){
            email = 'Invalid Email'
        }
        if(decoded){
            console.log(decoded)
            email = decoded
        }
      });
      return email;
}

app.get('/gadget', (req, res){
  res.send(' Gadget is here.')
})

app.get('/', (req, res) => {
  res.send('Gadget freak is running')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})



//how to work json web token
/*
1.email is collected from client site and sent to the backend
2. backend email ta k encryption method diye encrypt kore fele
3. api jokhn call hobe email er sathe ecrypted token o chole jabe
4. node server a jokhn ashbe tokhn encrypted token decode hove . jodi mile jay tokhn access pabo
*/