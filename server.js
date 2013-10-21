//setup Dependencies
var connect = require('connect')
    , express = require('express')
    , io = require('socket.io')
    , port = (process.env.PORT || 8081), gpio = require('pi-gpio'), WebSocketServer = require('ws').Server, Imap = require('imap'), inspect = require('util').inspects


//Setup Express
var server = express.createServer();
server.configure(function(){
    server.set('views', __dirname + '/views');
    server.set('view options', { layout: false });
    server.use(connect.bodyParser());
    server.use(express.cookieParser());
    server.use(express.session({ secret: "shhhhhhhhh!"}));
    server.use(connect.static(__dirname + '/static'));
    server.use(server.router);
});

//setup the errors
server.error(function(err, req, res, next){
    if (err instanceof NotFound) {
        res.render('404.jade', { locals: { 
                  title : '404 - Not Found'
                 ,description: ''
                 ,author: ''
                 ,analyticssiteid: 'XXXXXXX' 
                },status: 404 });
    } else {
        res.render('500.jade', { locals: { 
                  title : 'The Server Encountered an Error'
                 ,description: ''
                 ,author: ''
                 ,analyticssiteid: 'XXXXXXX'
                 ,error: err 
                },status: 500 });
    }
});
server.listen( port);

//Setup Socket.IO
var io = io.listen(server);
io.sockets.on('connection', function(socket){
  console.log('Client Connected');
  socket.on('message', function(data){
    socket.broadcast.emit('server_message',data);
    socket.emit('server_message',data);
  });

  socket.on('setPseudo', function (data) {
   socket.set('pseudo', data);
 });
  socket.on('disconnect', function(){
    console.log('Client Disconnected.');
  });
});

function Client(name) {
	this.name= name
}

function Light(pin) {
	this.pin = pin
	this.lit = false
	this.enable = function() {
		gpio.open(this.pin, 'output', function(err) { console.log('error opening pin') } )
	}
	this.disable = function() {
		gpio.close(this.pin, function() { console.log('closing pin') })
	}
	this.toggle = function() {
		if(this.lit){
			gpio.write(this.pin, 0, function(){})
			this.lit=false
		}
		else {
			gpio.write(this.pin, function(){})
			this.lit=true
		}	
	}
}
var green = new Light(16)
var red = new Light(18)
var numClients = 0

//set up ws
wss = new WebSocketServer({port: 8765});
var Client1 = new Client('matt') 
wss.on('connection', function(ws) {
 	ws.on('message', function (message) {
		if(message=='1'){
			green.toggle()
		}
		if(message=='2') {
			red.toggle()	
		}
	})
	ws.on('close', function () {
		console.log('client closed')
		numClients-=1
		green.disable()
		red.disable()
	})
	ws.on('open',  function() {
		console.log('new client')
		//clients[numClients] = new Client(Math.floor((Math.random()*100)+1))
		//numClients+=1
		if(numClients==0){
			green.enable()
			red.enable()
		}
		numClients+=1
	})
})
/*
  var imap = new Imap({
  user: 'mbelkin2@gmail.com',
  password: 'c4rls4g4n',
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
});

function openInbox(cb) {
  imap.openBox('INBOX', true, cb);
}

imap.once('ready', function() {
  openInbox(function(err, box) {
    if (err) throw err;
    var f = imap.seq.fetch('1:3', {
      bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)',
      struct: true
    });
    f.on('message', function(msg, seqno) {
      console.log('Message #%d', seqno);
      var prefix = '(#' + seqno + ') ';
      msg.on('body', function(stream, info) {
        var buffer = '';
        stream.on('data', function(chunk) {
          buffer += chunk.toString('utf8');
        });
        stream.once('end', function() {
//          console.log(prefix + 'Parsed header: %s', inspect(Imap.parseHeader(buffer)));
        });
      });
      msg.once('attributes', function(attrs) {
  //      console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
      });
      msg.once('end', function() {
        console.log(prefix + 'Finished');
      });
    });
    f.once('error', function(err) {
      console.log('Fetch error: ' + err);
    });
    f.once('end', function() {
      console.log('Done fetching all messages!');
      imap.end();
    });
  });
});

imap.once('error', function(err) {
  console.log(err);
});

imap.once('end', function() {
  console.log('Connection ended');
});

imap.connect();


*/



//////////////////////////////////////////
//              Routes                   //
///////////////////////////////////////////

/////// ADD ALL YOUR ROUTES HERE  /////////

server.get('/', function(req,res){
  res.render('index.jade', {
    locals : { 
              title : 'Your Page Title'
             ,description: 'Your Page Description'
             ,author: 'Your Name'
             ,analyticssiteid: 'XXXXXXX' 
            }
  });
});


//A Route for Creating a 500 Error (Useful to keep around)
server.get('/500', function(req, res){
    throw new Error('This is a 500 Error');
});

//The 404 Route (ALWAYS Keep this as the last route)
server.get('/*', function(req, res){
    throw new NotFound;
});

function NotFound(msg){
    this.name = 'NotFound';
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
}


console.log('Listening on http://0.0.0.0:' + port );
