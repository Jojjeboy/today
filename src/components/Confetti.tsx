import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ConfettiProps {
    trigger: boolean;
    duration?: number;
}

export const Confetti: React.FC<ConfettiProps> = ({ trigger, duration = 5000 }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!trigger || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles: Particle[] = [];
        const colors = ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff'];

        class Particle {
            x: number;
            y: number;
            w: number;
            h: number;
            vx: number;
            vy: number;
            color: string;
            rotation: number;
            dRotation: number;
            opacity: number;

            constructor(x: number, y: number, isRain = false) {
                this.x = x;
                this.y = y;
                this.w = Math.random() * 10 + 5;
                this.h = Math.random() * 5 + 2;
                
                if (isRain) {
                    // Sky rain
                    this.vx = (Math.random() - 0.5) * 2;
                    this.vy = Math.random() * 5 + 2;
                } else {
                    // Burst effect
                    this.vx = (Math.random() - 0.5) * 15;
                    this.vy = (Math.random() - 0.5) * 15 - 10;
                }

                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.rotation = Math.random() * 360;
                this.dRotation = (Math.random() - 0.5) * 10;
                this.opacity = 1;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.vy += 0.2; // Gravity
                this.vx *= 0.99; // Air resistance
                this.rotation += this.dRotation;
                
                // Fade out near the end
                if (Date.now() - startTime > duration - 1000) {
                    this.opacity -= 0.01;
                }
            }

            draw(ctx: CanvasRenderingContext2D) {
                if (this.opacity <= 0) return;
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate((this.rotation * Math.PI) / 180);
                ctx.globalAlpha = Math.max(0, this.opacity);
                ctx.fillStyle = this.color;
                ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
                ctx.restore();
            }
        }

        const startTime = Date.now();

        // Create initial bursts from 3 points
        const createBurst = (x: number, y: number, count = 50) => {
            for (let i = 0; i < count; i++) {
                particles.push(new Particle(x, y));
            }
        };

        createBurst(canvas.width * 0.25, canvas.height * 0.5);
        createBurst(canvas.width * 0.5, canvas.height * 0.4);
        createBurst(canvas.width * 0.75, canvas.height * 0.5);

        let animationId: number;
        let lastRainTime = 0;

        const animate = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Add sky rain periodically
            const now = Date.now();
            if (now - startTime < duration - 1500 && now - lastRainTime > 100) {
                for (let i = 0; i < 3; i++) {
                    particles.push(new Particle(Math.random() * canvas.width, -20, true));
                }
                lastRainTime = now;
            }

            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.update();
                p.draw(ctx);

                if (p.y > canvas.height + 50 || p.opacity <= 0) {
                    particles.splice(i, 1);
                }
            }

            if (Date.now() - startTime < duration || particles.length > 0) {
                animationId = requestAnimationFrame(animate);
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        };

        animate();

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', handleResize);
        };
    }, [trigger, duration]);

    if (!trigger) return null;

    return createPortal(
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-[200] pointer-events-none"
        />,
        document.body
    );
};
