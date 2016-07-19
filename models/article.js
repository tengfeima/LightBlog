var mongo = require('../models/mongo');
var ObjectID = require('mongodb').ObjectID;

function Article(title, img, content) {
    this.title = title || '';
    this.img = (typeof img == "undefined" || img == '') ? '' : 'images/' + img.split("\\").pop();
    this.content = content || '';
};

module.exports = Article;

Article.prototype.save = function() {
    var article = {
        title : this.title,
        img : this.img,
        content : this.content
    };

    mongo.insertMongo('john', 'articles', article);
};

Article.prototype.getAll = function(req, res, callback){
    var where = {};
    mongo.selectMongo('john', "articles", where, function(result){
        callback(result, req, res);
    });
};

Article.prototype.delete = function(id){
    var where = {"_id":new ObjectID(id)};

    mongo.selectMongo('john', "articles", where, function(result){
        var path = "public\\" + result[0].img;
        console.log("del img", path);

        if(path != "" && typeof path != undefined)
        {
            var fs = require('fs');
            fs.unlink(path);
        }
    });

    mongo.deleteMongo('john', "articles", where, function(result){
    });
}