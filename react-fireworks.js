//创建变量
let fireworksField = "",
  opt = {},
  particles = [],
  rockets = [],
  //最大爆炸粒子数量，与每颗烟花爆炸的粒子数关联，影响爆炸后粒子的消失时间
  MAX_PARTICLES = 0,
  SCREEN_WIDTH = 0,
  SCREEN_HEIGHT = 0,
  SCREEN_TOP,
  SCREEN_BOTTOM,
  SCREEN_LEFT,
  SCREEN_RIGHT,
  Z_INDEX,
  canvas,
  context;

let reloadTimer;
let loopTimer;

//粒子类
class Particle{
  constructor(pos){
    this.pos = {
      x: pos ? pos.x : 0,
      y: pos ? pos.y : 0
    };
    this.vel = {
      x: 0,
      y: 0
    };
    this.shrink = 0.97;
    this.size = 2;
    this.resistance = 1;
    this.gravity = 0;
    this.flick = false;
    this.alpha = 1;
    this.fade = 0;
    this.color = 0;
  }

  update(){
    // apply resistance
    this.vel.x *= this.resistance;
    this.vel.y *= this.resistance;
    // gravity down
    this.vel.y += this.gravity;
    // update position based on speed
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
    // shrink
    this.size *= this.shrink;
    // fade out
    this.alpha -= this.fade;
  }

  render(c){
    if (!this.exists()) {
      return;
    }
    c.save();
    c.globalCompositeOperation = 'lighter';
    let x = this.pos.x,
      y = this.pos.y,
      r = this.size / 2;
    let gradient = c.createRadialGradient(x, y, 0.1, x, y, r);
    gradient.addColorStop(0.1, "rgba(255,255,255," + this.alpha + ")");
    gradient.addColorStop(0.8, "hsla(" + this.color + ", 100%, 50%, " + this.alpha + ")");
    gradient.addColorStop(1, "hsla(" + this.color + ", 100%, 50%, 0.1)");
    c.fillStyle = gradient;
    c.beginPath();
    c.arc(this.pos.x, this.pos.y, this.flick ? Math.random() * this.size : this.size, 0, Math.PI * 2, true);
    c.closePath();
    c.fill();
    c.restore();
  }

  exists(){
    return this.alpha >= 0.1 && this.size >= 1;
  }
}

//装弹类
class Rocket extends Particle{
  constructor(x) {
    super({
      x: x,
      y: SCREEN_HEIGHT
    });
    this.explosionColor = 0;
  }

  explode(){
    //爆炸的粒子数量
    for (let i = 0; i < opt.explode_debris_num; i++) {
      let particle = new Particle(this.pos);
      let angle = Math.random() * Math.PI * 2;
      // emulate 3D effect by using cosine and put more particles in the middle
      let speed = Math.cos(Math.random() * Math.PI / 2) * 15;
      particle.vel.x = Math.cos(angle) * speed;
      particle.vel.y = Math.sin(angle) * speed;
      //爆炸的粒子大小
      particle.size = opt.explode_particles_size;
      particle.gravity = 0.2;
      particle.resistance =  0.9 + opt.explode_particles_resistance * 0.01;
      particle.shrink = Math.random() * 0.05 + 0.95;
      particle.flick = true;
      particle.color = this.explosionColor;
      particles.push(particle);
    }
  }

  render(c){
    if (!this.exists()) {
      return;
    }
    c.save();
    c.globalCompositeOperation = 'lighter';
    let x = this.pos.x,
      y = this.pos.y,
      r = this.size / 2;
    let gradient = c.createRadialGradient(x, y, 0.1, x, y, r);
    gradient.addColorStop(0.1, "rgba(255, 255, 255 ," + this.alpha + ")");
    gradient.addColorStop(1, "rgba(0, 0, 0, " + this.alpha + ")");
    c.fillStyle = gradient;
    c.beginPath();
    c.arc(this.pos.x, this.pos.y, this.flick ? Math.random() * this.size / 2 + this.size / 2 : this.size, 0, Math.PI * 2, true);
    c.closePath();
    c.fill();
    c.restore();
  }
}

export default  {
  /**
   * 初始化烟花
   * @param dom
   * @param options：
   * 1、width 宽度 单位px
   * 2、height 高度 单位px
   * 3、top，bottom，left，right 绝对布局参数
   * 2、frequency 烟花发射频率 单位：毫秒
   * 3、launch_speed 烟花发射速度 （推荐值：5-10）
   * 4、launch_particles_size 烟花发射粒子大小（推荐值：0-10）
   * 5、explode_particles_resistance 爆炸粒子半径 （推荐值：4-10）
   * 6、explode_debris_num 爆炸粒子个数
   * 7、explode_particles_size 爆炸粒子大小
   * 8、z_index canvas层级
   * @returns {string}
   */
  init:function (dom,options) {
    if (!dom || typeof(dom) !== "string" || document.getElementById(dom) == null){
      console.log("id对象不存在");
    }
    else{
      fireworksField = document.getElementById(dom);
      //配置默认
      opt.frequency = options.frequency || 200;
      opt.launch_speed = options.launch_speed || 12;
      opt.launch_particles_size = options.launch_particles_size || 0;
      opt.explode_debris_num =  Math.random() * 10 + (options.debris_num || 150);
      opt.explode_particles_resistance = options.explode_particles_resistance || 5;
      opt.explode_particles_size = options.explode_particles_resistance || 10;
      SCREEN_WIDTH = options.width || document.body.clientWidth + "px";
      SCREEN_HEIGHT = options.height || document.body.clientHeight+ "px";
      SCREEN_TOP = options.top || '0px';
      SCREEN_BOTTOM = options.bottom || '0px';
      SCREEN_LEFT = options.left || '0px';
      SCREEN_RIGHT = options.right || '0px';
      Z_INDEX = options.zIndex || 100;
      MAX_PARTICLES = opt.explode_debris_num * 10;

      //创建canvas
      canvas = document.createElement('canvas');
      canvas.id = 'fireworksField';
      canvas.style.width = SCREEN_WIDTH;
      canvas.style.height = SCREEN_HEIGHT;
      canvas.style.position = 'absolute';
      canvas.style.top = SCREEN_TOP;
      canvas.style.bottom = SCREEN_BOTTOM;
      canvas.style.left = SCREEN_LEFT;
      canvas.style.right = SCREEN_RIGHT;
      canvas.style.opacity = 1;
      canvas.style.zIndex = Z_INDEX;
      context = canvas.getContext('2d');

      fireworksField.appendChild(canvas);
      //XX毫秒执行一次装弹
      reloadTimer = setInterval(this.reload, opt.frequency);

      loopTimer = setInterval(this.loop, 50);
    }
  },

  reload:function () {
    if (rockets.length < 100) {
      let rocket = new Rocket(Math.random() * SCREEN_WIDTH);
      rocket.explosionColor = Math.floor(Math.random() * 360 / 10) * 10;
      rocket.vel.y = -1 * opt.launch_speed;
      rocket.vel.x = Math.random() * 2 - 1;
      //发射轨迹的大小 0：无轨迹
      rocket.size = opt.launch_particles_size;
      //发射轨迹从发射到爆炸的逐渐放大或缩小指数，呈指数增长
      rocket.shrink = 1.008;
      //发射轨迹的重力
      rocket.gravity = 0.005;
      rockets.push(rocket);
    }
  },

  loop:function () {
    //调整宽高
    if (SCREEN_WIDTH !== window.innerWidth) {
      canvas.width = SCREEN_WIDTH = window.innerWidth;
    }
    if (SCREEN_HEIGHT !== window.innerHeight) {
      canvas.height = SCREEN_HEIGHT = window.innerHeight;
    }
    // clear canvas
    context.fillStyle = "rgba(0, 0, 0, 0.05)";
    context.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    //设置存在的Rockets数组
    let existingRockets = [];

    for (let i = 0; i < rockets.length; i++) {
      //更新渲染
      rockets[i].update();
      rockets[i].render(context);
      // calculate distance with Pythagoras
      let distance = Math.sqrt(Math.pow(SCREEN_WIDTH - rockets[i].pos.x, 2) + Math.pow(SCREEN_HEIGHT - rockets[i].pos.y, 2));
      // random chance of 1% if rockets is above the middle
      let randomChance = rockets[i].pos.y < (SCREEN_HEIGHT * 2 / 3) ? (Math.random() * 100 <= 1) : false;
      /* Explosion rules
       - 80% of screen
       - going down
       - close to the mouse
       - 1% chance of random explosion
       */
      if (rockets[i].pos.y < SCREEN_HEIGHT / 5 || rockets[i].vel.y >= 0 || distance < 50 || randomChance) {
        rockets[i].explode();
      } else {
        existingRockets.push(rockets[i]);
      }
    }
    rockets = existingRockets;
    let existingParticles = [];
    for (let j = 0; j < particles.length; j++) {
      particles[j].update();
      // render and save particles that can be rendered
      if (particles[j].exists()) {
        particles[j].render(context);
        existingParticles.push(particles[j]);
      }
    }
    // update array with existing particles - old particles should be garbage collected
    particles = existingParticles;
    while (particles.length > MAX_PARTICLES) {
      particles.shift();
    }
  },

  start:function () {
    if (reloadTimer){
      clearInterval(reloadTimer);
    }
    if(loopTimer){
      clearInterval(loopTimer);
    }
    reloadTimer = setInterval(this.reload, opt.frequency);
    //XX毫秒执行一次刷新canvas
    loopTimer = setInterval(this.loop, 50);
  },

  stop:function () {
    clearInterval(reloadTimer);
    //20秒后清除loop定时器
    setTimeout(function () {
      clearInterval(loopTimer);
    },20000)
  },
};

