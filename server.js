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
const messages = [welcomeMessage]


app.get('/', function(request, response) {
  response.sendFile(__dirname + '/index.html');
  
});

app.post("/messages", function(request, response){
const message=request.body;
  if(!message.from || !message.text){
    response.status(400).json('Please enter complete data')
  }
  message.id = messages.length === 1?messages.length:messages.length+1;
  messages.push(message);
  console.log(messages);
  response.status(201).json(message)

});


app.get("/messages/search", function(request,response){
  const text = request.query.text
  console.log(searchForMessage(text))
  // response.status(201).json()
  
});

function searchForMessage(text){
  return messages.filter(message=>message.text.toLowerCase().includes(text.toLowerCase()))
}



app.listen(process.env.PORT);
