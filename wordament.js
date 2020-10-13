let board=[];
/*for(i=0;i<4;i++){
  board[i]=new Array(4);
}*/

let guess="";
let guessScore=0;

let curPos=[-1,-1];
let lastPos=[-2,-2];
let usedPos=[];

let corWords=[];
let score=0;

let timer=[0,0,0];
let timerID;
let isGame=true;

let words;

let uid;
let username="";

let numUsers;
let leaderboard=[];

class Letter{
  constructor(letter, score){
    this.letter=letter;
    this.score=score;
  }
}

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
var google_provider = new firebase.auth.GoogleAuthProvider();

firebase.auth().signInAnonymously();

firebase.auth().onAuthStateChanged(user => {
  if (!!user){
    uid=user.uid;
  }
});

document.getElementById("setUsername").addEventListener("click",()=>{
  username=document.getElementById("username").value;
  document.getElementById("username").value="";
});

myDatabase.ref("leaderboard").child("users").on('value',ss=>{
  users=parseInt(ss.val());
});
/*let setWords=function(){
  fetch('https://serious-available-idea.glitch.me/timer', )
  .then(function(response){
    //response.text().then(function(text) {
      //words = text.split("\n");
      console.log(response);
    //});
  });
}

setWords();*/

let setGame=function(){
  $('#wordamentBoard').hide();
  $('#wordamentGame').show();
  score=0;
  corWords=[];
  myDatabase.ref("leaderboard").set(null);
  myDatabase.ref("leaderboard").child("users").set(0);
  document.getElementById("guesses").innerHTML="";
  for(i=0;i<16;i++){
    //for(j=0;j<4;j++){
      board[i]=setLetter(Math.floor(Math.random()*213));
      document.getElementById("tile"+(i+1)).innerHTML=board[i].letter;
      document.getElementById("score"+(i+1)).innerHTML=board[i].score;
      document.getElementById("score"+(i+1)).addEventListener("mousedown", tileClick);
      document.getElementById("score"+(i+1)).addEventListener("mouseover", tileOver);
      document.addEventListener("mouseup", tileRelease);
    //}
  }
  //document.getElementById("guesses").innerHTML=corWords;
  document.getElementById("totalScore").innerHTML=score;
  timer[0]=2;
  document.getElementById("gameTimer").innerHTML=timer[0].toString(10)+":"+timer[1].toString(10)+timer[2].toString(10);
  timerID=setInterval(tickDown,1000);
}

let setLeaderboard=function(){
  $('#wordamentGame').hide();
  let boardData;
  
  if(username==""){
    boardData={
      user: "Player "+uid,
      userScore:score
    };
  }
  else{
    boardData={
      user: username,
      userScore:score
    };
  }
  myDatabase.ref("leaderboard").child("users").set(users+1);
  myDatabase.ref("leaderboard").child(users).update(boardData);
  setTimeout(pullBoard,300);
  $('#wordamentBoard').show();
   document.getElementById("boardTimer").innerHTML=timer[0].toString(10)+":"+timer[1].toString(10)+timer[2].toString(10);
    timerID=setInterval(tickDown,1000);
}

let pullBoard=function(){
  leaderboard=[];
  for(i=1;i<=users;i++){
    myDatabase.ref("leaderboard").child(i).once('value',ss=>{
      leaderboard[i]=ss.val();
      leaderboard[i]=JSON.stringify(leaderboard[i]);
      leaderboard[i]=JSON.parse(leaderboard[i]);
      //console.log(leaderboard);

        document.getElementById("leaderboard").innerHTML+=(i-1)+". "+leaderboard[i].user+": "+leaderboard[i].userScore;


    });
  }
  //document.getElementById("leaderboard").innerHTML+="IllegallySam: 100<br>";
}

let tickDown=function(){
  timer[2]--;
  updateClock(timer,2);
  if(isGame){
  document.getElementById("gameTimer").innerHTML=timer[0].toString(10)+":"+timer[1].toString(10)+timer[2].toString(10);
  }
  else{
    document.getElementById("boardTimer").innerHTML=timer[0].toString(10)+":"+timer[1].toString(10)+timer[2].toString(10);
  }
  if(timer[0]==0 && timer[1]==0 && timer[2]==0){
    if(isGame){
      isGame=false;
      setLeaderboard();
      timer[1]=4;
      timer[2]=5;
    }
    else{
      isGame=true;
      setGame();
      timer[0]=2;
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

let setLetter=function(num){
  switch(num){
    case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7: case 8: case 169: case 170: case 171: case 172: case 173: case 174: case 175: case 176: case 177:
      return A;
    case 9: case 10: case 11: case 12: case 13: case 14: 
      return B;
    case 15: case 16: case 17: case 18: case 19: case 20: case 21: case 22:
      return C;
    case 23: case 24: case 25: case 26: case 27: case 28: case 29: case 30:
      return D;
    case 31: case 32: case 33: case 34: case 35: case 36: case 37: case 38: case 39: case 168: case 178: case 179: case 180: case 181: case 182: case 183: case 184: case 185: case 186: case 187:
      return E;
    case 40: case 41: case 42: case 43: case 44: case 45:
      return F;
    case 46: case 47: case 48: case 49: case 50: case 51: case 52:
      return G;
    case 53: case 54: case 55: case 56: case 57: case 58: case 59:
      return H;
    case 60: case 61: case 62: case 63: case 64: case 65: case 66: case 67: case 68: case 188: case 189: case 190: case 191: case 192: case 193: case 194: case 195: case 196:
      return I;
    case 69: 
      return J;
    case 70: case 71: case 72: case 73: case 74:
      return K;
    case 75: case 76: case 77: case 78: case 79: case 80: case 81: case 82:
      return L;
    case 83: case 84: case 85: case 86: case 87: case 88: case 89:
      return M;
    case 90: case 91: case 92: case 93: case 94: case 95: case 96: case 97: case 98:
      return N;
    case 99: case 100: case 101: case 102: case 103: case 104: case 105: case 106: case 107: case 197: case 198: case 199: case 200: case 201: case 202: case 203: case 204: case 205:
      return O;
    case 108: case 109: case 110: case 111: case 112: case 113: case 114:
      return P;
    case 115:
      return Q;
    case 116: case 117: case 118: case 119: case 120: case 121: case 122: case 123: case 124:
      return R;
    case 125: case 126: case 127: case 128: case 129: case 130: case 131: case 132: case 133:
      return S;
    case 134: case 135: case 136: case 137: case 138: case 139: case 140: case 141: case 142:
      return T;
    case 143: case 144: case 145: case 146: case 147: case 148: case 149: case 206: case 207: case 208: case 209: case 210: case 211: case 212:
      return U;
    case 150: case 151: case 152: case 153: case 154:
      return V;
    case 155: case 156: case 157: case 158: case 159:
      return W;
    case 160:
      return X;
    case 161: case 162: case 163: case 164: case 165: case 166:
      return Y;
    case 167:
      return Z;
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


A=new Letter("A",2);
B=new Letter("B",5);
C=new Letter("C",3);
D=new Letter("D",3);
E=new Letter("E",1);
F=new Letter("F",5);
G=new Letter("G",4);
H=new Letter("H",4);
I=new Letter("I",2);
J=new Letter("J",10);
K=new Letter("K",6);
L=new Letter("L",3);
M=new Letter("M",4);
N=new Letter("N",2);
O=new Letter("O",2);
P=new Letter("P",4);
Q=new Letter("Q",10);
R=new Letter("R",2);
S=new Letter("S",2);
T=new Letter("T",2);
U=new Letter("U",4);
V=new Letter("V",6);
W=new Letter("W",6);
X=new Letter("X",10);
Y=new Letter("Y",5);
Z=new Letter("Z",10);

setGame();
