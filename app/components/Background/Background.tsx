'use client';

import { useEffect, useRef } from 'react';
import './Background.css';

export default function Background() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resize);
        resize();

        const chars = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ#$+-*=%';
        const alphabet = chars.split('');
        const fontSize = 16;
        let columns = Math.floor(canvas.width / fontSize);
        let rainDrops = Array(columns).fill(1);

        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.font = fontSize + 'px monospace';

            for (let i = 0; i < rainDrops.length; i++) {
                const text = alphabet[Math.floor(Math.random() * alphabet.length)];
                const isBright = Math.random() > 0.98;
                ctx.fillStyle = isBright ? '#fff' : '#00ffcc';
                ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);

                if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    rainDrops[i] = 0;
                }
                rainDrops[i]++;
            }
        };

        const interval = setInterval(draw, 50);

        const handleMouseMove = (e: MouseEvent) => {
            if (window.innerWidth > 700) {
                const { clientX, clientY } = e;
                const rotateX = ((clientY / window.innerHeight) - 0.5) * -30;
                const rotateY = ((clientX / window.innerWidth) - 0.5) * 35;
                canvas.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.2)`;
            } else {
                canvas.style.transform = 'none';
            }
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <div 
            style={{ 
                position: 'fixed', 
                top: 0, 
                left: 0, 
                width: '100vw', 
                height: '100vh', 
                zIndex: -1, 
                overflow: 'hidden',
                background: 'black'
            }}
        >
            <canvas 
                ref={canvasRef}
                style={{
                    display: 'block',
                    transition: 'transform 0.15s ease-out',
                    width: '100%',
                    height: '100%'
                }}
            />
        </div>
    );
}