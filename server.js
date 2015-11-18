var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [{
    id: 1,
    description: 'Shoot the barman',
    complete: false
}, {
    id: 2,
    description: 'Go to sleep',
    complete: false
},{
    id: 3,
    description: 'Wha you wan',
    complete: true
}];



app.get('/', function(req,res){
    res.send('Todo API root')
});

//GET /todos

app.get('/todos', function (req, res) {
   res.json(todos); 
});

//GET /todos/:id

app.get('/todos/:id', function (req, res){
    //res.send('Asking for todo with id of ' +req.params.id);
    var todoid = parseInt(req.params.id,10);
    var matchedtodo;
    for (var i=0; i<todos.length; i++){
        if(todos[i].id === todoid){
            matchedtodo = todos[i];
        }
    }
    if(matchedtodo){
        res.json(matchedtodo);  
    }else{
        res.status(404).send();
    }
    
});

app.listen(PORT, function () {
    console.log('Express listening on port '+ PORT + '!');
});