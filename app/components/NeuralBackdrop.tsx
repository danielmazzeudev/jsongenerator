"use client";

import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseVx: number;
  baseVy: number;
  radius: number;
  opacity: number;
  pulse: number;
  pulseSpeed: number;
}

export function NeuralBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const nodesRef = useRef<Node[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const activeCtx = ctx;

    const container = canvas.parentElement;
    if (!container) return;

    function initNodes(width: number, height: number) {
      const area = width * height;
      const count = Math.floor(Math.min(50, Math.max(20, area / 40000)));
      const mobile = width < 768;
      const s = mobile ? width / 768 : width / 1920;
      const nodes: Node[] = [];
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() * 0.3 + 0.15) * s;
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: 0,
          vy: 0,
          baseVx: Math.cos(angle) * speed,
          baseVy: Math.sin(angle) * speed,
          radius: (Math.random() * 1.5 + 0.8) * s,
          opacity: mobile ? Math.random() * 0.3 + 0.25 : Math.random() * 0.35 + 0.3,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.02 + 0.008,
        });
      }
      nodesRef.current = nodes;
    }

    let lastWidth = 0;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const activeCanvas = canvasRef.current;
      if (!activeCanvas) return;
      activeCanvas.width = w * dpr;
      activeCanvas.height = h * dpr;
      activeCanvas.style.width = `${w}px`;
      activeCanvas.style.height = `${h}px`;
      activeCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (w !== lastWidth) {
        lastWidth = w;
        initNodes(w, h);
      }
    }

    function draw() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      activeCtx.clearRect(0, 0, w, h);
      timeRef.current++;

      const nodes = nodesRef.current;
      const mouse = mouseRef.current;
      const isDark = document.documentElement.classList.contains("dark");
      const isMobile = w < 768;
      const scale = isMobile ? w / 768 : w / 1920;
      const maxDist = isMobile ? 130 : 220 * scale;
      const mouseMaxDist = isMobile ? 110 : 180 * scale;
      const mouseRepelDist = isMobile ? 90 : 150 * scale;
      const mouseActive = mouse.x > 0 && mouse.y > 0;
      const c = isDark ? "200, 200, 220" : isMobile ? "90, 90, 120" : "70, 70, 130";
      const cLine = isDark
        ? isMobile
          ? "180, 180, 210"
          : "190, 190, 230"
        : isMobile
          ? "100, 100, 120"
          : "60, 60, 140";
      const cMouse = isDark
        ? isMobile
          ? "170, 170, 200"
          : "180, 180, 220"
        : isMobile
          ? "80, 80, 110"
          : "50, 50, 130";
      const cCore = isDark
        ? isMobile
          ? "200, 200, 230"
          : "210, 210, 245"
        : isMobile
          ? "60, 60, 90"
          : "40, 40, 120";
      const cCoreEdge = isDark
        ? isMobile
          ? "180, 180, 210"
          : "190, 190, 225"
        : isMobile
          ? "80, 80, 110"
          : "60, 60, 130";

      for (const node of nodes) {
        node.pulse += node.pulseSpeed;

        if (mouseActive) {
          const dx = node.x - mouse.x;
          const dy = node.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouseRepelDist && dist > 0) {
            const force = (mouseRepelDist - dist) / mouseRepelDist;
            node.vx += (dx / dist) * force * 0.5;
            node.vy += (dy / dist) * force * 0.5;
          }
        }

        node.vx *= 0.95;
        node.vy *= 0.95;

        node.x += node.baseVx + node.vx;
        node.y += node.baseVy + node.vy;

        if (node.x < -30) node.x = w + 30;
        if (node.x > w + 30) node.x = -30;
        if (node.y < -30) node.y = h + 30;
        if (node.y > h + 30) node.y = -30;
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * (isMobile ? 0.4 : 0.4);
            const grad = activeCtx.createLinearGradient(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
            const pulseI = (isMobile ? 0.5 : 0.6) + Math.sin(nodes[i].pulse) * (isMobile ? 0.5 : 0.4);
            const pulseJ = (isMobile ? 0.5 : 0.6) + Math.sin(nodes[j].pulse) * (isMobile ? 0.5 : 0.4);
            grad.addColorStop(0, `rgba(${cLine}, ${alpha * pulseI})`);
            grad.addColorStop(1, `rgba(${cLine}, ${alpha * pulseJ})`);
            activeCtx.beginPath();
            activeCtx.strokeStyle = grad;
            activeCtx.lineWidth = isMobile ? 0.5 : 1.1 * scale;
            activeCtx.moveTo(nodes[i].x, nodes[i].y);
            activeCtx.lineTo(nodes[j].x, nodes[j].y);
            activeCtx.stroke();
          }
        }
      }

      if (mouseActive) {
        for (const node of nodes) {
          const dx = node.x - mouse.x;
          const dy = node.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouseMaxDist) {
            const alpha = (1 - dist / mouseMaxDist) * (isMobile ? 0.42 : 0.4);
            const grad = activeCtx.createLinearGradient(mouse.x, mouse.y, node.x, node.y);
            grad.addColorStop(0, `rgba(${cMouse}, ${alpha * (isMobile ? 0.68 : 0.7)})`);
            grad.addColorStop(1, `rgba(${cMouse}, ${alpha})`);
            activeCtx.beginPath();
            activeCtx.strokeStyle = grad;
            activeCtx.lineWidth = isMobile ? 0.4 : 0.8 * scale;
            activeCtx.moveTo(mouse.x, mouse.y);
            activeCtx.lineTo(node.x, node.y);
            activeCtx.stroke();
          }
        }
      }

      for (const node of nodes) {
        const breathe = 0.6 + Math.sin(node.pulse) * 0.4;
        const nodeOpacity = node.opacity * breathe;

        const glowRadius = node.radius * 6;
        const gradient = activeCtx.createRadialGradient(node.x, node.y, 0, node.x, node.y, glowRadius);
        gradient.addColorStop(0, `rgba(${c}, ${nodeOpacity * (isMobile ? 0.35 : 0.4)})`);
        gradient.addColorStop(0.4, `rgba(${c}, ${nodeOpacity * (isMobile ? 0.14 : 0.15)})`);
        gradient.addColorStop(1, `rgba(${c}, 0)`);
        activeCtx.beginPath();
        activeCtx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2);
        activeCtx.fillStyle = gradient;
        activeCtx.fill();

        const coreGrad = activeCtx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.radius);
        coreGrad.addColorStop(0, `rgba(${cCore}, ${isMobile ? nodeOpacity * 0.92 : nodeOpacity})`);
        coreGrad.addColorStop(1, `rgba(${cCoreEdge}, ${nodeOpacity * (isMobile ? 0.62 : 0.7)})`);
        activeCtx.beginPath();
        activeCtx.arc(node.x, node.y, node.radius * (isMobile ? 1 : 1.2), 0, Math.PI * 2);
        activeCtx.fillStyle = coreGrad;
        activeCtx.fill();
      }

      animationRef.current = requestAnimationFrame(draw);
    }

    function handleMouse(e: MouseEvent) {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    }

    function handleMouseLeave() {
      mouseRef.current = { x: -1000, y: -1000 };
    }

    function handleTouch(e: TouchEvent) {
      const touch = e.touches[0];
      if (touch) {
        mouseRef.current = { x: touch.clientX, y: touch.clientY };
      }
    }

    function handleTouchEnd() {
      mouseRef.current = { x: -1000, y: -1000 };
    }

    resize();

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouse);
    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("touchstart", handleTouch, { passive: true });
    window.addEventListener("touchmove", handleTouch, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouse);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("touchstart", handleTouch);
      window.removeEventListener("touchmove", handleTouch);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true" />;
}
