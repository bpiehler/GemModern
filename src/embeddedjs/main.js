import Poco from "commodetto/Poco";

console.log("--- MODERN CLASSIC FINAL ---");

const render = new Poco(screen);
const font = new render.Font("Bitham-Black", 30);
const smallFont = new render.Font("Gothic-14", 14);

// Default configuration
let config = {
    bgColor: render.makeColor(0, 0, 0),
    dialColor: render.makeColor(85, 85, 85),
    numberColor: render.makeColor(255, 255, 255),
    hourHandColor: render.makeColor(255, 255, 255),
    minuteHandColor: render.makeColor(170, 170, 170)
};

let batteryLevel = 1.0;

// Setup Battery
if (navigator.getBattery) {
    navigator.getBattery().then(battery => {
        batteryLevel = battery.level;
        battery.onlevelchange = () => {
            batteryLevel = battery.level;
            draw();
        };
    });
}

function hexToRgb(hex) {
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    return render.makeColor(r, g, b);
}

function fillCircle(color, xc, yc, r) {
    if (r <= 0) return;
    let x = 0, y = r;
    let d = 3 - 2 * r;
    while (y >= x) {
        render.fillRectangle(color, xc - x, yc + y, x * 2, 1);
        render.fillRectangle(color, xc - x, yc - y, x * 2, 1);
        render.fillRectangle(color, xc - y, yc + x, y * 2, 1);
        render.fillRectangle(color, xc - y, yc - x, y * 2, 1);
        x++;
        if (d > 0) {
            y--;
            d = d + 4 * (x - y) + 10;
        } else {
            d = d + 4 * x + 6;
        }
    }
}

// Bresenham line
function drawLine(color, x0, y0, x1, y1, thickness) {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = (x0 < x1) ? 1 : -1;
    const sy = (y0 < y1) ? 1 : -1;
    let err = dx - dy;

    while (true) {
        render.fillRectangle(color, x0 - Math.floor(thickness/2), y0 - Math.floor(thickness/2), thickness, thickness);
        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x0 += sx;
        }
        if (e2 < dx) {
            err += dx;
            y0 += sy;
        }
    }
}

function draw() {
    try {
        render.begin();
        const cx = render.width / 2;
        const cy = render.height / 2;
        const radius = Math.min(cx, cy) - 5;

        // Background
        render.fillRectangle(config.bgColor, 0, 0, render.width, render.height);

        // Dial face
        fillCircle(config.dialColor, cx, cy, radius);

        const now = new Date();
        const hours = now.getHours() % 12;
        const minutes = now.getMinutes();

        // Tick marks
        for (let i = 1; i <= 12; i++) {
            const angle = (i * 30) * (Math.PI / 180);
            const x1 = Math.round(cx + (radius - 10) * Math.sin(angle));
            const y1 = Math.round(cy - (radius - 10) * Math.cos(angle));
            const x2 = Math.round(cx + radius * Math.sin(angle));
            const y2 = Math.round(cy - radius * Math.cos(angle));
            drawLine(config.numberColor, x1, y1, x2, y2, 2);
        }

        // Date
        const dateStr = now.toDateString().split(' ').slice(1, 3).join(' '); 
        const dw = render.getTextWidth(dateStr, smallFont);
        render.drawText(dateStr, smallFont, config.numberColor, cx - dw / 2, cy - radius / 2);

        // Battery
        let batColor = render.makeColor(0, 255, 0);
        if (batteryLevel < 0.2) batColor = render.makeColor(255, 0, 0);
        else if (batteryLevel < 0.5) batColor = render.makeColor(255, 255, 0);
        
        const bx = Math.round(cx + radius / 2.5);
        fillCircle(batColor, bx, cy, 18);
        const batText = Math.round(batteryLevel * 100) + "%";
        const bw = render.getTextWidth(batText, smallFont);
        render.drawText(batText, smallFont, config.bgColor, bx - bw / 2, cy - smallFont.height / 2);

        // Hands
        const minuteAngle = (minutes * 6) * (Math.PI / 180);
        const hourAngle = (hours * 30 + minutes * 0.5) * (Math.PI / 180);

        const mx = Math.round(cx + (radius * 0.8) * Math.sin(minuteAngle));
        const my = Math.round(cy - (radius * 0.8) * Math.cos(minuteAngle));
        const hx = Math.round(cx + (radius * 0.5) * Math.sin(hourAngle));
        const hy = Math.round(cy - (radius * 0.5) * Math.cos(hourAngle));

        drawLine(config.hourHandColor, cx, cy, hx, hy, 5);
        drawLine(config.minuteHandColor, cx, cy, mx, my, 3);

        // Center Pin
        fillCircle(config.numberColor, cx, cy, 6);

        render.end();
    } catch (e) {
        console.log("Draw Error: " + e);
    }
}

watch.addEventListener("minutechange", draw);
watch.addEventListener("appmessage", (dict) => {
    if (dict.bgColor !== undefined) config.bgColor = hexToRgb(dict.bgColor.toString(16).padStart(6, '0'));
    if (dict.dialColor !== undefined) config.dialColor = hexToRgb(dict.dialColor.toString(16).padStart(6, '0'));
    if (dict.numberColor !== undefined) config.numberColor = hexToRgb(dict.numberColor.toString(16).padStart(6, '0'));
    if (dict.hourHandColor !== undefined) config.hourHandColor = hexToRgb(dict.hourHandColor.toString(16).padStart(6, '0'));
    if (dict.minuteHandColor !== undefined) config.minuteHandColor = hexToRgb(dict.minuteHandColor.toString(16).padStart(6, '0'));
    draw();
});

draw();
