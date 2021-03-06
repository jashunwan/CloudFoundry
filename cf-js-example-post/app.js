
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

app.get('/test1', test.send_form);
app.post('/test1', function(req, res){
	test.process_post(req, res, Issue);
});
app.get('/query1', function(req, res){
	test.process_query(req, res, Issue);
});


app.get('/debug', function(req, res){
    res.send("mongoLabUrl="+mongoLabUrl+",  appEnv="+appEnv);	
});


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
