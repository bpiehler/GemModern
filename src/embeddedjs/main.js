import Poco from "commodetto/Poco";

let render = new Poco(screen);
const font = new render.Font("Bitham-Black", 30);
const smallFont = new render.Font("Gothic-14", 14);

// Default configuration
let config = {
    bgColor: render.makeColor(0, 0, 0),
    dialColor: render.makeColor(85, 85, 85), // Dark gray
    numberColor: render.makeColor(255, 255, 255),
    hourHandColor: render.makeColor(255, 255, 255),
    minuteHandColor: render.makeColor(170, 170, 170) // Light gray
};

let batteryLevel = watch.battery.level;

function hexToRgb(hex) {
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    return render.makeColor(r, g, b);
}

watch.addEventListener('appmessage', (dict) => {
    if (dict.bgColor !== undefined) config.bgColor = hexToRgb(dict.bgColor.toString(16).padStart(6, '0'));
    if (dict.dialColor !== undefined) config.dialColor = hexToRgb(dict.dialColor.toString(16).padStart(6, '0'));
    if (dict.numberColor !== undefined) config.numberColor = hexToRgb(dict.numberColor.toString(16).padStart(6, '0'));
    if (dict.hourHandColor !== undefined) config.hourHandColor = hexToRgb(dict.hourHandColor.toString(16).padStart(6, '0'));
    if (dict.minuteHandColor !== undefined) config.minuteHandColor = hexToRgb(dict.minuteHandColor.toString(16).padStart(6, '0'));
    draw();
});

watch.addEventListener('battery', (level) => {
    batteryLevel = level;
    draw();
});

function draw() {
    render.begin();
    const cx = render.width / 2;
    const cy = render.height / 2;
    const radius = Math.min(cx, cy) - 5;

    // Background
    render.fillRectangle(config.bgColor, 0, 0, render.width, render.height);

    // Dial face
    render.fillCircle(config.dialColor, cx, cy, radius);

    // Ticks and Numbers
    for (let i = 1; i <= 12; i++) {
        const angle = (i * 30) * (Math.PI / 180);
        const x1 = cx + (radius - 5) * Math.sin(angle);
        const y1 = cy - (radius - 5) * Math.cos(angle);
        const x2 = cx + radius * Math.sin(angle);
        const y2 = cy - radius * Math.cos(angle);
        
        // Simple tick marks (using lines)
        // Note: Poco doesn't have a direct 'drawLine' but we can use fillRectangle for small widths or procedural pixels
        // For simplicity in Poco, we draw 2x2 squares as ticks
        render.fillRectangle(config.numberColor, x1 - 1, y1 - 1, 2, 2);

        // Numbers
        const nx = cx + (radius - 20) * Math.sin(angle);
        const ny = cy - (radius - 20) * Math.cos(angle);
        const label = i.toString();
        const lw = render.getTextWidth(label, smallFont);
        render.drawText(label, smallFont, config.numberColor, nx - lw / 2, ny - smallFont.height / 2);
    }

    const now = new Date();
    const hours = now.getHours() % 12;
    const minutes = now.getMinutes();

    // Date display
    const dateStr = now.toDateString().split(' ').slice(1, 3).join(' '); // e.g., "Apr 25"
    const dw = render.getTextWidth(dateStr, smallFont);
    render.drawText(dateStr, smallFont, config.numberColor, cx - dw / 2, cy - radius / 2);

    // Battery Complication
    let batColor;
    if (batteryLevel > 50) batColor = render.makeColor(0, 255, 0);
    else if (batteryLevel > 20) batColor = render.makeColor(255, 255, 0);
    else batColor = render.makeColor(255, 0, 0);

    const bx = cx + radius / 2;
    const by = cy;
    render.fillCircle(batColor, bx, by, 15);
    const batStr = batteryLevel + "%";
    const bw = render.getTextWidth(batStr, smallFont);
    render.drawText(batStr, smallFont, config.bgColor, bx - bw / 2, by - smallFont.height / 2);

    // Hands
    const minuteAngle = (minutes * 6) * (Math.PI / 180);
    const hourAngle = (hours * 30 + minutes * 0.5) * (Math.PI / 180);

    const mx = cx + (radius * 0.7) * Math.sin(minuteAngle);
    const my = cy - (radius * 0.7) * Math.cos(minuteAngle);
    const hx = cx + (radius * 0.45) * Math.sin(hourAngle);
    const hy = cy - (radius * 0.45) * Math.cos(hourAngle);

    // Draw hands as thin rectangles (Poco lacks drawLine)
    // We'll draw them as small rectangles at the endpoints for now as a placeholder
    // In a real implementation, we'd use a procedural line function
    render.fillRectangle(config.hourHandColor, hx - 2, hy - 2, 4, 4);
    render.fillRectangle(config.minuteHandColor, mx - 1, my - 1, 2, 2);
    
    // Draw center pin
    render.fillCircle(config.numberColor, cx, cy, 3);

    render.end();
}

watch.addEventListener('minutechange', draw);
draw();
