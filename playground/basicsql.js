var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
    'dialect': 'sqlite',
    'storage': __dirname + '/basic-sqlite.database.sqlite'
});

var ToDo = sequelize.define('todo', {
    description: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            len: [1, 250]
        }
    },
    completed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
});
sequelize.sync({
    //force: true
}).then(function () {
    console.log('Everything is Synced');

    ToDo.findById(3).then(function (todo) {
        //console.log(todo.length);
        if (todo) {
            console.log('Yes');
            console.log(todo.toJSON());
        } else {
            console.log('No todo found');
        }
    }).catch( function(e){
        console.log(e);
    });

    /* ToDo.create({
         description: 'Yogi is a bear',
         //completed: false
     }).then(function (todo) {
         return ToDo.create({
             description: 'Find Brain'
         }).then(function () {
             //return ToDo.findById(2);
             return ToDo.findAll({
                 where: {
                     description: {
                         $like: '%bear%'
                     }
                 }
             });
         }).then(function (todos) {
             if (todos) {
                 todos.forEach(function (todo) {
                     console.log(todo.toJSON())
                 });

             } else {
                 console.log('No todo found');
             }
         });
     }).catch(function (e) {
         console.log(e)
     });*/
});