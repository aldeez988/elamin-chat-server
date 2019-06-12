const express = require("express");
const cors = require('cors')
const socket =require("socket.io")
const bodyParser =require('body-parser')
const app = express();

app.use(function(req, res, next) {
  const forwarded = req.headers["x-forwarded-for"];
  let ip = forwarded ? forwarded.split(/, /)[0] : req.connection.remoteAddress;
  ip = ip.split(",")[0];
  const log = {
    ip: ip,
    osAndBrowserDetails: req.headers["user-agent"],
    requestMethod: req.method,
    requestBody: req.body,
    requestDate: new Date()
  };

  next();
});
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const welcomeMessage = {
  id: 0,
  from: "Bart",
  text: "Welcome to CYF chat system!"
}

//This array is our "data store".
//We will start with one message in the array.
//Note: messages will be lost when Glitch restarts our server.
let messages = [welcomeMessage]


app.get('/', function(request, response) {
  response.sendFile(__dirname + '/index.html');
  
});
app.get("/messages", function(request, response){
const forwarded = request.headers['x-forwarded-for']
let ip = forwarded ? forwarded.split(/, /)[0] : request.connection.remoteAddress
  ip=ip.split(',')[0];

messages = messages.map(message=>{
  if(message.ip==ip){ 
  message.isSameIpAddress = true;
  }else{
     message.isSameIpAddress = false;
  }
  return message
})


  response.status(200).json(messages)

});

app.post("/messages",function(request, response){
const forwarded = request.headers['x-forwarded-for']
let ip = forwarded ? forwarded.split(/, /)[0] : request.connection.remoteAddress
  ip=ip.split(',')[0]
const message=request.body;
  if(!message.from.length  || !message.text.length){
    response.status(400).json('Please enter complete data')
  }
  message.id = getUniqueID(messages.length);
  message.ip = ip
  message.timeSent =new Date();
  messages.push(message);
  response.status(201).json(message)

});



//serach message by Id 
app.get("/messages/:id",function(request,response){
 const id =request.params.id;
  const filteredMessages = messages.filter(message=>message.id == id)
    response.status(200).json(filteredMessages)


 })


//serach message by text
app.get("/messages/search/:text",function(request,response){
 const text =request.params.text;
  const filteredMessages = messages.filter(message=>message.text.includes(text))
    response.status(200).json(filteredMessages)


 })


//Get the lastest ten messages 
app.get("/messages/latest",function(request,response){
  const latetTen = latestTen(messages)
  if(messages.length>10){
    response.json(latetTen)
  }else{
  response.json(messages);
  }
})

//Delete message By ID 
app.delete("/messages/:id",function(request,response){
 const id =request.params.id;
  messages = messages.filter(message=>message.id !=id)
    response.status(201).json(messages)


 })

//updating data to test it you need to use postman
app.put("/messages",function(request, response){
const {id,from ,text}=request.query;
   if(!id && !from || !text ){
    response.status(400).json('Please enter complete data for update')
  }
messages = messages.map(message=>{
  if(message.id ==id)
    {
      if(!from && !text || !text ){
        return 
      }
        message.from =from ;
        message.text= text;

     
    }


        return message



})
  response.json(messages).status(201)

});


function searchForMessage(text){
  return messages.filter(message=>message.text.toLowerCase().includes(text.toLowerCase()))
}

function latestTen(array){
  const firstIndex = messages.length-10;
  const lastIndex = messages.length;
  return messages.slice(firstIndex ,lastIndex)
}

function getUniqueID(id){
  const idExist= messages.find(message=> message.id == id)
  if(idExist){
    const largestID = messages.map(message=>message.id).reduce((acc,curr)=>Math.max(acc,curr)) 
    // console.log(largestID)
    return largestID+1
  }
  return id
  
}
const server =app.listen(process.env.PORT);

const io = socket(server);

io.on("connection",function(socket){
  console.log("****made socket connection****");
  socket.on("chat" , function(data){
    console.log(data)
    io.sockets.emit("chat",messages)
  });
  
});


//******************
app.put("/messages/:id",function(request, response){
const {from ,text}=request.body?request.body:null;
  const id =Number(request.params.id)
   if(!id && !from || !text ){
    response.status(400).json('Please enter complete data for update')
  }
const message = messages.find(message=>message.id===id)
  //edit msg in place
if(message){
  message.text=text
}else{
   response.sendStatus(404)
}
  
  response.json(message).status(200)

});