var alienColors = [];
var muteColors = [];

function setup() {
	createCanvas(625, 750);
	noStroke();
	angleMode(DEGREES);

	alienColors = [
		color(73, 171, 41),
		color(22, 180, 224),
		color(255, 178, 71),
		color(217, 79, 232),
		color(99, 43, 38)
	];

	alienTypes = [
	    [greenAlien, 75, alienColors[0], 30, 30],
	    [blueAlien, 110, alienColors[1], 30, 30],
	    [orangeAlien, 50, alienColors[2], 19, 18],
	    [shieldAlien, 50, alienColors[3], 35, 30],
	    [momOrange, 50, alienColors[2], 42, 40],
	    [mouthAlien, 50, alienColors[4], 40, 30]
	];

	muteColors = [color(210, 210, 210), color(240, 240, 240)];


}

var laserScale = 8;
var laserStage = 0;
var laserAngle = 0;
var laserLength = 400;
var laserOffscreen = false;
var shootingLaser = false;
var laserFinished = false;
var readyToFire = false;
var turretMovable = false;
var readyToMove = false;
var moveStage = 0;
var lastStage = 0;
var deathY = 470;
var greatestEnemyY = 0;
var gameOver = false;

var turretRecoil = 0;
var turretR = 0;

var lastMouseR = 0;

var aliensKilled = 0;
var bestScore = 0;

var enemies = [];
var alienTypes = [];
var spawnCount = 1;
var spawnPlus = 1.35;
var spawnVal = 30;
var nextBurst = 10;

var buildings = [1, 1, 1, 1];
var buildingPositions = [60, 120, 365, 430];

var buttonList = [];
var muteColor = 0;
var gameMuted = false;
var titleScreen = true;


var music = {
	invasionIntro: new Howl ({
		src: [
			'Audio/Invasion_Intro.ogg'
		],
		onend: function() {
			music.invasionBody.play();
		},
		volume: 0.9
	}),
	invasionBody: new Howl({
		src: [
			'Audio/Invasion_Body.ogg'
		],
		loop: true,
		volume: 0.9
	})
}

var sfx = {
	laser1: new Howl ({
		src: [
			'Audio/laser1.ogg'
		],
		volume: 0.065,
		rate: 0.65
	}),
	laser2: new Howl ({
		src: [
			'Audio/laser2.ogg'
		],
		volume: 0.065,
		rate: 0.65
	}),
	laser3: new Howl ({
		src: [
			'Audio/laser3.ogg'
		],
		volume: 0.065,
		rate: 0.65
	}),
	kill1: new Howl ({
		src: [
			'Audio/kill1.ogg'
		],
		volume: 0.1,
		rate: 1
	}),
	kill2: new Howl ({
		src: [
			'Audio/kill2.ogg'
		],
		volume: 0.1,
		rate: 1
	}),
	kill3: new Howl ({
		src: [
			'Audio/kill3.ogg'
		],
		volume: 0.1,
		rate: 1
	}),
	kill4: new Howl ({
		src: [
			'Audio/kill4.ogg'
		],
		volume: 0.1,
		rate: 1
	}),
	kill5: new Howl ({
		src: [
			'Audio/kill5.ogg'
		],
		volume: 0.1,
		rate: 1
	}),
	destroy: new Howl ({
		src: [
			'Audio/destroy.ogg'
		],
		volume: 0.12,
		rate: 1
	})
}

var laserSounds = [sfx.laser1, sfx.laser2, sfx.laser3];
var deathSounds = [sfx.kill1, sfx.kill2, sfx.kill3, sfx.kill4, sfx.kill5];

var Button = function(x, y, w, h, t, f) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.t = t;
    this.f = f;
    this.enabled = true;
};

Button.prototype.checkHover = function() {
    return (mouseX > this.x * 1.25 && mouseX < (this.x + this.w) * 1.25 && mouseY > this.y * 1.25 && mouseY < (this.y + this.h) * 1.25);
};

Button.prototype.draw = function() {
    if (this.enabled) {
        if (this.checkHover()) {
            fill(190, 190, 190);
        } else {
            fill(170, 170, 170);
        }
    } else {
        fill(150, 150, 150);
    }
    rect(this.x, this.y, this.w, this.h, 5);
    fill(30, 30, 30);
    textSize(20);
    textAlign(CENTER, CENTER);
    text(this.t, this.x + this.w/2, this.y + this.h/2);
    textAlign(LEFT);
};

Button.prototype.onClick = function() {
    if (this.checkHover()) {
        this.f();
    }
};




var getMouseAngle = function() {
    if (mouseY > 557 * 1.25) {
        return lastMouseR;
    } else {
        var r = atan2(mouseY - 558 * 1.25, mouseX - 250 * 1.25) + 90;
        r = constrain(r, -80, 80);
        lastMouseR = r;
        return r;
    }
};

var pointInCircle = function(a, b, x, y, r) {
    var distPoints = (a - x) * (a - x) + (b - y) * (b - y);
    r *= r;
    if (distPoints < r) {
        return true;
    }
    return false;
};



var drawLaser = function(x, y, s, r, stage, bounces, length) {
    stroke(255, 0, 0);
    
    var travel = 0;
    
    var l = max(stage - length, 0);
    
    if (stage - length > 500) {
        turretMovable = true;
    }
    
    for (var i = 0; i <= bounces; i++) {
        var xVal = cos(r - 90);
        var yVal = sin(r - 90);
        
        var startX = x;
        var startY = y;
        
        strokeWeight(s);
        
        var skipNextLine = false;
        
        while (travel < stage) {
            x += xVal;
            y += yVal;
            
            if (stage > lastStage) {
                for (var j = 0; j < enemies.length; j++) {
                    var e = enemies[j];
                    if (pointInCircle(e.x, e.y, x, y, e.radius) && e.alive) {
                        e.die();
                    }
                }
            }
            
            if (l > travel) {
                startX = x;
                startY = y;
            }
            
            travel++;
            if (x < 10 || x > 490) {
                r *= -1;
                s *= 0.85;
                if (l > travel) {
                    skipNextLine = true;
                }
                break;
            }
            if (y < -1) {
                laserOffscreen = true;   
            }
        }
        if (!skipNextLine) {
            line(startX, startY, x, y);
        }
    }
    
    if ((travel < stage || laserOffscreen) && !laserFinished) {
        laserFinished = true;
    }
    
    lastStage = stage;
};

var drawPathIndicator = function(x, y, s, r, bounces, dots) {
    var travel = 0;
    
    fill(255, 255, 255);
    noStroke();
    
    for (var i = 0; i <= bounces; i++) {
        var xVal = cos(r - 90);
        var yVal = sin(r - 90);
        
        while (dots > 0) {
            x += xVal;
            y += yVal;
            
            travel++;
            
            if (travel === 80) {
                travel = 0;
                ellipse(x, y, s, s);
                s--;
                dots--;
            }
            
            if (x < 10 || x > 490) {
                r *= -1;
                ellipse(x, y, s, s);
                dots--;
                break;
            }
        }
        
        if (dots === 0) {
            return;
        }
    }
};

var drawEdges = function() {
    noStroke();
    fill(150, 150, 150);
    rect(0, 0, 10, 600);
    rect(490, 0, 10, 600);
};

var drawMars = function() {
    fill(145, 45, 32);
    arc(250, 600, 650, 80, 180, 360);
};

var drawBuilding = function(x, y, h) {
    fill(87, 95, 107);
    rect(x, y, 20, -h);
    for (var i = 0; i < h/10; i++) {
        fill(130, 175, 176);
        rect(x + 1, y - 5 - i * 9, 8, -5);
        rect(x + 11, y - 5 - i * 9, 8, -5);
    }
};

var drawRubble = function(x, y, h, offset) {
    fill(87, 95, 107);
    rect(x, y, 20, -h);
    triangle(x, y-h+1, x+20, y-h+1, offset+x, y-h-4);
};

var drawBuildings = function() {
    noStroke();
    if (buildings[0] === 1) {
        drawBuilding(40, 572, 40);
        drawBuilding(62, 569, 30);
    } else {
        drawRubble(40, 572, 6, 0);
        drawRubble(62, 569, 6, 0);
    }
    if (buildings[1] === 1) {
        drawBuilding(100, 565, 30);
        drawBuilding(122, 566, 40);
    } else {
        drawRubble(100, 565, 6, 20);
        drawRubble(122, 566, 5, 0);
    }
    if (buildings[2] === 1) {
        drawBuilding(345, 565, 40);
        drawBuilding(367, 566, 30);
    } else {
        drawRubble(345, 565, 7, 20);
        drawRubble(367, 566, 5, 0);
    }
    if (buildings[3] === 1) {
        drawBuilding(410, 569, 40);
        drawBuilding(432, 571, 30);
    } else {
        drawRubble(410, 569, 6, 0);
        drawRubble(432, 571, 6, 20);
    }
};

var drawAlert = function(x, y) {
    fill(255, 242, 0, 220);
    triangle(x, y - 20, x - 17, y + 10, x + 17, y + 10);
    fill(28, 28, 28, 210);
    ellipse(x, y + 5, 6, 6);
    ellipse(x, y - 7, 6, 15);
};

var drawAlerts = function() {
    var targets = [false, false, false, false];
    for (var i = 0; i < enemies.length; i++) {
        var e = enemies[i];
        if (e.attacking && !e.destroying) {
            targets[e.target] = true;
        }
    }
    if (targets[0]) {
        drawAlert(62, 552);
    }
    if (targets[1]) {
        drawAlert(121, 547);
    }
    if (targets[2]) {
        drawAlert(366, 547);
    }
    if (targets[3]) {
        drawAlert(432, 552);
    }
};

var drawTurret = function() {
    noStroke();
    fill(130, 130, 130);
    rect(-5, turretRecoil, 10, -40);
    rect(-7, -39 + turretRecoil, 14, -15);
    fill(100, 100, 100);
    ellipse(0, 0, 40, 40);
};

var resetLaser = function() {
    shootingLaser = false;
    readyToMove = true;
    laserOffscreen = false;
    laserLength = 400;
    laserScale = 8;
    laserStage = 0;
    lastStage = 0;
    turretMovable = true;
    for (var i = 0; i < enemies.length; i++) {
        var e = enemies[i];
        if (e.attacking) {
            e.destroying = true;   
        }
    }
};

var drawDeathLine = function() {
    stroke(61, 82, 107);
    strokeWeight(8);
    for (var i = 0; i < 10; i++) {
        line(i * 50 + 20, deathY, i * 50 + 30, deathY);
    }
};


/**Eyeball**/
{
var Eyeball = function(r) {
    this.x = 0;
    this.y = 0;
    this.r = r;
    this.pr = r/2;
    this.active = true;
    this.nextX = 0;
    this.nextY = 0;
    this.nextR = 0;
    this.nextS = 0;
    this.nextMove = millis() + random(250, 750);
    this.moveStage = 0;
    this.xMove = 0;
    this.yMove = 0;
    this.moving = true;
    this.locked = false;
};

Eyeball.prototype.findNextMove = function() {
    this.nextR = random(0, 360);
    this.nextS = random(0, this.r/4);
    this.nextX = cos(this.nextR) * this.nextS;
    this.nextY = sin(this.nextR) * this.nextS;
    this.xMove = (this.nextX - this.x) / 10;
    this.yMove = (this.nextY - this.y) / 10;
    this.nextMove = millis() + random(500, 1500);
    this.moveStage = 0;
};

Eyeball.prototype.update = function() {
    if (this.moving) {
        if (this.moveStage === 10) {
            this.findNextMove();
            this.moving = false;
        } else {
            this.x += this.xMove;
            this.y += this.yMove;
            this.moveStage++;
        }
    } else if (millis() > this.nextMove && !this.locked) {
        this.moving = true;
    }
};

Eyeball.prototype.draw = function() {
    fill(245, 245, 245);
    ellipse(0, 0, this.r, this.r);
    fill(30, 30, 30);
    ellipse(this.x, this.y, this.pr, this.pr);
};
}


var greenAlien = function() {
    stroke(73, 171, 41);
    strokeWeight(10);
    line(-17, 17, -25, 25);
    line(17, 17, 25, 25);
    line(0, 0, -10, 33);
    line(0, 0, 10, 33);
    noStroke();
    fill(73, 171, 41);
    ellipse(0, 0, 50, 50);
    this.eye.draw();
};

var blueAlien = function() {
    stroke(22, 180, 224);
    strokeWeight(10);
    line(-17, 17, -25, 25);
    line(17, 17, 25, 25);
    line(0, 0, -10, 33);
    line(0, 0, 10, 33);
    noStroke();
    fill(22, 180, 224);
    ellipse(0, 0, 50, 50);
    triangle(-25, -18, 25, -18, 0, -38);
    this.eye.draw();
};

var orangeAlien = function() {
    stroke(255, 178, 71);
    strokeWeight(6);
    line(0, 0, 0, 21);
    line(0, 0, -12, 17);
    line(0, 0, 12, 17);
    noStroke();
    fill(255, 178, 71);
    ellipse(0, 0, 30, 30);
    this.eye.draw();
};

var momOrange = function() {
    stroke(255, 178, 71);
    strokeWeight(13);
    line(0, 0, 0, 45);
    line(-5, 0, -20, 42);
    line(5, 0, 20, 42);
    line(10, 8, 38, 30);
    line(-10, 8, -38, 30);
    noStroke();
    fill(255, 178, 71);
    ellipse(0, 0, 70, 70);
    this.eye.draw();
};

var shieldAlien = function() {
    stroke(217, 79, 232);
    strokeWeight(12);
    line(-30, 0, -35, 0);
    line(30, 0, 35, 0);
    line(0, 30, 0, 35);
    line(0, -30, 0, -35);
    noStroke();
    fill(217, 79, 232);
    ellipse(0, 0, 60, 60);
    this.eye.draw();
};

var exposedAlien = function() {
    stroke(164, 59, 212);
    strokeWeight(10);
    line(-25, 0, -30, 0);
    line(25, 0, 30, 0);
    line(0, -25, 0, -30);
    line(0, 25, 0, 30);
    noStroke();
    fill(164, 59, 212);
    ellipse(0, 0, 50, 50);
    this.eye.draw();
};

var mouthAlien = function() {
    stroke(99, 43, 38);
    strokeWeight(12);
    line(0, 35, 0, 42);
    line(-15, 25, -25, 35);
    line(15, 25, 25, 35);
    line(0, -35, 0, -42);
    line(-15, -25, -25, -35);
    line(15, -25, 25, -35);
    noStroke();
    fill(99, 43, 38);
    ellipse(0, 0, 70, 70);
    fill(36, 20, 14);
    ellipse(0, 0, 60, 50);
    fill(163, 159, 150);
    triangle(-21, -18, -11, -23.5, -12, -8);
    triangle(-5, -25, 5, -25, 0, -10);
    triangle(21, -18, 11, -23.5, 12, -8);
    triangle(-21, 18, -11, 23.5, -12, 8);
    triangle(-5, 25, 5, 25, 0, 10);
    triangle(21, 18, 11, 23.5, 12, 8);
};


var Alien = function(sprite, move, c, radius, eyeS) {
    this.sprite = sprite;
    this.move = move;
    this.shield = false;
    this.x = 0;
    this.y = 0;
    this.radius = radius;
    this.c = c;
    this.alive = true;
    this.active = true;
    this.spawn = false;
    this.absorb = false;
    this.invincible = false;
    this.eye = new Eyeball(eyeS);
    this.deathParticles = [];
    this.deathCount = 0;
    this.attacking = false;
    this.target = 0;
    this.xMove = 0;
    this.destroying = false;
};

Alien.prototype.update = function() {
    this.eye.update();
    if (!this.alive) {
        this.deathCount++;
        for (var i = 0; i < this.deathParticles.length; i++) {
            var p = this.deathParticles[i];
            p[0] += p[3];
            p[1] += p[4];
        }
        if (this.deathCount > 40) {
            this.active = false;
        }
    }
};

Alien.prototype.die = function() {
    if (this.invincible) {
        return;
    }
	var s = deathSounds[floor(random(0, 5))];
	s.volume(random(0.06, 0.1));
	s.rate(random(0.93, 1.07));
	s.play();
    this.alive = false;
    for (var i = 0; i < floor(random(6, 9)); i++) {
        var x = random(-this.radius/2, this.radius/2);
        var y = random(-this.radius/2, this.radius/2);
        var xV = x / 15;
        var yV = y / 15;
        var s = floor(random(this.radius/2, this.radius * 1.25));
        this.deathParticles.push([x, y, s, xV, yV]);
    }
    if (this.shield && !this.destroying) {
        var a = new Alien(exposedAlien, 75, color(164, 59, 212), 30, 30);
        a.invincible = true;
        a.x = this.x;
        a.y = this.y;
        enemies.push(a);
        return;
    }
    if (this.absorb) {
        laserFinished = true;
    }
    if (this.spawn) {
        var a = alienTypes[2];
        for (var i = 0; i < 2; i++) {
            var e = new Alien(a[0], a[1], a[2], a[3], a[4]);
            e.invincible = true;
            e.y = this.y - 10;
            e.x = this.x + i * 50 - 25;
            enemies.push(e);
        }
    }
    aliensKilled++;
};

Alien.prototype.draw = function() {
    push();
    translate(this.x, this.y);
    if (this.alive) {
        this.sprite();
    } else {
        fill(this.c);
        for (var i = 0; i < this.deathParticles.length; i++) {
            var p = this.deathParticles[i];
            ellipse(p[0], p[1], p[2], p[2]);
            p[2] = max(0, p[2] - 1);
        }
    }
    pop();
};

Alien.prototype.findTarget = function() {
    var dist = 1000;
    for (var i = 0; i < 4; i++) {
        var d = abs(this.x - buildingPositions[i]);
        if (d < dist) {
            this.target = i;
            dist = d;
        }
    }
    this.xMove = (this.x - buildingPositions[this.target]) / 20;
};


var startGame = function() {
    aliensKilled = 0;
    gameOver = false;
    enemies = [];
    buildings = [1, 1, 1, 1];
    buildingPositions = [60, 120, 365, 430];
    buttonList = [];
    spawnCount = 1;
    spawnPlus = 1.35;
    spawnVal = 30;
    nextBurst = 10;
	readyToFire = true;
	turretMovable = true;
    
    for (var i = 0; i < 3; i++) {
        var t = alienTypes[0];
        var e = new Alien(t[0], t[1], t[2], t[3], t[4]);
        e.x = random(50, 450);
        e.y = i * 75 + 50;
        enemies.push(e);
    }
};

var restartBClicked = function() {
    startGame();
};

var restartButton = new Button(170, 260, 160, 40, "Restart", restartBClicked);

var exitBClicked = function() {
	Howler.stop();
	titleScreen = true;
	enemies = [];
	buttonList = [];
	buildings = [1, 1, 1, 1];
}

var exitButton = new Button(170, 305, 160, 40, "Exit", exitBClicked);

var endGame = function() {
    gameOver = true;
    bestScore = max(bestScore, aliensKilled);
    buttonList = [restartButton, exitButton];
};





var spawnAlien = function(type) {
    var t = alienTypes[type];
    var e = new Alien(t[0], t[1], t[2], t[3], t[4]);
    e.x = random(50, 450);
    e.y = -50;
    if (type === 4) {
        e.spawn = true;
    } else if (type === 3) {
        e.shield = true;
    } else if (type === 5) {
        e.absorb = true;
    }
    enemies.push(e);
};

var spawnAliens = function() {
    for (var i = 0; i < min(floor(spawnCount), 4); i++) {
        var rVal = floor(random(0, spawnVal));
        var aVal = 0;
        if (rVal < 40) {
            aVal = 0;
        } else if (rVal < 55) {
            aVal = 1;
        } else if (rVal < 68) {
            aVal = 2;
        } else if (rVal < 83) {
            aVal = 3;
        } else if (rVal < 90) {
            aVal = 4;
        } else {
            aVal = 5;
        }
        spawnAlien(aVal);
        spawnCount--;
    }
    spawnCount += random(spawnPlus - 0.25, spawnPlus + 0.25);
    if (spawnPlus < 1.75) {
        spawnPlus += 0.005;
    } else {
        spawnPlus += 0.0003;
    }
    nextBurst--;
    if (nextBurst <= 0) {
        nextBurst = floor(random(18, 28));
        spawnCount += random(4, 6);
		spawnCount += aliensKilled / 80;
    }
    spawnVal = min(100, spawnVal + 3);
};




draw = function() {
	Howler.mute(gameMuted);

	push();
	scale(1.25);
	
    background(22, 30, 56);

	if (titleScreen) {
		fill(250, 250, 250);
		textSize(50);
		text("ALIEN", 100, 200);
		text("INVASION!", 150, 250);
		textSize(24);
		text("- click to start -", 172, 360);

		push();
	    translate(250, 558);
	    if (turretMovable && !gameOver) {
	        var targetAngle = getMouseAngle();
	        if (turretR > targetAngle) {
	            turretR = max(turretR - 10, targetAngle);
	        } else if (turretR < targetAngle) {
	            turretR = min(turretR + 10, targetAngle);
	        }
	    } else {
	        turretR = laserAngle;
	    }
	    rotate(turretR);
	    drawTurret();
	    pop();

		drawBuildings();
		drawEdges();
		drawMars();
	} else {
	    //drawDeathLine();
	    
	    if (shootingLaser) {
	        drawLaser(250,558, laserScale, laserAngle, laserStage, 2, laserLength);
	        laserScale *= 0.99;
	        if (!laserFinished) {
	            laserStage += 30;
	        }
	        if (laserFinished) {
	            laserLength -= 30;
	        }
	        if (laserLength < -200) {
	            resetLaser();
	            spawnAliens();
	        }
	    }
	    
	    push();
	    translate(250, 558);
	    if (turretMovable && !gameOver) {
	        var targetAngle = getMouseAngle();
	        if (turretR > targetAngle) {
	            turretR = max(turretR - 10, targetAngle);
	        } else if (turretR < targetAngle) {
	            turretR = min(turretR + 10, targetAngle);
	        }
	    } else {
	        turretR = laserAngle;
	    }
	    rotate(turretR);
	    drawTurret();
	    pop();
	    
	    drawBuildings();
	
	    for (var i = 0; i < enemies.length; i++) {
	        var e = enemies[i];
	        if (!e.active) {
	            enemies.splice(i, 1);
	            i--;
	            continue;
	        }
	        e.update();
	        e.draw();
	        if (readyToMove && e.alive && !gameOver) {
	            if (!e.destroying) {
	                e.y += e.move / 25;
	                e.y = min(e.y, deathY);
	            }
	            if (e.destroying) {
	                if (moveStage < 20) {
	                    e.x -= e.xMove;
	                    e.y += 3.5;
	                } else if (moveStage === 24) {
						sfx.destroy.play();
	                    buildings[e.target] = 0;
	                    buildingPositions[e.target] = 3000;
	                    e.die();
	                    if (buildings[0] + buildings[1] + buildings[2] + buildings[3] === 0) {
	                        endGame();
	                    }
	                }
	            }
	        }
	    }
	    /*
	    if (readyToFire) {
	        drawPathIndicator(250, 558, 10, getMouseAngle(), 2, 5);
	    }
	    */
	    
	    if (readyToMove && !gameOver) {
	        moveStage++;
	        if (moveStage === 25) {
	            readyToMove = false;
	            moveStage = 0;
	            readyToFire = true;
	            for (var i = 0; i < enemies.length; i++) {
	                var e = enemies[i];
	                e.invincible = false;
	                if (e.y === deathY) {
	                    e.attacking = true;
	                    e.findTarget();
	                }
	            }
	        }
	    }
	    
	    drawEdges();
	    
	    drawAlerts();
	    
	    drawMars();
	    
	    turretRecoil = max(0, turretRecoil - 0.5);
	    
	    if (!gameOver) {
	        fill(250, 250, 250);
	        textSize(18);
	        text("Aliens Eradicated: " + aliensKilled, 12, 592);
	    } else {
	        fill(80, 80, 80, 235);
	        rect(150, 150, 200, 200);
	        fill(20, 0, 0);
	        textSize(36);
	        text("Game Over", 155, 185);
	        textSize(25);
	        fill(250, 250, 250);
	        text("Score: " + aliensKilled, 165, 220);
	        text("Best: " + bestScore, 180, 250);
	    }
	    
	    for (var i = 0; i < buttonList.length; i++) {
	        var b = buttonList[i];
	        b.draw();
	    }
	}
	pop();

	if (mouseX > 585 && mouseY > 710) {
		muteColor = 1;
	} else {
		muteColor = 0;
	}
	
	fill(muteColors[muteColor]);
	rect(585, 710, 45, 45, 5);
	if (gameMuted) {
		fill(100, 100, 100);
		textSize(24);
		text("x", 609, 737);
	} else {
		fill(100, 100, 100);
		ellipse(605, 731, 30, 30);
		fill(muteColors[muteColor]);
		ellipse(605, 731, 25, 25);
		fill(100, 100, 100);
		ellipse(605, 731, 20, 20);
		fill(muteColors[muteColor]);
		ellipse(605, 731, 15, 15);
		quad(605, 731, 617, 714, 589, 714, 589, 731);
		quad(605, 731, 617, 746, 589, 746, 589, 731);
	}
	fill(100, 100, 100);
	rect(593, 726, 8, 10);
	quad(601, 726, 601, 736, 608, 741, 608, 721);
};

mouseClicked = function() {
	if (mouseX > 585 && mouseY > 710) {
		gameMuted = !gameMuted;
		return;
	}
	if (titleScreen) {
		startGame();
		titleScreen = false;
		music.invasionIntro.play();
		return;
	}
    if (readyToFire) {
        laserAngle = getMouseAngle();
        shootingLaser = true;
        laserFinished = false;
        readyToFire = false;
        turretMovable = false;
        turretRecoil = 15;
		var s = laserSounds[floor(random(0, 3))];
		s.rate(random(0.55, 0.75));
		s.play();
    }
    laserLength -= 15;
    for (var i = 0; i < buttonList.length; i++) {
        buttonList[i].onClick();
    }
};










































//Devin