var MongoClient = require('mongodb').MongoClient;
    
var insertData = function(db, table, data, callback) {  
    //连接到表  
    var collection = db.collection(table);
    //插入数据
    collection.insert(data, function(err, result) { 
        if(err)
        {
            console.log('Error:'+ err);
            return;
        }     
        callback(result);
    });
}

exports.insertMongo = function(database, table, data)
{
    var DB_CONN_STR = 'mongodb://localhost:27017/' + database;

    MongoClient.connect(DB_CONN_STR, function(err, db) {
        insertData(db, table, data, function(result) {
            console.log("insert",table,"success");
            db.close();
        });
    });
}

var selectData = function(db, table, where, callback) {  
    //连接到表  
    var collection = db.collection(table);
    //查询数据
    collection.find(where).sort({"_id":-1}).toArray(function(err, result) {
        if(err)
        {
            console.log('Error:'+ err);
            return;
        }     

        console.log("select",where, table, result.length);
        callback(result);
        db.close();
    });
}

exports.selectMongo = function(database, table, where, callback)
{
    var DB_CONN_STR = 'mongodb://localhost:27017/' + database;

    MongoClient.connect(DB_CONN_STR, function(err, db) {
        selectData(db, table, where, callback);
    });
}

var deleteData = function(db, table, where, callback) {  
    //连接到表  
    var collection = db.collection(table);
    //删除数据
    collection.remove(where, function(err, result) {
        if(err)
        {
            console.log('Error:'+ err);
            return;
        }     

        console.log("delete", where, table);
        callback(result);
        db.close();
    });
}

exports.deleteMongo = function(database, table, where, callback)
{
    var DB_CONN_STR = 'mongodb://localhost:27017/' + database;

    MongoClient.connect(DB_CONN_STR, function(err, db) {
        deleteData(db, table, where, callback);
    });
}