var Article = require('../models/article.js');

var submitArtical = function(req, res)
{
    new Article(req.body.title, req.body.img, req.body.content).save();
    res.end("success");
};

var uploadimg = function(req, res) {
    console.log('name',req.files.upload.name);

    if(req.files.upload.name == "")
    {
        res.end("no photo");
        return;
    }

    var fs = require('fs');
    var tmpPath = req.files.upload.path;
    //移动到指定的目录，一般放到public的images文件下面
    //在移动的时候确定路径已经存在，否则会报错
    var targetPath = 'public/images/' + req.files.upload.name;

    //将上传的临时文件移动到指定的目录下
    fs.rename(tmpPath, targetPath , function(err) {
        if(err){
            throw err;
        }
        //删除临时文件
        fs.unlink(tmpPath, function(){
            if(err) {
                throw err;
            }
        });
    });
    
    res.end("success");
};

var getArticles = function(req, res)
{
    new Article().getAll(req, res, function(result, req, res){
        res.render('list', {
            title: 'List',
            items: result
        });
    });
};

var getDelist = function(req, res)
{
    new Article().getAll(req, res, function(result, req, res){
        res.render('delist', {
            items: result,
            layout: 'delayout'
        });
    });
};

var delArticle = function(req, res)
{
    new Article().delete(req.body.id);
    res.end("success");
};

module.exports = function(app) {
    app.get('/', getArticles);

    app.get('/create', function(req, res) {
        res.render('create', {
        title: 'Admin',
        layout: 'admin'
        });
    });

    app.post('/submit', submitArtical);

    app.post('/uploadimg', uploadimg);

    app.get('/del', getDelist);

    app.post('/dodel', delArticle);
};
