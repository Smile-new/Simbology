const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
const currentShapeText = document.getElementById('current-shape');
const buttons = document.querySelectorAll('.nav-item');

let particles = [];
const particleCount = 800; // Cantidad de corazoncitos pequeños
let currentShape = 'heart';
let rotationY = 0;

// Configuración de colores (Paleta Azul Mar y Blanco)
const colors = ['#124559', '#598392', '#aec3b0', '#ffffff'];

// Ajustar canvas al tamaño de la pantalla
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Clase Partícula
class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.z = Math.random() * 400 - 200;
        
        this.targetX = 0;
        this.targetY = 0;
        this.targetZ = 0;
        
        this.size = Math.random() * 10 + 5;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.speed = 0.05 + Math.random() * 0.03;
    }

    update() {
        // Rotación 3D simple en el eje Y
        let cosY = Math.cos(0.01);
        let sinY = Math.sin(0.01);
        
        let x = this.targetX * cosY - this.targetZ * sinY;
        let z = this.targetZ * cosY + this.targetX * sinY;
        
        this.targetX = x;
        this.targetZ = z;

        // Movimiento suave hacia el objetivo (Lerp)
        this.x += (this.targetX + canvas.width / 2 - this.x) * this.speed;
        this.y += (this.targetY + canvas.height / 2 - this.y) * this.speed;
        this.z += (this.targetZ - this.z) * this.speed;
    }

    draw() {
        // Proyección de perspectiva simple
        const perspective = 400 / (400 + this.z);
        const drawX = this.x;
        const drawY = this.y;
        const size = this.size * perspective;

        ctx.globalAlpha = Math.min(Math.max(perspective, 0.2), 1);
        ctx.fillStyle = this.color;
        ctx.font = `${size}px serif`;
        ctx.fillText('♥', drawX, drawY); // Cada partícula es un corazón
    }
}

// Generador de formas (Ecuaciones matemáticas para las siluetas)
// Generador de formas (Ecuaciones matemáticas para las siluetas)
function getShapePoints(shape) {
    let points = [];
    for (let i = 0; i < particleCount; i++) {
        let t = (i / particleCount) * Math.PI * 2;
        let x, y, z = (Math.random() - 0.5) * 30;

        if (shape === 'heart') {
            x = 16 * Math.pow(Math.sin(t), 3);
            y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
            x *= 12; y *= 12;
        } 
        else if (shape === 'star') {
            let r = 150 + 50 * Math.sin(t * 5);
            x = r * Math.cos(t);
            y = r * Math.sin(t);
        } 
        else if (shape === 'necklace') {
            // --- Lógica del Collar ---
            if (i < particleCount * 0.8) {
                // La cadena (forma de U/Teardrop)
                let tChain = (i / (particleCount * 0.8)) * Math.PI * 1.5 - (Math.PI * 0.75);
                x = 140 * Math.sin(tChain);
                y = 160 * Math.cos(tChain) - 100;
                z = Math.sin(tChain * 2) * 20; // Un poco de curvatura en Z
            } else {
                // El colgante (un pequeño rombo/diamante al final)
                let tGem = (i / (particleCount * 0.2)) * Math.PI * 2;
                x = 15 * Math.cos(tGem);
                y = 15 * Math.sin(tGem) + 65; // Posicionado al fondo del collar
                z = 10;
            }
        } 
        else if (shape === 'rose') {
            let r = 180 * Math.cos(4 * t);
            x = r * Math.cos(t);
            y = r * Math.sin(t);
        }

        points.push({ x, y, z });
    }
    return points;
}

// Inicializar partículas
function init() {
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    updateParticleTargets('heart');
}

function updateParticleTargets(shape) {
    const points = getShapePoints(shape);
    for (let i = 0; i < particleCount; i++) {
        particles[i].targetX = points[i].x;
        particles[i].targetY = points[i].y;
        particles[i].targetZ = points[i].z;
    }
}

// Bucle de animación
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    
    requestAnimationFrame(animate);
}

// Eventos de los botones
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