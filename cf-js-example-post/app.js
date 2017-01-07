
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , test = require('./routes/test')
  , http = require('http')
  , path = require('path')
  , mongoose = require('mongoose')
  , cfenv = require('cfenv');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
var appEnv = cfenv.getAppEnv();
var mongoLabUrl = appEnv.getServiceURL('my-mongo-database');
if (mongoLabUrl == null) {
	//local or prod development
	mongoose.connect('mongodb://localhost/my-mongo-database');
} else {
	//cloud foundry
	mongoose.connect(mongoLabUrl);
}

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var issueSchema = mongoose.Schema({
    title: String,
    description: String
});
var Issue = mongoose.model("Issue", issueSchema);

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/test', test.send_form);
app.post('/test', function(req, res){
    var issueInfo = req.body; //Get the parsed information
    if(!issueInfo.title || !issueInfo.description){
        res.send("Sorry, you provided worng info!");
    }
    else{	
        var newIssue = new Issue({ 
            title: issueInfo.title,
            description: issueInfo.description
        });
        newIssue.save(function(err, res_db){
            if(err){
                res.send("TestDB Error /!");
            }
            else{
                res.send("TestDB OK /!");
            }
        });
		
    }	
});

app.get('/query', function(req, res){
    Issue.find(function(err, res_db){
        res.json(res_db);
    });
});

app.get('/debug', function(req, res){
    res.send("mongoLabUrl="+mongoLabUrl+",  appEnv="+appEnv);	
});


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
