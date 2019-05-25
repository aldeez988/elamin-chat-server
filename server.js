const express = require("express");
const cors = require('cors')

const app = express();

//getting client 
app.use(cors())
app.use(express.urlencoded({ extended: false }));
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
 
  console.log(ip.split(',')[0])
  response.status(200).json(messages)

});

app.post("/messages", function(request, response){
const message=request.body;
  if(!message.from || !message.text){
    response.status(400).json('Please enter complete data')
  }
  message.id = getUniqueID(messages.length);
  message.timeSent =new Date();
  messages.push(message);
  console.log(messages);
  response.status(201).json(messages)

});



//serach message by Id 
app.get("/messages/:id",function(request,response){
 const id =request.params.id;
  const filteredMessages = messages.filter(message=>message.id == id)
  console.log(filteredMessages)
    response.status(200).json(filteredMessages)


 })


//serach message by text
app.get("/messages/search/:text",function(request,response){
 const text =request.params.text;
  const filteredMessages = messages.filter(message=>message.text.includes(text))
  console.log(filteredMessages)
    response.status(200).json(filteredMessages)


 })


//Get the lastest ten messages 
app.get("/messages/latest", function(request,response){
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
  console.log(messages)
    response.status(201).json(messages)


 })

//updating data to test it you need to use postman
app.patch("/messages", function(request, response){
const {id,from ,text}=request.query;
  console.log("id",id,"from",from , "text",text)
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
    console.log("after",message)


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
    console.log(largestID)
    return largestID+1
  }
  return id
  
}
app.listen(process.env.PORT);
