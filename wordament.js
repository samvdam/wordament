let board=[];

let guess="";
let guessScore=0;

let curPos=[-1,-1];
let lastPos=[-2,-2];
let usedPos=[];

let corWords=[];
let score=0;

let timer;
let timerID;
let isGame;

let words;

let username;
let uid;

let users;
let leaderboard=[];

var firebaseConfig = {
    apiKey: "AIzaSyBp4lTmSt8zEIz_znWixN3FEpDJsXx7YsU",
    authDomain: "wordament-1b57b.firebaseapp.com",
    databaseURL: "https://wordament-1b57b.firebaseio.com",
    projectId: "wordament-1b57b",
    storageBucket: "wordament-1b57b.appspot.com",
    messagingSenderId: "247598560726",
    appId: "1:247598560726:web:fa75e1393a213dca51a077"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
let myDatabase=firebase.database();

firebase.auth().signInAnonymously();

firebase.auth().onAuthStateChanged(user => {
  if (!!user){
    uid=user.uid;
  }
});

document.getElementById("setUsername").addEventListener("click",()=>{
  username=document.getElementById("username").value;
  document.getElementById("username").value="";
  firebase.auth().currentUser.updateProfile({displayName:username}).then(function(){
    var displayName= user.displayName;
  });
  setTimeout(displayName,100);
});

myDatabase.ref("users").on('value',ss=>{
  users=parseInt(ss.val());
});

/*let setWords=function(){
  fetch('https://serious-available-idea.glitch.me/words', )
  .then(function(response){
    //response.text().then(function(text) {
      //words = text.split("\n");
      //console.log(response);
    response.json().then(function(data) {
        //words = data.split("\n");
        //console.log(data);
      });
    //});
  });
}*/
//setWords();

let setGameBoard=function(){
  fetch('https://serious-available-idea.glitch.me/board', )
  .then(function(response){
    response.json().then(function(data) {
        board=data;
      });
  });
}

setGameBoard();

let setTimer=function(){
  fetch('https://serious-available-idea.glitch.me/timer', )
  .then(function(response){
    response.json().then(function(data) {
        timer=data;
      });
  });
}

setTimer();

let setIsGame=function(){
  fetch('https://serious-available-idea.glitch.me/game', )
  .then(function(response){
    response.json().then(function(data) {
        isGame=data;
      });
  });
}

setIsGame();

let setGame=function(){
  $('#wordamentBoard').hide();
  $('#wordamentGame').show();
  score=0;
  corWords=[];
  document.getElementById("leaderboard").innerHTML="";
  myDatabase.ref("leaderboard").set(null);
  myDatabase.ref("users").set(0);
  document.getElementById("guesses").innerHTML="";
  setGameBoard();
  setTimeout(function(){
    for(i=0;i<16;i++){
        document.getElementById("tile"+(i+1)).innerHTML=board[i].letter;
        document.getElementById("score"+(i+1)).innerHTML=board[i].score;
        document.getElementById("score"+(i+1)).addEventListener("mousedown", tileClick);
        document.getElementById("score"+(i+1)).addEventListener("mouseover", tileOver);
        document.addEventListener("mouseup", tileRelease);
    }
  },600);
  document.getElementById("totalScore").innerHTML=score;
  setTimeout(displayName,500);
  timerID=setInterval(tickDown,1000);
}

let setLeaderboard=function(){
  $('#wordamentGame').hide();
  let boardData;
  
  if(firebase.auth().currentUser.displayName==null){
    boardData={
      user: "Player "+(users+1),
      userScore:score
    };
    document.getElementById("yourName").innerHTML="Your Name: "+"Player "+users;
  }
  else{
    boardData={
      user: firebase.auth().currentUser.displayName,
      userScore:score
    };
  }
  myDatabase.ref("leaderboard").once('value',ss=>{
    let data=ss.val();
    if(data!=null){
      let uids=Object.keys(data);
      if(!uids.includes(uid)){
        myDatabase.ref("users").set(users+1);
        myDatabase.ref("leaderboard").child(uid).update(boardData);
      }
    }
    else{
      myDatabase.ref("users").set(users+1);
      myDatabase.ref("leaderboard").child(uid).update(boardData);
    }
  });
  setTimeout(pullBoard,1500);
  $('#wordamentBoard').show();
  document.getElementById("boardTimer").innerHTML=timer[0].toString(10)+":"+timer[1].toString(10)+timer[2].toString(10);
  timerID=setInterval(tickDown,1000);
}

let pullBoard=function(){
  leaderboard=[];
    myDatabase.ref("leaderboard").on('value',ss=>{
      let data=ss.val();
      if(data!=null){
        let uids=Object.keys(data);
        uids.map(id=>{
          leaderboard.push(data[id]);
        });
        leaderboard.sort((a,b)=>-a.score + b.score >= 0 ? -1: 1);
        document.getElementById("leaderboard").innerHTML="";
        leaderboard.map(user=>{
          document.getElementById("leaderboard").innerHTML+=user.user+": "+user.userScore+"<br>";
        })
      }
     });
}

let displayName=function(){
  if(firebase.auth().currentUser.displayName!=null){
    document.getElementById("yourName").innerHTML="Your Name: "+firebase.auth().currentUser.displayName;
  }
  else{
    document.getElementById("yourName").innerHTML="";
  }
}

let tickDown=function(){
  timer[2]--;
  updateClock(timer,2);
  
  if((timer[1]==0 || timer[1]==3) && timer[2]==0){
    setTimer(); 
  }
  if(isGame){
  document.getElementById("gameTimer").innerHTML=timer[0].toString(10)+":"+timer[1].toString(10)+timer[2].toString(10);
  }
  else{
    document.getElementById("boardTimer").innerHTML=timer[0].toString(10)+":"+timer[1].toString(10)+timer[2].toString(10);
  }
  if(timer[0]==0 && timer[1]==0 && timer[2]==0){
    if(isGame){
      setIsGame();
      setLeaderboard();
    }
    else{
      setIsGame();
      setGame();
    }
    clearInterval(timerID);
  }
}

let updateClock=function(clock,pos){
    if(clock[pos]<0){
        if(pos==1){
            clock[pos]=5;
            clock[pos-1]--;
        }
        else if(pos==0){
            let i=0;
            for(i=0;i<4;i++){
                clock[i]=0;
            }
            pos=1;
        }
        else{
            clock[pos]=9;
            clock[pos-1]--;
        }
        updateClock(clock,pos-1);
    }
};

let checkGuess=function(){
  return true;
}

let tileClick=function(){
  tile=findTile(this.id);
  if(document.getElementById("tile"+tile).style.backgroundColor=="rgb(0, 191, 255)"){
    document.getElementById("tile"+tile).style.backgroundColor="blue";
    guess+=document.getElementById("tile"+tile).innerHTML;
    document.getElementById("current").innerHTML=guess;
    guessScore+=parseInt(this.innerHTML);
    curPos[0]=Math.floor((tile-1)/4);
    curPos[1]=Math.floor((tile-1)%4);
    usedPos.push(tile);
  }
}

let tileOver=function(){
  tile=findTile(this.id);
  if(curPos[0]>=0 && curPos[1]>=0){
    curPos[0]=Math.floor((tile-1)/4);
    curPos[1]=Math.floor((tile-1)%4);
  }
  if (curPos[0]==lastPos[0] && curPos[1]==lastPos[1]){
    document.getElementById("tile"+usedPos[usedPos.length-1]).style.backgroundColor="rgb(0, 191, 255)";
    guess=guess.substring(0,guess.length-1);
    document.getElementById("current").innerHTML=guess;
    guessScore-=parseInt(this.innerHTML);
    
    usedPos.pop();
    lastPos[0]=Math.floor((usedPos[usedPos.length-2]-1)/4);
    lastPos[1]=Math.floor((usedPos[usedPos.length-2]-1)%4);
  }
  else if(curPos[0]>=0 && curPos[1]>=0 && document.getElementById("tile"+tile).style.backgroundColor=="rgb(0, 191, 255)"){
    if((curPos[0]>=(Math.floor((usedPos[usedPos.length-1]-1)/4))-1 && curPos[0]<=(Math.floor((usedPos[usedPos.length-1]-1)/4))+1) && (curPos[1]>=((usedPos[usedPos.length-1]-1)%4)-1 && curPos[1]<=((usedPos[usedPos.length-1]-1)%4)+1)){
      document.getElementById("tile"+tile).style.backgroundColor="blue";
      guess+=document.getElementById("tile"+tile).innerHTML;
      document.getElementById("current").innerHTML=guess;
      guessScore+=parseInt(this.innerHTML);
      lastPos[0]=Math.floor((usedPos[usedPos.length-1]-1)/4);
      lastPos[1]=Math.floor((usedPos[usedPos.length-1]-1)%4);
      usedPos.push(tile);
    }
  }
}

let tileRelease=function(){
  curPos=[-1,-1];
  lastPos=[-2,-2];
  if(checkGuess()&&!corWords.includes(guess)&&guess.length>2){
    corWords.push(guess);
    if(guess.length>7){
      guessScore*=3
    }
    else if(guess.length>5){
      guessScore*=2;
    }
    else if(guess.length>3){
      guessScore*=1.5;
      guessScore=Math.round(guessScore);
    }
    score+=parseInt(guessScore);
    document.getElementById("guesses").innerHTML+=(guess+" ");
    document.getElementById("totalScore").innerHTML=score;
    setBoardCorrect();
  }
  else if(guess.length<3 || corWords.includes(guess)){
    setBoardShort();
  }
  else if(!checkGuess()){
    setBoardWrong();
  }
  guess="";
  guessScore=0;
  usedPos=[];
  setTimeout(resetBoard,1000);
}

let resetBoard=function(){
  for(k=1;k<=16;k++){
    if(document.getElementById("tile"+k).style.backgroundColor!="blue" && document.getElementById("tile"+k).style.backgroundColor!="rgb(0, 191, 255)"){
      document.getElementById("tile"+k).style.backgroundColor="rgb(0, 191, 255)";
      document.getElementById("current").innerHTML=guess;
    }
  }
}

let setBoardCorrect=function(){
  for(k=1;k<=16;k++){
    if(document.getElementById("tile"+k).style.backgroundColor=="blue"){
      document.getElementById("tile"+k).style.backgroundColor="#28e64f";
    }
  }
}

let setBoardWrong=function(){
  for(k=1;k<=16;k++){
    if(document.getElementById("tile"+k).style.backgroundColor=="blue"){
      document.getElementById("tile"+k).style.backgroundColor="red";
    }
  }
}

let setBoardShort=function(){
  for(k=1;k<=16;k++){
    if(document.getElementById("tile"+k).style.backgroundColor=="blue"){
      document.getElementById("tile"+k).style.backgroundColor="rgb(248, 211, 45)";
    }
  }
}

let findTile=function(id){
  let tile;
  
  switch(id){
    case "score1":
      return 1;
    case "score2":
      return 2;
    case "score3":
      return 3;
    case "score4":
      return 4;
    case "score5":
      return 5;
    case "score6":
      return 6;
    case "score7":
      return 7;
    case "score8":
      return 8;
    case "score9":
      return 9;
    case "score10":
      return 10;
    case "score11":
      return 11;
    case "score12":
      return 12;
    case "score13":
      return 13;
    case "score14":
      return 14;
    case "score15":
      return 15;
    case "score16":
      return 16;
  }
  
  return tile;
}

setTimeout(function(){
  if(isGame){
  setGame();
}
  else{
    setLeaderboard();
  }
},500);
