const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
const currentShapeText = document.getElementById('current-shape');
const buttons = document.querySelectorAll('.nav-item');

// --- OPTIMIZACIÓN 1: Detectar móvil y reducir partículas ---
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
const particleCount = isMobile ? 400 : 800; 
let particles = [];
const colors = ['#124559', '#598392', '#aec3b0', '#ffffff'];

// --- OPTIMIZACIÓN 2: Pre-renderizar el corazón (Sprite) ---
const heartSprite = document.createElement('canvas');
const sCtx = heartSprite.getContext('2d');
heartSprite.width = 40;
heartSprite.height = 40;
sCtx.fillStyle = '#ffffff';
sCtx.font = '30px serif';
sCtx.textAlign = 'center';
sCtx.textBaseline = 'middle';
sCtx.fillText('♥', 20, 20);

function resize() {
    // Limitamos el pixel ratio para evitar resoluciones excesivas en móviles
    const dpr = Math.min(window.devicePixelRatio, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);
}
window.addEventListener('resize', resize);
resize();

class Particle {
    constructor() {
        this.x = Math.random() * window.innerWidth;
        this.y = Math.random() * window.innerHeight;
        this.z = Math.random() * 400 - 200;
        this.targetX = 0;
        this.targetY = 0;
        this.targetZ = 0;
        this.size = Math.random() * 8 + 4;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.speed = isMobile ? 0.08 : 0.05; // Más rápido en móvil para compensar frames
    }

    update() {
        let cosY = 0.9998; // Valores pre-calculados de rotación sutil
        let sinY = 0.015;
        
        let x = this.targetX * cosY - this.targetZ * sinY;
        let z = this.targetZ * cosY + this.targetX * sinY;
        
        this.targetX = x;
        this.targetZ = z;

        this.x += (this.targetX + window.innerWidth / 2 - this.x) * this.speed;
        this.y += (this.targetY + window.innerHeight / 2 - this.y) * this.speed;
        this.z += (this.targetZ - this.z) * this.speed;
    }

    draw() {
        const perspective = 400 / (400 + this.z);
        const size = this.size * perspective;
        
        ctx.globalAlpha = Math.max(perspective, 0.3);
        
        // --- OPTIMIZACIÓN 3: Usar drawImage en lugar de fillText ---
        // Esto usa la tarjeta de video (GPU) de forma mucho más eficiente
        ctx.drawImage(heartSprite, this.x - size/2, this.y - size/2, size, size);
    }
}

// (La función getShapePoints se mantiene igual que la anterior)
function getShapePoints(shape) {
    let points = [];
    for (let i = 0; i < particleCount; i++) {
        let t = (i / particleCount) * Math.PI * 2;
        let x, y, z = (Math.random() - 0.5) * 30;

        if (shape === 'corazon') {
            x = 16 * Math.pow(Math.sin(t), 3);
            y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
            x *= 12; y *= 12;
        } 
        else if (shape === 'estrella') {
            let r = 150 + 50 * Math.sin(t * 5);
            x = r * Math.cos(t);
            y = r * Math.sin(t);
        } 
        else if (shape === 'collar') {
            if (i < particleCount * 0.8) {
                let tChain = (i / (particleCount * 0.8)) * Math.PI * 1.5 - (Math.PI * 0.75);
                x = 140 * Math.sin(tChain);
                y = 160 * Math.cos(tChain) - 100;
                z = Math.sin(tChain * 2) * 20;
            } else {
                let tGem = (i / (particleCount * 0.2)) * Math.PI * 2;
                x = 15 * Math.cos(tGem);
                y = 15 * Math.sin(tGem) + 65;
                z = 10;
            }
        } 
        else if (shape === 'rosa') {
            let r = 180 * Math.cos(4 * t);
            x = r * Math.cos(t);
            y = r * Math.sin(t);
        }
        points.push({ x, y, z });
    }
    return points;
}

function init() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    updateParticleTargets('corazon');
}

function updateParticleTargets(shape) {
    const points = getShapePoints(shape);
    for (let i = 0; i < particleCount; i++) {
        particles[i].targetX = points[i].x;
        particles[i].targetY = points[i].y;
        particles[i].targetZ = points[i].z;
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
    }
    requestAnimationFrame(animate);
}

buttons.forEach(btn => {
    btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const shape = btn.getAttribute('data-shape');
        currentShapeText.textContent = shape.charAt(0).toUpperCase() + shape.slice(1);
        updateParticleTargets(shape);
    });
});

init();
animate();