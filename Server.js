"use strict";

let path=require('path');
let express=require('express');
let morgan=require('morgan');
let mysql=require('mysql');
let crypto=require('crypto');
let bodyParser=require('body-parser');

let pool= mysql.createPool({
    connectionLimit : 2,
    host : 'localhost',
    user : 'Ajay',
    password : 'root',
    database : 'web'
});

let app=express();
app.use(morgan('combined'));
app.use(bodyParser.json());

function createTemplate(data){
    let title= data.title;
    let heading= data.heading;
    let date= data.date;  
    let content= data.content;  
    
    let htmlTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
            <link rel="stylesheet" type="text/css" media="screen" href="/ui/main.css" />
            <title>
                ${title} 
            </title>
        </head>
        <body>
        <div>
            <h1 style="color:red">
            ${heading}  
            </h1>
        </div> 
        <div class="as">
        ${date.toDateString()}
        ${content}
        </div>
        </body>
        </html>
        `;
        return htmlTemplate;  };

app.get('/' , (req,res) => {
    res.sendFile(path.join(__dirname, 'ui' , 'index.html'));
});

app.get('/ui/main.js' , (req,res)=>{
    res.sendFile(path.join(__dirname , 'ui' , 'main.js'));
})

app.get('/ui/main.css' , (req,res)=>{
    res.sendFile(path.join(__dirname , 'ui' , 'main.css'));
})

let counter=0;
app.get('/counter' , (req,res) =>{
    counter = counter +1;
    res.send(counter.toString());
});

var names= [];
app.get('/submit-name', (req,res) =>{
  var name=req.query.name;
  names.push(name);
  res.send(JSON.stringify(names));
});

app.get('/articles/:articleName' , (req,res) => {
    pool.query("SELECT * FROM posts where title = ? " , [req.params.articleName] , (err , result) =>{
       if(err){
           res.status(500).send(err.toString());
       }
        let data = result[0];
        if(data  === undefined){
            res.send('<html><body><div style="text-align:center">Article Not Found!</div></ody></html>');
         }else{
            res.send(createTemplate(data));
            //res.send(JSON.stringify(data));
            //console.log(data);      
            }
    })
});

app.get('/test-db' , (req,res) =>{
    pool.getConnection(function(err, pool) {
     if (err) throw err; // not connected!
    
     // Use the connection
     pool.query('SELECT * FROM articles', function (error, results, fields) {
         if (error)
         throw error;
 
     results.forEach(result => {
         res.send(JSON.stringify(result));
     });
     pool.release();
       if (error) throw error;
     });
   });
 });

function hash(input , salt){
    let hashed = crypto.pbkdf2Sync(input , salt , 10000 , 512 , 'sha512');
    return ['pksdf2','10000', salt ,hashed.toString('hex')].join('$');
}

app.get('/hash/:input' , (req, res) =>{
        let hasedInput = hash(req.params.input , 'this-is some-random-value');
        res.send(hasedInput);
});

app.post('/createuser' , (req, res) =>{
    let username = req.body.username;
    let password = req.body.password;
    let salt = crypto.randomBytes(128).toString('hex');
    let dbString = hash(password , salt);
    pool.query('INSERT into user(user , password) VALUES (?,?)', [username , dbString] , (err , result) =>{
        if(err){
            res.status(500).send(err.toString());
        }else{
            res.send('User Created successfully ' + username);
        }
    });
});

app.post('/login' , (req, res) =>{
    let username = req.body.username;
    let password = req.body.password;
    pool.query('SELECT * from user WHERE user= ? ', [username] , function (err , result){
        if(err){
            res.status(500).send(err.toString());
        }else{
            if(result[0] === [0] || result[0] === undefined){
                res.status(403).send('username/password is invalid');
            }else{
                //match password
                let dbString= result[0].password;
                let salt = dbString.split('$')[2];
                let hashedPassword = hash(password , salt);
                if(hashedPassword === dbString){
                    res.send("Credentials Correct!");
                }else{
                    res.status(403).send('username/password is invalid');
            }
            res.send('Somthing is Wrong!' + username);
        }
    }
    });
});

let port=8080;
app.listen(8080);
console.log(`Webapp is listening on port ${port}`);