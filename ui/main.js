"use strict";

let bttn = document.getElementById('bttn');

bttn.onclick = ()=>{
let request = new XMLHttpRequest();
request.onreadystatechange = () => {
   if(request.readyState === XMLHttpRequest.DONE){
    if(request.status === 200){
        let articleData = request.responseText;
       // articleData = JSON.parse(articleData);
        let article = document.getElementById('article');
        article.innerHTML=articleData;
    }
   }
};
let articleInput= document.getElementById("articleName");
let articleN =articleInput.value; 
request.open('GET' , 'http://localhost:8080/articles/'+articleN);
request.send(null);
};

var submit = document.getElementById("submit_btn");

submit.onclick = function(){
    var request =new XMLHttpRequest();
request.onreadystatechange = () => {
 if(request.readyState === XMLHttpRequest.DONE){
   if(request.status === 200){
    var names = request.responseText;
    names = JSON.parse(names);
    var list = '';
    for(var i=0; i < names.length; i++){
        list += '<li>' + names[i] + '</li>';
    }
    var ul = document.getElementById('listNames');
    ul.innerHTML=list;
    }
 }
};
var nameInput = document.getElementById('name');
var name = nameInput.value;
request.open('GET', 'http://localhost:8080/submit-name?name='+name,true);
request.send(null);   
};
