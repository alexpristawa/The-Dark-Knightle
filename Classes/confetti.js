let confettiColors = [
    ["# 2B4D59", "#39998E", "#FFDC7C", "#FFAA67", "#DA674A"],
    ['rgb(184, 105, 99)', 'rgb(47, 110, 49)', "rgb(70, 96, 135)", "rgb(143, 86, 129)"],
    ['#B7D8D6', '#789E9E', '#4D6466', '#EEF3DB', '#FE615A']
];

let gravity = 30;
let terminalVelocity = 15;
let confettiIntervalRunning = false;

class Confetti {
    static instances = [];

    constructor(x, y, color, remainingLength) {
        this.x = x;
        this.y = y;
        this.angleX = 0;
        this.angleY = 0;
        this.angleZ = 0;
        this.angleChangeX = Math.random()*1440-720;
        this.angleChangeY = Math.random()*1440-720;
        this.angleChangeZ = Math.random()*1440-720;
        this.element = document.createElement("div");
        this.element.classList.add('confetti');
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
        this.element.style.width = `${Math.random()*2+1}vw`;
        this.element.style.height = `${Math.random()*2+1}vw`;
        this.hv = Math.random()*20-10;
        this.vv = Math.random()*15+7.5;
        this.element.style.backgroundColor = color;
        this.remainingLength = remainingLength;
        body.appendChild(this.element);

        Confetti.instances.push(this);
    }

    updateProperties() {
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
        this.element.style.transform = `rotateX(${this.angleX}deg) rotateY(${this.angleY}deg) rotateZ(${this.angleZ}deg)`;
    }

    static getInstances() {
        return Confetti.instances;
    }
}

let confettiExplosion = (x, y, amount, length) => {
    let colorIndex = Math.floor(Math.random()*confettiColors.length);
    for(let i = 0; i < amount; i++) {
        new Confetti(x, y, confettiColors[colorIndex][Math.floor(Math.random()*confettiColors[colorIndex].length)], length);
        
    }

    if(!confettiIntervalRunning) {
        let confettiStartingTime = Date.now();
        let confettiPreviousTime = Date.now();
        confettiIntervalRunning = true;
        let windowWidth = window.innerWidth;
        let windowHeight = window.innerHeight;
        let interval = setInterval(() => {
            let deltaTime = Date.now() - confettiPreviousTime;
            let deltaFrames = 1000/deltaTime;
            let instances = Confetti.getInstances();
            if(instances.length == 0) {
                confettiIntervalRunning = false;
                clearInterval(interval);
            }
            for(let i = 0; i < instances.length; i++) {
                instances[i].x += instances[i].hv;
                instances[i].vv -= gravity/deltaFrames;
                console.log(deltaFrames);
                if(-instances[i].vv > terminalVelocity) {
                    instances[i].vv = -terminalVelocity;
                }
                instances[i].y -= instances[i].vv;
                instances[i].angleX += instances[i].angleChangeX/deltaFrames;
                instances[i].angleY += instances[i].angleChangeY/deltaFrames;
                instances[i].angleZ += instances[i].angleChangeZ/deltaFrames;
                instances[i].remainingLength -= deltaTime;
                instances[i].updateProperties();
                if(instances[i].x < -50 || instances[i].x > windowWidth + 50 || instances[i].y < -50 || instances[i].y > windowHeight + 50 || instances[i].remainingLength < 0) {
                    instances[i].element.remove();
                    instances.splice(i, 1);
                    i--;
                }
            }
            confettiPreviousTime = Date.now();
        },1000/60);
    }
}