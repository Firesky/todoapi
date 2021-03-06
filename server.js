var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var bcrypt = require('bcrypt');


var db = require('./db.js');
var middleware = require('./middleware.js')(db);

var app = express();


var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function(req, res) {
    res.send('Todo API root')
});

//GET /todos

app.get('/todos', middleware.requireAuthentication, function(req, res) {
    var query = req.query;
    var where = {
        userId: req.user.get('id')
    };

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
    }).then(function(todos) {
        res.json(todos);
    }, function(e) {
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

app.get('/todos/:id', middleware.requireAuthentication, function(req, res) {
    //res.send('Asking for todo with id of ' +req.params.id);
    var todoid = parseInt(req.params.id, 10);
    //var matchedtodo = _.findWhere(todos, {id:todoid})
    db.todo.findOne({
        where: {
            id: todoid,
            userId: req.user.get('id')
        }
    }).then(function(todo) {
        if (!!todo) {
            res.json(todo.toJSON());
        } else {
            res.status(404).send();
        }

    }, function(e) {
        res.status(500).send();
    });

    //if(matchedtodo){
    //    res.json(matchedtodo);  
    //}else{
    //    res.status(404).send();
    //}
});

app.post('/todos', middleware.requireAuthentication, function(req, res) {
    var body = _.pick(req.body, 'description', 'completed');

    db.todo.create(body).then(function(todo) {

        req.user.addTodo(todo).then(function() {
            return todo.reload();
        }).then(function(todo) {
            res.json(todo.toJSON());
        });
    }, function(e) {
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

app.delete('/todos/:id', middleware.requireAuthentication, function(req, res) {
    var todoid = parseInt(req.params.id, 10);
    //var matchedtodo = _.findWhere(todos, {
    //    id: todoid
    //});

    db.todo.destroy({
        where: {
            id: todoid,
            userId: req.user.get('id')
        }
    }).then(function(rowsdeleted) {
        if (rowsdeleted === 0) {
            res.status(404).json({
                "error": "no todo found with this id."
            });
        } else {
            res.status(204).send();
        }
    }, function() {
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

app.put('/todos/:id', middleware.requireAuthentication, function(req, res) {
    var todoid = parseInt(req.params.id, 10);
    //var matchedtodo = _.findWhere(todos, {
    //    id: todoid
    //});
    var body = _.pick(req.body, 'description', 'completed');
    //var validAttributes = {};
    attributes = {};

    //if (!matchedtodo) {
    //    return res.status(404).json({
    //        "error": "no todo found with this id."
    //   });
    //}

    //console.log(typeof body.completed);
    //console.log(body.completed);

    if (body.hasOwnProperty('completed')) {
        attributes.completed = body.completed;
    }

    //if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
    //    validAttributes.completed = body.completed;
    // } else if (body.hasOwnProperty('completed')) {
    //   return res.status(400).json({
    //        "error": "completed is the wrong type"
    //    });
    //}

    if (body.hasOwnProperty('description')) {
        attributes.description = body.description;
    }

    //if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
    //    validAttributes.description = body.description;
    //} else if (body.hasOwnProperty('description')) {
    //    return res.status(400).json({
    //        "error": "description is the wrong type"
    //    });
    //}
    //_.extend(matchedtodo, validAttributes);
    //res.json(matchedtodo);

    db.todo.findOne({
        where: {
            id: todoid,
            userId: req.user.get('id')
        }
    }).then(function(todo) {
        if (todo) {
            todo.update(attributes).then(function(todo) {
                res.json(todo.toJSON())
            }, function(e) {
                res.status(400).json(e);
            });;
        } else {
            res.status(404).send();
        }
    }, function(e) {
        res.status(500).send();
    });
});

app.post('/users', function(req, res) {
    var body = _.pick(req.body, 'email', 'password');

    db.user.create(body).then(function(user) {
        res.json(user.topublicJson());
    }, function(e) {
        res.status(400).json(e);
    });
});

app.post('/users/login', function(req, res) {
    var body = _.pick(req.body, 'email', 'password');
    var userInstance;

    db.user.authenticate(body).then(function(user) {
        //console.log(user.generateToken('authentication'));
        var token = user.generateToken('authentication');
        userInstance = user;
        
        return db.token.create({
            token: token
        });

        // if (token) {
        //    res.header('Auth', token).json(user.topublicJson());
        // } else {
        //   res.status(401).send();
        // }

    }).then(function(tokenInstance) {
        res.header('Auth', tokenInstance.get('token')).json(userInstance.topublicJson());
    }).catch( function() {
        res.status(401).send();
    });

});

//DELETE /users/login

app.delete('/users/login', middleware.requireAuthentication, function(req,res){
    req.token.destroy().then( function(){
        res.status(204).send();
    }).catch( function (){
        res.status(500).send();
    })
});

db.sequelize.sync({
    force: true
}).then(function() {
    app.listen(PORT, function() {
        console.log('Express listening on port ' + PORT + '!');
    });

});