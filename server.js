var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

var db = require('./db.js');

var app = express();


var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.send('Todo API root')
});

//GET /todos

app.get('/todos', function (req, res) {
    var query = req.query;
    var where = {};

    if (query.hasOwnProperty('completed') && query.completed === 'true') {
        where.completed = true;
    } else if (query.hasOwnProperty('completed') && query.completed === 'false') {
        where.completed = false;
    }

    if (query.hasOwnProperty('q') && query.q.length > 0) {
        where.description = {
            $like: '%' + query.q + '%'
        }

    }
    db.todo.findAll({
        where: where
    }).then(function (todos) {
        res.json(todos);
    }, function (e) {
        res.status(500).send();
    });
    //var filteredTodos = todos;  

    //if (queryParams.hasOwnProperty('completed')){
    //console.log(Boolean(queryParams.completed));
    //  filteredTodos = _.where(filteredTodos,{completed:JSON.parse(queryParams.completed)})
    //} 
    //console.log(queryParams.q);

    //if (queryParams.hasOwnProperty('q')){
    //  filteredTodos = _.filter(filteredTodos, function (todo){
    //console.log(todo.description.indexOf(queryParams.q)>-1);
    //    return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase())>-1;
    //});
    //}
    //res.json(filteredTodos); 
});

//GET /todos/:id

app.get('/todos/:id', function (req, res) {
    //res.send('Asking for todo with id of ' +req.params.id);
    var todoid = parseInt(req.params.id, 10);
    //var matchedtodo = _.findWhere(todos, {id:todoid})
    db.todo.findById(todoid).then(function (todo) {
        if (!!todo) {
            res.json(todo.toJSON());
        } else {
            res.status(404).send();
        }

    }, function (e) {
        res.status(500).send();
    });

    //if(matchedtodo){
    //    res.json(matchedtodo);  
    //}else{
    //    res.status(404).send();
    //}
});

app.post('/todos', function (req, res) {
    var body = _.pick(req.body, 'description', 'completed');

    db.todo.create(body).then(function (todo) {
        res.json(todo.toJSON());
    }, function (e) {
        res.status(400).json(e);
    });

    //if(!_.isBoolean(!body.completed) || !_.isString(body.description) || body.description.trim().length === 0 ){
    //    return res.status(400).send();
    //}
    //body.description = body.description.trim();
    //body.id = todoNextId++;
    //todos.push(body);

    //console.log('description: '+body.description );
    //res.json(body);
});

app.delete('/todos/:id', function (req, res) {
    var todoid = parseInt(req.params.id, 10);
    //var matchedtodo = _.findWhere(todos, {
    //    id: todoid
    //});
    
    db.todo.destroy({
        where:{
            id:todoid
        }
    }).then(function(rowsdeleted){
       if(rowsdeleted === 0){
          res.status(404).json({
            "error": "no todo found with this id."
        }); 
       } else {
           res.status(204).send();
       }
    }, function(){
        res.status(500).send();
    });
    

    //if (matchedtodo) {
    //    todos = _.without(todos, matchedtodo);
    //    res.json(matchedtodo);
    //} else {
    //    res.status(404).json({
    //        "error": "no todo found with this id."
    //    });
    //}

});

app.put('/todos/:id', function (req, res) {
    var todoid = parseInt(req.params.id, 10);
    var matchedtodo = _.findWhere(todos, {
        id: todoid
    });
    var body = _.pick(req.body, 'description', 'completed');
    var validAttributes = {};

    if (!matchedtodo) {
        return res.status(404).json({
            "error": "no todo found with this id."
        });
    }

    console.log(typeof body.completed);
    console.log(body.completed);

    if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
        validAttributes.completed = body.completed;
    } else if (body.hasOwnProperty('completed')) {
        return res.status(400).json({
            "error": "completed is the wrong type"
        });
    }

    if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
        validAttributes.description = body.description;
    } else if (body.hasOwnProperty('description')) {
        return res.status(400).json({
            "error": "description is the wrong type"
        });
    }
    _.extend(matchedtodo, validAttributes);
    res.json(matchedtodo);
});

db.sequelize.sync().then(function () {
    app.listen(PORT, function () {
        console.log('Express listening on port ' + PORT + '!');
    });

});