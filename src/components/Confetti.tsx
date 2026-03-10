import React, { useEffect, useRef } from 'react';

interface ConfettiProps {
    trigger: boolean;
    duration?: number;
}

export const Confetti: React.FC<ConfettiProps> = ({ trigger, duration = 3000 }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!trigger || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles: Particle[] = [];
        const particleCount = 150;
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

            constructor(x: number, y: number) {
                this.x = x;
                this.y = y;
                this.w = Math.random() * 10 + 5;
                this.h = Math.random() * 5 + 2;
                this.vx = (Math.random() - 0.5) * 10;
                this.vy = (Math.random() - 0.5) * 10 - 5;
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.rotation = Math.random() * 360;
                this.dRotation = (Math.random() - 0.5) * 10;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.vy += 0.2; // Gravity
                this.vx *= 0.99; // Air resistance
                this.rotation += this.dRotation;
            }

            draw(ctx: CanvasRenderingContext2D) {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate((this.rotation * Math.PI) / 180);
                ctx.fillStyle = this.color;
                ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
                ctx.restore();
            }
        }

        // Burst from center
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle(canvas.width / 2, canvas.height / 2));
        }

        let animationId: number;
        const startTime = Date.now();

        const animate = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.update();
                p.draw(ctx);

                if (p.y > canvas.height) {
                    particles.splice(i, 1);
                }
            }

            if (Date.now() - startTime < duration && particles.length > 0) {
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

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-[100] pointer-events-none"
        />
    );
};
