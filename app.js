Math.clamp = function (current, min, max) {
    return Math.max(Math.min(current, max), Math.max(Math.min(current, max), min));
};

console.log(Math.clamp(0.5, 0, 1));


const ENTER_KEY = 13;

class Vector2 {

    _x = 0;
    _y = 0;

    constructor(x, y) {
        this._x = x;
        this._y = y;
    }

    get_x() { return this._x }
    get_y() { return this._y }
    set_x(a) { this._x = a }
    set_y(b) { this._y = b }
};

const game_loop = (elapsed) => {
    
    const speed = 1000;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    delta_time = elapsed || 0 - last_time;
    last_time = elapsed || 0;
    
    // let wobble_y = Math.sin(Date.now() / speed) * range;
    // let wobble_x = Math.cos(Date.now() / speed) * range;
    
    stars_behind_sun.forEach(s => {
        s.x = (s.x + s.velocity) % canvas.width;
        if (s.x == 0) s.y = Math.random() * canvas.height + 1;
        draw_star(s.size, s.x, s.y, s.speed)
    });
    
    draw_orbit(4, 0, Math.PI);
    if (earth_index >= earth_orbit_0pi.length) {
        draw_earth();
    }
    if (mars_index >= mars_orbit_0pi.length) {
        draw_mars();
    }

    draw_sun(speed);
    
    draw_orbit(4, Math.PI, 2 * Math.PI);
    if (earth_index < earth_orbit_0pi.length) {
        draw_earth();
    }
    if (mars_index < mars_orbit_0pi.length) {
        draw_mars();
    }
   
    earth_index = (earth_index + 1) % earth_points.length;    
    mars_index = (mars_index + 1) % mars_points.length;    

    stars_front_sun.forEach(s => {
        s.x = (s.x + s.velocity) % canvas.width;
        if (s.x == 0) s.y = Math.random() * canvas.height + 1;
        draw_star(s.size, s.x, s.y, s.speed)
    });


    pid = window.requestAnimationFrame(game_loop);
};

const get_ellipse_point = (x, y, radius_x, radius_y, start_radians, end_radians) => {

    // https://riptutorial.com/html5-canvas/example/18143/ellipse

    const ratio = radius_y / radius_x;
    const radius = Math.max(radius_x, radius_y) / 2;
    const points = [];
    const increments = 1 / radius;

    let _x = x + radius * Math.cos(start_radians), _y = y - ratio * radius * Math.sin(start_radians);
    points.push(new Vector2(_x, _y));

    for (let i = start_radians; i < end_radians; i += increments) {

        _x = x + radius * Math.cos(i);
        _y = y - ratio * radius * Math.sin(i);
        points.push(new Vector2(_x, _y));
    }

    return points;

}

const linspace_ellipse = (cx, cy, radius_x, radius_y, r0, r1, speed = 1) => {

    const points = [];

    for (let k = r0; k <= r1; k += 0.005 * 1/speed) {

        const x = radius_x * Math.cos(Math.PI * k) + cx;
        const y = radius_y * Math.sin(Math.PI * k) + cy;

        points.push(new Vector2(x, y));
    }

    return points;
}

const get_line_points = (ax, ay, bx, by, speed = 20, tolerance = 2.25) => {

    // https://riptutorial.com/html5-canvas/example/18815/finding-points-along-an-entire-path-containing-curves-and-lines

    const dx = bx - ax;
    const dy = by - ay;

    let last_x = last_y = -10000;

    const point_counts = (Math.sqrt(dx, 2) + Math.sqrt(dy, 2)) * speed;
    const points = [new Vector2(ax, ay)];

    for (let i = 0; i < point_counts; i++) {

        const t = i / point_counts;
        const x = ax + dx * t;
        const y = ay + dy * t;
        const dx1 = x - last_x, dy1 = y - last_y;

        if (dx * dx1 + dy * dy1 > tolerance) {
            points.push(new Vector2(x, y));
            last_x = x;
            last_y = y;
        }
    }

    points.push(new Vector2(bx, by));
    
    return points;
}

const draw_orbit = (orbits_count, first_angle, second_angle, radius = 200) => {

    const y_radius = 40;

    for (let i = 0; i < orbits_count; i++) {

        ctx.beginPath();
        ctx.ellipse(
            ((canvas.width / 2) - (10/2)), 
            ((canvas.height / 2) - (10/2)),
            radius * ((i / 1.3) + 1), y_radius * (i + 1), Math.PI, first_angle, second_angle);
        ctx.strokeStyle = "#fff";

        ctx.stroke();
    }

}

const draw_sun = (speed) => {

    let wobble_gradient = (Math.sin(Date.now() / 500) + 1) * 5;

    ctx.beginPath();
    const crown = ctx.createRadialGradient(((canvas.width / 2) - (10/2)), ((canvas.height / 2) - (10/2)), 100 >> 1, ((canvas.width / 2) - (10/2)), ((canvas.height / 2) - (10/2)), 100 >> 0);
    crown.addColorStop(0, "#ffbe2d2e");
    crown.addColorStop(1, "#ff8e2d0a");
    ctx.fillStyle = crown;
    ctx.arc(((canvas.width / 2) - (10/2)), ((canvas.height / 2) - (10/2)), 150 + wobble_gradient, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();

    const sun_gradient = ctx.createRadialGradient(((canvas.width / 2) - (10/2)), ((canvas.height / 2) - (10/2)), 100 >> 1, ((canvas.width / 2) - (10/2)), ((canvas.height / 2) - (10/2)), 100 >> 0);
    sun_gradient.addColorStop(0, "#ffbe2d");
   
    let alpha = (Math.abs(Math.sin(Date.now() / speed)) / 2) + 0.5;
    sun_gradient.addColorStop(alpha, "#ff8e2d");

    ctx.fillStyle = sun_gradient;
    ctx.strokeStyle = "#ff8e2d";
    ctx.arc(((canvas.width / 2) - (10/2)) + 0, ((canvas.height / 2) - (10/2)) + 0, 100, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

}

const draw_star = (line_size, start_pos_x, start_pos_y, speed = 100, radius = 0.5) => {

    let cos_line = Math.cos(Date.now() / speed) * radius;

    // begin drawing
    ctx.beginPath();

    // up left to bottom right
    ctx.moveTo(start_pos_x - cos_line, start_pos_y - cos_line);
    ctx.lineTo(start_pos_x + line_size + cos_line, start_pos_y + line_size + cos_line);
    // bottom left to up right
    ctx.moveTo(start_pos_x + line_size - cos_line, start_pos_y + cos_line);
    ctx.lineTo(start_pos_x + cos_line, start_pos_y + line_size - cos_line);
    // horizontally centered
    ctx.moveTo(start_pos_x, start_pos_y + (line_size >> 1));
    ctx.lineTo(start_pos_x + line_size, start_pos_y + (line_size >> 1));
    // vertically centered
    ctx.moveTo(start_pos_x + (line_size >> 1), start_pos_y);
    ctx.lineTo(start_pos_x + (line_size >> 1), start_pos_y + line_size);

    // stroke the lines
    ctx.strokeStyle = "#fff";
    ctx.stroke();
}

const draw_earth = () => {
    const earth = document.getElementById('earth'); 
    const size = 120;
    ctx.drawImage(earth, earth_points[earth_index].get_x() - size / 2, earth_points[earth_index].get_y() - size / 2, size, size);
}

const draw_mars = () => {
    const mars = document.getElementById('mars');
    const size = 90;
    ctx.drawImage(mars, mars_points[mars_index].get_x() - size / 2, mars_points[mars_index].get_y() - size / 2, size, size);
}


// ----------------------------------------------------

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

let pid = 0, last_time = 0, delta_time = 0;
const star_cords = [];

// draw star
for (let i = 0; i < 200; i++) {

    const x = Math.random() * canvas.width + 10;
    const y = Math.random() * canvas.height + 10;
    const size = Math.random() * 10 + 2;
    const speed = Math.random() * 400 + 50;
    const velocity = Math.random() + 0.1;

    star_cords.push({ x: x, y: y, size: size, speed: speed, velocity: velocity });

}

const stars_behind_sun = star_cords.slice(0, star_cords.length / 2 - 1);
const stars_front_sun = star_cords.slice(star_cords.length / 2, star_cords.length);

let earth_index = 0;
let mars_index = 0;

const earth_orbit_0pi = linspace_ellipse(
    (canvas.width / 2) - (10 / 2), 
    (canvas.height / 2) - (10 / 2),
    200 * ((2 / 1.3) + 1), 40 * 3, 0, 1, 2
);
const earth_orbit_pi0 = linspace_ellipse(
    (canvas.width / 2) - (10 / 2), 
    (canvas.height / 2) - (10 / 2),
    200 * ((2 / 1.3) + 1), 40 * 3, 1, 2, 2
);

const earth_points = [...earth_orbit_0pi, ...earth_orbit_pi0];

const mars_orbit_0pi = linspace_ellipse(
    (canvas.width / 2) - (10 / 2), 
    (canvas.height / 2) - (10 / 2),
    200 * ((3 / 1.3) + 1), 40 * 4, 0, 1, 3
);
const mars_orbit_pi0 = linspace_ellipse(
    (canvas.width / 2) - (10 / 2), 
    (canvas.height / 2) - (10 / 2)  ,
    200 * ((3 / 1.3) + 1), 40 * 4, 1, 2, 3
);

const mars_points = [...mars_orbit_0pi, ...mars_orbit_pi0];

game_loop();





