const canvas = document.getElementById("gameCanvas");

const ctx = canvas.getContext("2d");

var framerate = 50;
var World = {
    allSprites: [],
    frameCount: 0,
}
var camera = {
    x: 0,
    y: 0,
    isBlurred: false
}
var mouse = {
    cameraX: 200,
    cameraY: 200,
    height:0,
    width: 0,
    scale: 1,
    x: 200,
    y: 200
}
var mouseDown = false;
canvas.addEventListener("mousedown", (event)=>{
    mouseDown = true;
});
canvas.addEventListener("mouseup", (event)=>{
    mouseDown = false;
});
const keys = {};
const prevKeys = {};
document.addEventListener("keydown", (event) => {
    keys[event.key] = true;
});
document.addEventListener("keyup", (event) => {
    keys[event.key] = false;
    keys.time = 0;
});
canvas.addEventListener("mousemove", (event) =>{
    const rect = canvas.getBoundingClientRect();
    mouse.cameraX = event.clientX-rect.left+camera.x-canvas.width/2;
    mouse.cameraY = event.clientY-rect.top+camera.y-canvas.height/2;
    mouse.x = mouse.cameraX// + camera.x;
    mouse.y = mouse.cameraY// + camera.y;
});

const deathMessages = ["The first step to failure is trying, give up",
                       "Sometimes you get unlucky. That wasn't the case though. You just suck", 
                       "Not everyone can be a winner", 
                       "You're supposed to aim at the enemies", 
                       "This game isn't that hard", 
                       "They say failure is the best teacher. You must be a genius by now.", 
                       "At least the zombies are full now.", 
                       "Game over... Again.", 
                       "Oof.", 
                       "That was embarassing", 
                       "Even the zombies turned away in embarassment", 
                       "You reached the ending. The bad one.",
                       "...",
                       "The dead walk. You crawl.",
                       "History will not remember this.",
                       "Please stop trying. This is painful to watch.",
                       "Even your corpse is unimpressive.",
                       "Maybe just play on easy.",
                       "It's ok. You were never going to win anyway.",
                       "Try again... but we both know how this ends.",
                       "Failure is your only constant",
                       "Hope is a glitch not a feature",
                       "Persistance is just a slower path to failure",
                       "Retry? You didn't learn the first 12 times?",
                       "You mistake repetition for progress.",
                       "This is not growth. This is a loop.",
                       "You're not beating the game, you're obeying it."
 ];
 var chosenDeathMessage = deathMessages[randomNumber(0,deathMessages.length-1)];
 const validAngles = [{name: "0pi" , degrees: 0}, 
                      {name: "pi/4" , degrees: 45}, 
                      {name: "pi/2" , degrees: 90}, 
                      {name: "3pi/4" , degrees: 135}, 
                      {name: "pi" , degrees: 180}, 
                      {name: "5pi/4" , degrees: 225}, 
                      {name: "3pi/2" , degrees: 270}, 
                      {name: "7pi/4" , degrees: 315}, 
                      {name: "2pi" , degrees: 360}];
const questions = [{text: "hello", answer: ""}];
var chosenAngle = validAngles[randomNumber(0, validAngles.length-1)];
var currentAngle = 0;
const itemTypes = [{name: "pistol",
                     firerate: 30, 
                     damage: 2, 
                     accuracy: 10,
                     shapeColor: "white", 
                     animation: "Images/Weapons/pistol.png",
                     sound: "Sounds/Weapons/pistol_shot.mp3",
                     width: 16, 
                     height: 8},
                    {name: "shotgun", 
                     firerate: 60,
                     damage: 5, 
                     accuracy: 40,
                     shapeColor: "orange",
                     animation: "Images/Weapons/shotgun.png",
                     sound: "Sounds/Weapons/shotgun_shot.mp3",
                     width: 16, 
                     height: 11},
                    {name: "smg",     
                     firerate: 3,  
                     damage: 1, 
                     accuracy: 20,
                     shapeColor: "red", 
                     animation: "Images/Weapons/smg.png",
                     sound: "Sounds/Weapons/smg_shot.mp3",
                     width: 14, 
                     height: 10},
                    {name: "flamethrower",     
                     firerate: 3,  
                     damage: 1, 
                     accuracy: 40,
                     shapeColor: "red",
                     animation: "",
                     width: 60,
                     height: 10}
];
var heartbeat = new Audio("Sounds/Ambient/heartbeat.mp3");
heartbeat.loop = true;
var music = new Audio("Sounds/Music/You Died.mp3");
const creatureTypes = [{name: "zombie",
    health: 5, 
    accel: 0.5, 
    knockbackResist: 0.7,
    color: "green", 
    animation: "Images/Enemies/zombie.png",
    width: 14, 
    height: 17},
  {name: "big_zombie", 
    health: 7, 
    accel: 0.2, 
    knockbackResist: 0.2,
    color: "orange", 
    animation: "Images/Enemies/big_zombie.png",
    width: 16, 
    height: 17},
  {name: "small_zombie",
    health: 3, 
    accel: 1,  
    knockbackResist: 1,
    color: "#0e4f19", 
    animation: "Images/Enemies/small_zombie.png",
    width: 12, 
    height: 16}
];
const tasks = [{name: "Controls", groupName: "Tutorial", desc: "Move with WASD", requirements: 7, rewards: 8},
               {name: "Controls", groupName: "Tutorial", desc: "Sprint with space", requirements: 7, rewards: 8},
               {name: "Controls", groupName: "Tutorial", desc: "Click to shoot", requirements: 7, rewards: 8},
               {name: "Controls", groupName: "Tutorial", desc: "Good, practice hitting these targets", requirements: 7, rewards: 8},
               {name: "Controls", groupName: "Tutorial", desc: "You need to reload, press R", requirements: 7, rewards: 8},
               {name: "Controls", groupName: "Tutorial", desc: "Stop the square once it reaches the right angle", requirements: 7, rewards: 8}
];
const defaultScale = 5;
var player = createSprite(0,0,14,17, true, 0, "player");
player.isInMinigame = false;
player.health = 100;
player.setAnimation("Images/Player/player.png");
player.walktime = 0;
player.targetHealth = 100;
player.hasCollision = false;
prepareMenu();

var currentGameStage = "start menu";
var day = 0;
var dayLength = 30; //in seconds
var nightLength = 30; //in seconds
var noAI = false;
var flashAlpha = 0;
var zombieCount = 0;

function getGameStage(stage){
    switch (stage){
        case "start menu":
            music.volume*=0.97;
            if (mouseDown){
                if (player.item.ammoCount>0){
                    if (player.item.firerate<=0){
                        playSound(itemTypes[player.itemType].sound);
                shoot(player.item.x,player.item.y,player.item.rotation+randomNumber(-player.item.accuracy,player.item.accuracy)*Math.PI/180,0);
                let newX =  Math.round(player.item.x + (-player.item.width/2) * Math.cos(player.item.rotation));
                let newY = Math.round(player.item.y + (-player.item.width/2) * Math.sin(player.item.rotation));
                shellCases(newX,newY, "gray");
                player.item.firerate=itemTypes[player.itemType].firerate;
                player.item.ammoCount--;
                    }
                }
            }
            player.walktime--;
            if (keyDown(" ")){
                player.accel = lerp(player.accel, player.maxAccel, 0.4);
            }else{
                player.accel = lerp(player.accel, player.minAccel, 0.4);
            }
            if (keyDown("a") || keyDown("ArrowLeft")){
                player.velocityX -= player.accel;
               // walkParticles(player.x, player.y+player.height/2, "gray");
                if (player.walktime<=0){
                    footprints(player.x,player.y+(player.height*defaultScale)/2);
                    player.walktime = 30;
                     }
            }
            if (keyDown("d") || keyDown("ArrowRight")){
                player.velocityX += player.accel;
               // walkParticles(player.x, player.y+player.height/2, "gray");
                if (player.walktime<=0){
                    footprints(player.x,player.y+(player.height*defaultScale)/2);
                    player.walktime =30;
                     }
            }
            if (keyDown("w") || keyDown("ArrowUp")){
                player.velocityY -= player.accel;
               /// walkParticles(player.x, player.y+player.height/2, "gray");
                if (player.walktime<=0){
                    footprints(player.x,player.y+(player.height*defaultScale)/2);
                    player.walktime = 30;
                     }
            }
            if (keyDown("s") || keyDown("ArrowDown")){
                player.velocityY += player.accel;
                //walkParticles(player.x, player.y+player.height/2, "gray");
                if (player.walktime<=0){
               footprints(player.x,player.y+(player.height*defaultScale)/2);
               player.walktime = 30;
                }
            }
            text("hello", camera.x,camera.y,40);
            return;
        case "game":

            return game();
        case "reload menu":
            //drawSprites();
            currentAngle+=5;
            if (currentAngle>=360){
                currentAngle-=360;
            }
            let x = Math.cos(-currentAngle*(Math.PI/180))*100;
            let y = Math.sin(-currentAngle*(Math.PI/180))*100;
            ctx.fillStyle = "blue";
            ctx.fillRect(x+canvas.width/2, y+canvas.height/2, 30, 30);
                x = Math.cos(-chosenAngle.degrees*(Math.PI/180))*100;
                y = Math.sin(-chosenAngle.degrees*(Math.PI/180))*100;
            ctx.fillRect(x+canvas.width/2, y+canvas.height/2, 30, 30);
            text(currentAngle, player.x, player.y+50)
            text(chosenAngle.degrees, player.x, player.y+60)
            text(chosenAngle.name, camera.x, camera.y, 20);
            if (keyWentDown(" ")){
                camera.isBlurred = false;
                if ((currentAngle>chosenAngle.degrees-30 && currentAngle < chosenAngle.degrees+30)){
                    player.item.ammoCount = 100;
                }
                noAI = false;
                currentGameStage = "game";
                player.isInMinigame = false;
            }
            return;
        case "death menu":
            noAI = true;
            //rawSprites();
            text(chosenDeathMessage, camera.x-chosenDeathMessage.length/2*10, camera.y);
            return;

    }
}
function prepareMenu(){
    var playGame = createSprite(camera.x, camera.y, 50, 30, false, 0, "button");
    playGame.hasCollision = false;
playGame.onClick = function(){
    playGame.lifetime = 0;
    console.log(playGame.lifetime);
    startGame();
}
}
function startGame(){
     noAI = false;
     flashAlpha = 0;
     zombieCount = 0;
     heartbeat.play();
    for (var i = 0; i < 10; i++){
        let type = creatureTypes[randomNumber(0,creatureTypes.length-1)];
        let zombie = createSprite(randomNumber(0,700),randomNumber(0,700),14,17, randomNumber(1,30)==3, 2, "zombie");
        zombie.shapeColor = "red";
        Object.assign(zombie, type);
        zombie.setAnimation(type.animation);
        zombieCount++;
    }
    currentGameStage = "game";
}
function draw(){
    background("black");
    if (World.frameCount%(dayLength*framerate) == 0){
        day++;
    }
    for (var i = 0; i < 4; i++){
        if (keyDown(i.toString())){
            let stats = itemTypes[i-1];
            player.itemType = i-1;
            Object.assign(player.item, stats);
            player.item.setAnimation(player.item.animation);
        }
    }
    if (keyWentDown("p")){
        player.targetHealth-=10;
    }
 
    drawSprites();
    getGameStage(currentGameStage);

}
function game(){
    player.health = Math.floor(lerp(player.health, player.targetHealth, 0.1));
    camera.x = lerp(camera.x, player.x, 0.6);
    camera.y = lerp(camera.y, player.y, 0.6);
    if (keyWentDown("r")){
        noAI = true;
        player.isInMinigame = true;
        currentGameStage = "reload menu";
        chosenAngle = validAngles[randomNumber(0, validAngles.length-1)];
        //canvas.classList.add("blur");
        
        camera.isBlurred = true;
        currentAngle = 0;
    }
    if (player.stamina<0){
        player.stamina-=0.5;
        if (player.stamina <= -100){
            player.stamina = 100;
        }
    }
    if (mouseDown){
        if (player.item.ammoCount>0){
            if (player.item.firerate<=0){
                playSound(itemTypes[player.itemType].sound);
        shoot(player.item.x,player.item.y,player.item.rotation+randomNumber(-player.item.accuracy,player.item.accuracy)*Math.PI/180,0);
        let newX =  Math.round(player.item.x + (-player.item.width/2) * Math.cos(player.item.rotation));
        let newY = Math.round(player.item.y + (-player.item.width/2) * Math.sin(player.item.rotation));
        shellCases(newX,newY, "gray");
        player.item.firerate=itemTypes[player.itemType].firerate;
        player.item.ammoCount--;
            }
        }
    }
    player.walktime--;
    if (keyDown(" ")&&player.stamina>=0){
        
     if (keyDown("a") || keyDown("ArrowLeft") || keyDown("d") || keyDown("ArrowRight") || keyDown("w") || keyDown("ArrowUp") || keyDown("s") || keyDown("ArrowDown")){
    player.stamina--
     }
        player.accel = lerp(player.accel, player.maxAccel, 0.4);
    }else{
        player.accel = lerp(player.accel, player.minAccel, 0.4);
    }
    console.log(player.stamina);
    if (keyDown("a") || keyDown("ArrowLeft")){
        player.velocityX -= player.accel;
       // walkParticles(player.x, player.y+player.height/2, "gray");
        if (player.walktime<=0){
            footprints(player.x,player.y+(player.height*defaultScale)/2);
            player.walktime = 30;
             }
    }
    if (keyDown("d") || keyDown("ArrowRight")){
        player.velocityX += player.accel;
       // walkParticles(player.x, player.y+player.height/2, "gray");
        if (player.walktime<=0){
            footprints(player.x,player.y+(player.height*defaultScale)/2);
            player.walktime =30;
             }
    }
    if (keyDown("w") || keyDown("ArrowUp")){
        player.velocityY -= player.accel;
       /// walkParticles(player.x, player.y+player.height/2, "gray");
        if (player.walktime<=0){
            footprints(player.x,player.y+(player.height*defaultScale)/2);
            player.walktime = 30;
             }
    }
    if (keyDown("s") || keyDown("ArrowDown")){
        player.velocityY += player.accel;
        //walkParticles(player.x, player.y+player.height/2, "gray");
        if (player.walktime<=0){
       footprints(player.x,player.y+(player.height*defaultScale)/2);
       player.walktime = 30;
        }
    }
    heartbeat.volume = 1-player.health/100;
    heartbeat.playbackRate = 1-player.health/100+0.5
    let grad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2,canvas.width/2);
    grad.addColorStop(0,"rgba(80,0,0,"+(1-(player.health/100)+Math.sin(World.frameCount*0.07)*0.1-0.8)+")");
    grad.addColorStop(0.5,"rgba(80,0,0,"+(1-(player.health/100)+Math.sin(World.frameCount*0.07)*0.1-0.8)+")");
    grad.addColorStop(1,"rgba(80,0,0,"+(1-(player.health/100)+Math.sin(World.frameCount*0.07)*0.1-0.2)+")");
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,canvas.width, canvas.height);
    text(player.item.ammoCount, camera.x+150, camera.y-150, 20);
    text(player.health, camera.x-150, camera.y-150, 20);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(canvas.width/2-50 ,canvas.height/2+70);
    ctx.lineTo(canvas.width/2+50, canvas.height/2+70);
    ctx.strokeStyle = "white";
    ctx.shadowColor = "white";
    ctx.shadowBlur = "10"
    ctx.lineWidth = 10;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(canvas.width/2-50 ,canvas.height/2+70);
    ctx.lineTo(canvas.width/2+player.health-50, canvas.height/2+70);
    ctx.strokeStyle = "red";
    ctx.shadowColor = "red";
    ctx.shadowBlur = "15"
    ctx.lineWidth = 10;
    ctx.stroke();
    ctx.strokeStyle = "darkRed";
    ctx.shadowBlur = "0"
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(canvas.width/2-50 ,canvas.height/2+60);
    ctx.lineTo(canvas.width/2+50, canvas.height/2+60);
    ctx.strokeStyle = "white";
    ctx.shadowColor = "white";
    ctx.shadowBlur = "5"
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(canvas.width/2-50 ,canvas.height/2+60);
    ctx.lineTo(canvas.width/2+Math.abs(player.stamina)-50, canvas.height/2+60);
    ctx.strokeStyle = "cyan";
    ctx.shadowColor = "cyan";
    ctx.shadowBlur = "7"
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.strokeStyle = "blue";
    ctx.shadowBlur = "0"
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.shadowBlur = "0"
    ctx.fillStyle = "rgba(255, 255, 255, "+flashAlpha+")";
    flashAlpha*=0.8;
ctx.fillRect(0,0,canvas.width,canvas.height);  
}
function walkParticles(x,y,color){
    if (randomNumber(1,10)==4){
        let p = createSprite(x, y, 10,10);
        p.velocityX = Math.random()*randomNumber(-10,10);
        p.velocityY = Math.random()*randomNumber(-15,-10);
        p.lifetime = 50;
        p.type = "walk_particle";
        p.shapeColor = color;
        p.hasCollision= false;
    }
}
function footprints(x,y){
var f = createSprite(x,y,6,1);
f.lifetime = 100;
f.type = "footprint";
f.hasCollision= false;
f.setAnimation("Images/Particles/footprints.png");

}
function shellCases(x,y,color){
    let p = createSprite(x, y, 20,15);
    p.velocityX = Math.random()*randomNumber(-10,10);
    p.velocityY = Math.random()*randomNumber(-20,-10);
    p.lifetime = 100;
    p.type = "shell_particle";
    p.shapeColor = color;
    p.hasCollision = false;
    p.hasFriction = false;
    p.maxY = y+100;
    p.rotationSpeed = (p.velocityX-p.velocityY)*Math.PI/180;

}
function drawSprites(){
    for (var i = 0; i < World.allSprites.length; i++){
    //ctx.shadowBlur = "0"
        let thisSprite = World.allSprites[i];
        if (thisSprite.lifetime<=0 || thisSprite.health<=0){
            World.allSprites.splice(i,1);
            if (thisSprite.type == "player"){
                heartbeat.pause();
                music.play();
                music.volume = 1;
                for (let a =0; a < randomNumber(3,7); a++){
                let p = createSprite(thisSprite.x, thisSprite.y, 20,20);
                p.velocityX = Math.random()*randomNumber(-30,30);
                p.velocityY = Math.random()*randomNumber(-30,30);
                p.lifetime = 50;
                p.type = "blood_particle";
                p.hasCollision = false;
                p.shapeColor = "red";
                }
                currentGameStage = "death menu";
                chosenDeathMessage = deathMessages[randomNumber(0,deathMessages.length-1)];
                let retry = createSprite(camera.x-25*defaultScale-15, camera.y+180, 50, 20, false, 0, "button");
                retry.hasCollision = false;
                retry.message = "retry";
                retry.onClick = function(){
                   // currentGameStage = "start menu";
                   currentGameStage = "game";
                      retry.lifetime = 0;
                      for (var j = 0; j < World.allSprites.length; j++){
                        let s = World.allSprites[j];
                            s.lifetime = 0;
                    }
                    camera.x = 0;
                    camera.y = 0;
                    //prepareMenu();
                    startGame();
                    console.log(player.x,player.y);
player = createSprite(0,0,14,17, true, 0, "player");
player.isInMinigame = false;
player.health = 100;
player.setAnimation("Images/Player/player.png");
player.walktime = 0;
player.targetHealth = 100;
player.hasCollision = false;
camera.x = 0;
camera.y = 0;
                }
                let menu = createSprite(camera.x+25*defaultScale+15, camera.y+180, 50, 20, false, 0, "button");
                menu.hasCollision = false;
                menu.message = "menu";
                menu.onClick = function(){
                   currentGameStage = "start menu";
                   menu.lifetime = 0;
                      for (var j = 0; j < World.allSprites.length; j++){
                        let s = World.allSprites[j];
                            s.lifetime = 0;
                    }
                    camera.x = 0;
                    camera.y = 0;
                    prepareMenu();
                    console.log(player.x,player.y);
    player = createSprite(0,0,14,17, true, 0, "player");
    player.isInMinigame = false;
    player.health = 100;
    player.setAnimation("Images/Player/player.png");
    player.walktime = 0;
    player.targetHealth = 100;
    player.hasCollision = false;
    camera.x = 0;
    camera.y = 0;
    
            }
            }

            if (thisSprite.type == "zombie"){
                zombieCount--;
            }
            if (thisSprite.hasItem == true){
                thisSprite.item.lifetime = 0;
            }
            continue;
        }
        thisSprite.lifetime--;
        //update sprites{
        thisSprite.x+=thisSprite.velocityX;
        thisSprite.y+=thisSprite.velocityY;
        thisSprite.rotation+=thisSprite.rotationSpeed;
        thisSprite.hurtCooldown--;
        if (thisSprite.hasFriction){
            thisSprite.velocityX*=0.9;
            thisSprite.velocityY*=0.9;
        }
        if (thisSprite.type == "button"){
            if (thisSprite.isTouching(mouse)){
                thisSprite.scale = lerp(thisSprite.scale, defaultScale*1.2, 0.1);
                if (mouseDown){
                    thisSprite.onClick();
                }
            }else{
                thisSprite.scale = lerp(thisSprite.scale, defaultScale, 0.1);
            }
        }
        if (thisSprite.type == "footprint"){
           /// thisSprite.width = lerp(thisSprite.width, 0, 0.03);
           // thisSprite.height = lerp(thisSprite.height, 0, 0.03);
           thisSprite.alpha*=0.97;
        }
        if (thisSprite.type == "shell_particle"){
            thisSprite.width = lerp(thisSprite.width, 0, 0.03);
            thisSprite.height = lerp(thisSprite.height, 0, 0.03);
            thisSprite.velocityY+=0.5;
            if (thisSprite.y>thisSprite.maxY){
                thisSprite.velocityY*=-0.5;
                thisSprite.velocityX*=0.8;
            }
        }
        if (thisSprite.type == "walk_particle"){
            thisSprite.width = lerp(thisSprite.width, 0, 0.03);
            thisSprite.height = lerp(thisSprite.height, 0, 0.03);
            thisSprite.velocityY+=0.5;
        }
        if (thisSprite.type == "blood_particle"){
            thisSprite.width = lerp(thisSprite.width, 0, 0.03);
            thisSprite.height = lerp(thisSprite.height, 0, 0.03);
            ctx.shadowColor = thisSprite.shapeColor;
            ctx.shadowBlur = "40";
        }
        if (thisSprite.type == "player"){   
                let thisItem = thisSprite.item;
                positionItem(thisItem, thisSprite.x,thisSprite.y,mouse.x, mouse.y, 0, thisSprite.width*thisSprite.scale);
                thisItem.firerate--;
        }
        if (thisSprite.type == "zombie"){ 
            if (noAI){
            }else{
                if (thisSprite.isTouching(player)){
                    if (player.hurtCooldown<=0){
                    player.targetHealth-=10;
                    player.hurtCooldown=30;
                    }
                }
            let dx = player.x-thisSprite.x;
            let dy = player.y-thisSprite.y;
            let angle = Math.atan2(dy,dx);
            thisSprite.velocityX += Math.cos(angle)*thisSprite.accel;
            thisSprite.velocityY += Math.sin(angle)*thisSprite.accel;
            if (thisSprite.hasItem){
                let thisItem = thisSprite.item;
                thisItem.firerate--;
                positionItem(thisItem, thisSprite.x,thisSprite.y,player.x, player.y, 0, thisSprite.width*thisSprite.scale);
            }
        }
    }
            for (var j = 0; j < World.allSprites.length; j++){
                let s = World.allSprites[j];
                if (thisSprite.hasCollision && s.hasCollision){
            thisSprite.collide(s);
            }
            if (thisSprite.type == "zombie"){
                if (s.type == "bullet"){
                    if (s.isTouching(thisSprite)){
                        
                        for (let a =0; a < randomNumber(3,7); a++){
                            let p = createSprite(thisSprite.x, thisSprite.y, 5,5);
                            p.velocityX = Math.random()*randomNumber(-30,30);
                            p.velocityY = Math.random()*randomNumber(-30,30);
                            p.lifetime = 50;
                            p.type = "blood_particle";
                            p.shapeColor = thisSprite.shapeColor;
                            p.hasCollision = false;
                            }
                            
                            thisSprite.velocityX+=s.velocityX/3*thisSprite.knockbackResist;
                            thisSprite.velocityY+=s.velocityY/3*thisSprite.knockbackResist;
                        
                        World.allSprites.splice(j,1);
                    thisSprite.health-=1;
                    }
                }
            }
            }
        //}
        if (thisSprite.x<player.x+canvas.width/2+thisSprite.width*defaultScale && thisSprite.x > player.x-canvas.width/2-thisSprite.width*defaultScale && thisSprite.y<player.y+canvas.height/2+thisSprite.height*defaultScale && thisSprite.y > player.y-canvas.height/2-thisSprite.height*defaultScale){
    ctx.save();
    ctx.translate((thisSprite.x-camera.x+canvas.width/2)*1,(thisSprite.y-camera.y+canvas.height/2)*1);
    ctx.rotate(thisSprite.rotation);
    ctx.scale(thisSprite.mirrorX,thisSprite.mirrorY);
    ctx.globalAlpha = thisSprite.alpha;
    //ctx.globalCompositeOperation = "lighter";
        ctx.shadowBlur = thisSprite.shadowBlur;
        ctx.shadowColor = thisSprite.shadowColor;
    if (thisSprite.hurtCooldown%10 == 0&&thisSprite.hurtCooldown>0){
      ctx.fillStyle = "black";
    }
    else{
    ctx.fillStyle = thisSprite.shapeColor;
    }
    if (thisSprite.hasAnimation == true){
        ctx.drawImage(thisSprite.animation,(-thisSprite.width/2*thisSprite.scale), (-thisSprite.height/2*thisSprite.scale), (thisSprite.width*thisSprite.scale), (thisSprite.height*thisSprite.scale));
    }else{
    ctx.fillRect(-thisSprite.width/2*thisSprite.scale,-thisSprite.height/2*thisSprite.scale,thisSprite.width*thisSprite.scale, thisSprite.height*thisSprite.scale);
    }
 
    ctx.restore();
}
if (thisSprite.message != undefined){
    text(thisSprite.message, thisSprite.x, thisSprite.y, 20);
}
}   
}
function createSprite(x, y, w, h, hasItem, itemType, type){
    let newSprite = {
        x: x,
        y: y,
        velocityX: 0,
        velocityY: 0,
        hasFriction: true,
        rotation: 0,
        rotationSpeed:0,
        width: w,
        height: h,
        scale: defaultScale,
        alpha: 1,
        hasCollision: true,
        shapeColor: "gray",
        lifetime: Infinity,
        hasItem: hasItem,
        type: type,
        accel: 1,
        maxAccel: 2,
        minAccel: 1,
        health: 10,
        stamina: 100,
        hurtCooldown: 0,
        shadowColor: "transparent",
        shadowBlur: "0",
        hasAnimation: false,
        animation: undefined,
        mirrorX: 1,
        mirrorY: 1,
        isTouching: function(sprite){
            var dx = newSprite.x-sprite.x;
            var dy = newSprite.y-sprite.y;
                return ((Math.abs(dx)<(sprite.width*sprite.scale)/2+(newSprite.width*newSprite.scale)/2&&Math.abs(dy)<(sprite.height*sprite.scale)/2+(newSprite.height*newSprite.scale)/2));
            },
        collide: function(sprite){
            let dx = sprite.x-newSprite.x;
            let dy = sprite.y-newSprite.y;
            if (Math.abs(dx)<(sprite.width*sprite.scale)/2+(newSprite.width*newSprite.scale)/2&&Math.abs(dy)<(sprite.height*sprite.scale)/2+(newSprite.height*newSprite.scale)/2){
                let directionX = Math.sign(dx);
                let directionY = Math.sign(dy);
                newSprite.velocityX += -directionX;
                newSprite.velocityY += -directionY;
                sprite.velocityX -= -directionX;
                sprite.velocityY -= -directionY;
            }

        },
        pointTo: function(x,y){
            var dx = x-newSprite.x;
            var dy = y-newSprite.y;
            var angle = Math.atan2(dy,dx);
            newSprite.rotation = angle;
        },
        setAnimation: function(image){
            newSprite.hasAnimation = true;
            newSprite.animation = new Image();
            newSprite.animation.src = image;
        }
    }
    if (hasItem == true){
        let stats = itemTypes[itemType];
        newSprite.item = createSprite(x, y, w, w, false);
        newSprite.item.type = itemType;
        newSprite.item.ammoCount = 100;
        newSprite.item.hasCollision = false;
        newSprite.itemType = itemType;
        Object.assign(newSprite.item, stats);
        newSprite.item.firerate = 0;
        newSprite.item.setAnimation(stats.animation);
    }
    World.allSprites.push(newSprite);
    return newSprite
}
function shoot(x,y,r,type){
    //flashAlpha = 0.3;
    var bullet = createSprite(x,y,20,10);
    bullet.velocityX = Math.cos(r)*70;
    bullet.velocityY = Math.sin(r)*70;
    bullet.hasFriction = false;
    bullet.hasCollision = false;
    bullet.lifetime = 10;
    bullet.rotation = r;
    bullet.type = "bullet";
    bullet.shadowBlur = "100"
    bullet.shadowColor = "white";


}
function positionItem(thisItem, x1,y1,x2, y2, offset, radius){
    var angle = Math.atan2(y2-y1,x2-x1)+offset;
    var newX =  Math.round(x1 + (radius) * Math.cos(angle));
    var newY = Math.round(y1 + (radius) * Math.sin(angle))
    thisItem.x = newX;
    thisItem.y = newY;
    thisItem.pointTo(x2,y2);
    if (x2<x1){
        thisItem.mirrorY = -1;
    }else{
        thisItem.mirrorY = 1;
    }
 
}
function lerp(start, stop, Ifactor){
return(start*(1-Ifactor)+stop*Ifactor);
}
function text(string, x, y, size){
    ctx.font = size+"px Arial"
    ctx.fillStyle = "white";
    ctx.fillText(string, x-camera.x+canvas.width/2, y-camera.y+canvas.height/2);
}
function playSound(source, volume){
    let sound = new Audio(source);
    if (volume!=undefined){
        sound.volume = volume;
    }else{
        if (source == "Sounds/Weapons/pistol_shot.mp3"){
            sound.volume = (player.health/100)*0.2;

        }else{
    if (player.health/100 > 0){
    sound.volume = player.health/100;
    }else{
        sound.volume = 0.3;
    }
}
}
    sound.play();
}
function background(color){
    ctx.fillStyle = color;
    ctx.fillRect(0,0,canvas.width, canvas.height);
}
function keyDown(key){
    var isKeyPressed = false;

    //document.addEventListener("keydown")
    return keys[key];
}
function keyWentDown(key){
    return keys[key] && !prevKeys[key];
}
function randomNumber(min, max){
    return Math.floor(Math.random()*(max - min +1)+min);
}

setInterval(function loopGame(){
    draw();

    for (let key in keys){
        prevKeys[key] = keys[key];
    }
    World.frameCount++;
}, 1000/framerate);
