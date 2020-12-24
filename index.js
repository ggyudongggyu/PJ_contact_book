var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser'); // 1
var methodOverride = require('method-override'); // 1

var app = express();

mongoose.set('useNewUrlParser', true);    // 1
mongoose.set('useFindAndModify', false);  // 1
mongoose.set('useCreateIndex', true);     // 1
mongoose.set('useUnifiedTopology', true); // 1
mongoose.connect(process.env.MONGO_DB); // 2
var db = mongoose.connection; //3
//4
db.once('open', function(){
  console.log('DB connected');
});
//5
db.on('error', function(err){
  console.log('DB ERROR : ', err);
});
// Other settings
app.set('view engine', 'ejs');
app.use(express.static(__dirname+'/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride('_method'));

// DB schema // 4
var contactSchema = mongoose.Schema({
  name:{type:String, required:true, unique:true},
  email:{type:String},
  phone:{type:String}
});
var Contact = mongoose.model('contact', contactSchema); // 5

// Routes
// Home // '/'에get요청이 오는 경우 /contacts로 redirect하는 코드.
app.get('/', function(req, res){
  res.redirect('/contacts');
});
// Contacts - Index // /contacts에 get요청이 오는 경우
//에러가 있다면 에러를 json형태로 웹브라우저에 표시하고,
//에러가 없다면 검색 결과를 받아 views/contacts/index.ejs를
//render(페이지를 다이나믹하게 제작)합니다.
app.get('/contacts', function(req, res){
  Contact.find({}, function(err, contacts){
    if(err) return res.json(err);
    res.render('contacts/index', {contacts:contacts});
  });
});


// Contacts - New // 8
app.get('/contacts/new', function(req, res){
  res.render('contacts/new');
});


// Contacts - create // 9
// view/contacts/new.ejs의
//<form class="contact-form" action="/contacts" method="post">부분에서
//폼을 전달받은 경우임.
app.post('/contacts', function(req, res){
  Contact.create(req.body, function(err, contact){
    if(err) return res.json(err);
    res.redirect('/contacts');
  });
});


// contacts - show
app.get('/contacts/:id', function(req,res){
  Contact.findOne({_id:req.params.id}, function(err, contact){
    if(err) return res.json(err);
    res.render('contacts/show',{contact:contact});
  });
});

// Contacts - edit // 4
app.get('/contacts/:id/edit', function(req, res){
  Contact.findOne({_id:req.params.id}, function(err, contact){
    if(err) return res.json(err);
    res.render('contacts/edit', {contact:contact});
  });
});
// Contacts - update // 5
app.put('/contacts/:id', function(req, res){
  Contact.findOneAndUpdate({_id:req.params.id}, req.body, function(err, contact){
    if(err) return res.json(err);
    res.redirect('/contacts/'+req.params.id);
  });
});
// Contacts - destroy // 6
app.delete('/contacts/:id', function(req, res){
  Contact.deleteOne({_id:req.params.id}, function(err){
    if(err) return res.json(err);
    res.redirect('/contacts');
  });
});


var port = 3000;
app.listen(port, function(){
  console.log('server on! http://localhost:'+port);
});
