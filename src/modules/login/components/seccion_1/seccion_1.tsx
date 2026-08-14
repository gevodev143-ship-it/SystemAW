import { useEffect, useRef } from "react";
import style from "./seccion_1.module.css";

const Seccion_1 = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cx = canvas.getContext("2d")!;
    let animId: number;
    let t = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    type Stop = [number, string];

    const wave = (
      yBase: number,
      amp: number,
      freq: number,
      phase: number,
      stops: Stop[],
      lineW: number,
      blur: number
    ) => {
      cx.save();
      cx.filter = `blur(${blur}px)`;
      const grad = cx.createLinearGradient(0, 0, canvas.width, 0);
      stops.forEach(([s, c]) => grad.addColorStop(s, c));
      cx.strokeStyle = grad;
      cx.lineWidth = lineW;
      cx.lineCap = "round";
      cx.beginPath();
      for (let x = 0; x <= canvas.width; x += 2) {
        const y =
          yBase +
          Math.sin(x * freq + phase + t) * amp +
          Math.sin(x * freq * 0.5 + phase * 1.3 + t * 0.7) * amp * 0.4;
        x === 0 ? cx.moveTo(x, y) : cx.lineTo(x, y);
      }
      cx.stroke();
      cx.restore();
    };

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      cx.clearRect(0, 0, w, h);

      // Fondo radial azul — color principal del logo
      const bg = cx.createRadialGradient(w * 0.25, h * 0.5, 0, w * 0.25, h * 0.5, w * 0.75);
      bg.addColorStop(0, "rgba(26,111,219,0.35)");
      bg.addColorStop(0.5, "rgba(107,45,232,0.15)");
      bg.addColorStop(1, "rgba(6,1,31,0)");
      cx.fillStyle = bg;
      cx.fillRect(0, 0, w, h);

      // Resplandor naranja — como el punto del logo
      const og = cx.createRadialGradient(w * 0.78, h * 0.22, 0, w * 0.78, h * 0.22, w * 0.3);
      og.addColorStop(0, "rgba(240,90,26,0.18)");
      og.addColorStop(1, "rgba(240,90,26,0)");
      cx.fillStyle = og;
      cx.fillRect(0, 0, w, h);

      // Onda principal — azul → naranja → violeta
      wave(h * 0.44, h * 0.13, 0.008, 0, [
        [0,    "rgba(26,111,219,0)"],
        [0.12, "rgba(26,111,219,0.2)"],
        [0.32, "rgba(240,90,26,0.95)"],
        [0.52, "rgba(255,160,40,1)"],
        [0.72, "rgba(107,45,232,0.85)"],
        [1,    "rgba(50,0,150,0)"],
      ], 26, 18);

      // Onda secundaria — violeta a naranja
      wave(h * 0.48, h * 0.11, 0.009, 1.2, [
        [0,   "rgba(107,45,232,0)"],
        [0.2, "rgba(240,90,26,0.65)"],
        [0.45,"rgba(255,170,50,0.9)"],
        [0.7, "rgba(107,45,232,0.6)"],
        [1,   "rgba(26,111,219,0)"],
      ], 10, 8);

      // Onda tenue superior — azul claro
      wave(h * 0.34, h * 0.09, 0.01, 0.5, [
        [0,    "rgba(26,111,219,0)"],
        [0.25, "rgba(80,160,255,0.35)"],
        [0.55, "rgba(26,111,219,0.2)"],
        [1,    "rgba(26,111,219,0)"],
      ], 4, 4);

      // Onda inferior — violeta
      wave(h * 0.58, h * 0.08, 0.007, 2.5, [
        [0,   "rgba(107,45,232,0)"],
        [0.3, "rgba(150,60,255,0.5)"],
        [0.6, "rgba(240,90,26,0.35)"],
        [1,   "rgba(80,0,200,0)"],
      ], 5, 3);

      // Onda fina naranja — acento
      wave(h * 0.62, h * 0.06, 0.011, 3.1, [
        [0,   "rgba(240,90,26,0)"],
        [0.4, "rgba(255,130,30,0.3)"],
        [0.7, "rgba(240,90,26,0.2)"],
        [1,   "rgba(200,60,0,0)"],
      ], 2, 2);

      t += 0.012;
      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className={style.seccion}>
      <canvas ref={canvasRef} className={style.canvas} />
      <div className={style.sparkle} style={{ top: "38%", left: "22%", animationDelay: "0.3s" }} />
      <div className={style.sparkle} style={{ top: "55%", left: "48%", animationDelay: "0.9s", animationDuration: "2.8s" }} />
      <div className={style.sparkle} style={{ top: "30%", left: "65%", animationDelay: "1.5s", animationDuration: "1.9s" }} />
      <div className={style.sparkle} style={{ top: "70%", left: "80%", background: "#f05a1a", animationDelay: "0.1s", animationDuration: "2.4s" }} />
      <div className={style.sparkle} style={{ top: "20%", left: "10%", background: "#1a6fdb", animationDelay: "0.6s", animationDuration: "3.1s" }} />
      <div className={style.sparkle} style={{ top: "15%", left: "55%", background: "#6b2de8", animationDelay: "1.2s", animationDuration: "2.2s" }} />
      <div className={style.sparkle} style={{ top: "80%", left: "35%", background: "#f05a1a", animationDelay: "0.4s", animationDuration: "2.7s" }} />
    </div>
  );
};

export default Seccion_1;