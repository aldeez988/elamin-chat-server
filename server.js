const express = require("express");
const cors = require('cors')

const app = express();

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

app.post("/messages", function(request, response){
const message=request.body;
  if(!message.from || !message.text){
    response.status(400).json('Please enter complete data')
  }
  message.id = messages.length === 1?messages.length:messages.length+1;
  message.timeSent =new Date();
  messages.push(message);
  console.log(messages);
  response.status(201).json(messages)

});


app.get("/messages/search", function(request,response){
  const text = request.query.text
  console.log(searchForMessage(text))
   response.json(searchForMessage(text))
  
});
app.get("/messages/latest", function(request,response){
  const latetTen = latestTen(messages)
  if(messages.length>10){
    response.json(latetTen)
  }else{
  response.json(messages);
  }
})
function searchForMessage(text){
  return messages.filter(message=>message.text.toLowerCase().includes(text.toLowerCase()))
}

function latestTen(array){
  const firstIndex = messages.length-10;
  const lastIndex = messages.length;
  return messages.slice(firstIndex ,lastIndex)
}

app.listen(process.env.PORT);
