import { LiveBackground, type Theme } from "./LiveCanvas"

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const theme: Theme = "robot";

    const liveBackground = new LiveBackground({ canvas, theme });
})