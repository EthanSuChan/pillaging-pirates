console.log(gsap)
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d')
canvas.width = innerWidth
canvas.height = innerHeight
const scoreEl = document.querySelector('#scoreEl')
const startGameBtn = document.querySelector('#startGameBtn')
const modalEl = document.querySelector('#modalEl')
const bigScoreEl = document.querySelector('#bigScoreEl')

const startGameAudio = new Audio('./audio/StartGame.mp3')
const endGameAudio = new Audio('./audio/GameOver.mp3')
const shootAudio = new Audio('./audio/Shoot.mp3')
const enemyHitAudio = new Audio('./audio/HitEnemy.mp3')
const enemyEliminatedAudio = new Audio('./audio/EnemyGone.mp3')
const obtainPowerUpAudio = new Audio('./audio/PowerUp.mp3')
const backgroundMusicAudio = new Audio('./audio/BackgroundMusic.mp3')
backgroundMusicAudio.loop = true

const scene = {
  active: false
}

const playerImg = new Image()
playerImg.src = './img/Player.png'

class Player {
  // dimensions of Player
  constructor(x, y, radius, color) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = {
      x: 0,
      y: 0
    }
    this.friction = 0.99
    this.powerUp = ''
  }
  
  // direction of the movement of Player
  draw() {
    c.beginPath()
    //c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    //c.fillStyle = this.color
    c.drawImage(
      playerImg, 
      this.x - this.radius, 
      this.y - this.radius, 
      this.radius * 2, 
      this.radius * 2
      )
    c.fill()
  }

  // animate
  update() {
    this.draw()
    this.velocity.x *= this.friction
    this.velocity.y *= this.friction

    if (this.x - this.radius + this.velocity.x >0 && this.x + this.radius + this.velocity.x < canvas.width) {
      this.x = this.x + this.velocity.x
    } else {
      this.velocity.x = 0
    }

    if (this.y - this.radius + this.velocity.y >0 && this.y + this.radius + this.velocity.y < canvas.height) {
      this.y = this.y + this.velocity.y
    } else {
      this.velocity.y = 0
    }
  }

  // when Player fires a projectile
  shoot(mouse, color = 'white') {
    const angle = Math.atan2(
      mouse.y - this.y,
      mouse.x - this.x
    )
    const velocity = {
      x: Math.cos(angle) * 4,
      y: Math.sin(angle) * 4
    }

    projectiles.push(new Projectile(this.x, this.y, 5, color, velocity))
    shootAudio.cloneNode().play()
  }
}

class Projectile {
  // dimensions of Particle
  constructor(x, y, radius, color,
    velocity) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
  }

  // direction of movement of Particle
  draw() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
  }

  // animate
  update() {
    this.draw()
    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y
  }
}

//graphic of PowerUp
const powerUpImg = new Image()
powerUpImg.src = './img/lightning.png'

class PowerUp {  
  // dimensions of PowerUp
  constructor(x, y, velocity) {
    this.x = x
    this.y = y
    this.velocity = velocity
    this.width = 14
    this.height = 18
    this.radians = 0
  }

  // direction of movement & rotation of PowerUp
  draw() {
    c.save()
    c.translate(this.x + this.width / 2, this.y + this.height / 2)
    c.rotate(this.radians)
    c.translate(-this.x - this.width / 2, -this.y - this.height / 2)
    c.drawImage(powerUpImg, this.x, this.y, 14, 18 )
    c.restore()
  }

  //animate
  update() {
    this.radians += 0.005
    this.draw()
    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y
  }
}

const enemyImg = new Image()
enemyImg.src = './img/Enemy.png'

class Enemy {
  // dimeansions of Enemy
  constructor(x, y, radius, color,
    velocity) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
    this.type = 'linear'
    this.center = {
      x,
      y
    }
    this.radians = 0

    // type of Enemy
    if(Math.random() > 0.25) {
      this.type = 'homing'

      if (Math.random() < 0.5) {
        this.type = 'spinning'

        if (Math.random() < 0.5) {
          this.type = 'homingSpinning'
        }
      }
    }
  }

  // direction of movement of Enemy 
  draw() {
    c.beginPath()
    //c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.drawImage(
      enemyImg, 
      this.x - this.radius * 1.16, 
      this.y - this.radius, 
      this.radius * 2 * 1.16, 
      this.radius * 2
    )
    c.fill()
  }

  // animate
  update() {
    this.draw()

    // animating linear enemies
    if(this.type === 'linear') {
      this.x = this.x + this.velocity.x
      this.y = this.y + this.velocity.y
      // animating homing enemies
    } else if(this.type === 'homing') {

    const angle = Math.atan2(player.y - this.y, player.x - this.x)

      this.velocity = {
        x: Math.cos(angle),
        y: Math.sin(angle)
      }

      // linear travel
      this.x = this.x + this.velocity.x
      this.y = this.y + this.velocity.y
      //animating spinning enemies
    } else if (this.type === 'spinning') {
      this.radians += 0.05
      this.center.x += this.velocity.x
      this.center.y += this.velocity.y

      this.x = this.center.x + Math.cos(this.radians) * 100
      this.y = this.center.y + Math.sin(this.radians) * 100
      //animating homing and spinning enemies
    } else if(this.type === 'homingSpinning') {
      const angle = Math.atan2(player.y - this.y, player.x - this.x)

      this.velocity = {
        x: Math.cos(angle),
        y: Math.sin(angle)
      }

      // linear travel
      this.x = this.x + this.velocity.x
      this.y = this.y + this.velocity.y

      this.radians += 0.05
      this.center.x += this.velocity.x
      this.center.y += this.velocity.y

      this.x = this.center.x + Math.cos(this.radians) * 100
      this.y = this.center.y + Math.sin(this.radians) * 100
    }


  }
}


const friction = 0.99
class Particle {
  // dimensions of Particle
  constructor(x, y, radius, color,
    velocity) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
    this.alpha = 1
  }

  draw() {
    // direction of movement of a particle
    c.save()
    c.globalAlpha = this.alpha
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
    c.restore()
  }

  update() {
    // animate
    this.draw()
    this.velocity.x *= friction
    this.velocity.y *= friction
    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y
    this.alpha -= 0.01
  }
}

class BackgroundParticle {
  // dimensions of backgroundParticle
  constructor(x, y, radius, color,
    velocity) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.alpha = 0.05
    this.initialAlpha = this.alpha
  }

  draw() {
    // drawing backgroundParticle
    c.save()
    c.globalAlpha = this.alpha
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
    c.restore()
  }

  // animate
  update() {
    this.draw()
    //this.alpha -= 0.01
  }
}

// randomly generated objects would be placed into the list and then taken out after they disappear
let player
let powerUps = []
let projectiles = []
let enemies = []
let particles = []
let backgroundParticles = []
let spawnEnemiesId
let spawnPowerUpsId
let enemiesCounter = 0
let powerUpsCounter = 0

// when the game is started
function init() {
  const x = canvas.width / 2
  const y = canvas.height / 2
  
  player = new Player(x, y, 20, 'white')
  projectiles = []
  powerUps = []
  enemies = []
  particles = []
  backgroundParticles = []
  
  // clears Id of Interval for spawning enemies and powerups
  clearInterval(spawnEnemiesId)
  clearInterval(spawnPowerUpsId)

  enemiesCounter = 0
  powerUpsCounter = 0

  for (let x = 0; x < canvas.width; x += 30) {
    for (let y = 0; y < canvas.height; y += 30) {
      backgroundParticles.push(new BackgroundParticle(x, y, 3, 'blue'))
    }
  }
}

// spawns Enemies at the end of the screen and move them towards the player with a random radius
function spawnEnemies() {
  const spawner = () => {
    const radius = Math.random() * (30 - 10) + 10

    let x
    let y

    if (Math.random() < 0.5 ) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
      y = Math.random() * canvas.height
    } else {
      x = Math.random() * canvas.width
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
    }

    const color = `hsl(${Math.random() * 360}, 50%, 50%)`    
    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x)
    
    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle)
    }

    // clears interval and replaces it with a new interval of a higher frequency
    enemies.push(new Enemy(x, y, radius, color, velocity))
    // amount of enemies generated ever in the game
    enemiesCounter++
    // increase the frequency of enemies generated to 2.5s after 10 enemies generated
    if (enemiesCounter === 10) {
      clearInterval(spawnEnemiesId)
      spawnEnemiesId = setInterval(spawner, 2500)
    // increase the frequency of enemies generated to 2s after 20 enemies generated
    } else if (enemiesCounter === 20) {
      clearInterval(spawnEnemiesId)
      spawnEnemiesId = setInterval(spawner, 2000)
    // increase the frequency of enemies generated to 1.5s after 30 enemies generated
    } else if (enemiesCounter === 30) {
      clearInterval(spawnEnemiesId)
      spawnEnemiesId = setInterval(spawner, 1500)
    // increase the frequency of enemies generated t 1s after 40 enemies generated
    } else if (enemiesCounter === 40) {
      clearInterval(spawnEnemiesId)
      spawnEnemiesId = setInterval(spawner, 1000)
    }
  }

  clearInterval(spawnEnemiesId)
  // Interval gives Id to spawnEnemiesId (to clear)
  spawnEnemiesId = setInterval(spawner, 3000)
}

const projectile = new Projectile( 
  canvas.width / 2, 
  canvas.height / 2,
  5,
  'red',
  {
    x: 1,
    y: 1
  }
)

// spawn PowerUps randomly from the edge of the screen
function spawnPowerUps() {
  const spawner = () => {

    let x
    let y

    if (Math.random() < 0.5 ) {
      x = Math.random() < 0.5 ? 0 - 7 : canvas.width + 7
      y = Math.random() * canvas.height
    } else {
      x = Math.random() * canvas.width
      y = Math.random() < 0.5 ? 0 - 9 : canvas.height + 9
    }
    
    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x)
    
    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle)
    }

    // generates new powerUps
    powerUps.push(new PowerUp(x, y, velocity))
    //counts the number of powerups generated ever
    powerUpsCounter++

    // Decreases the frequency of power ups generated to 2.5s after 20 power ups generated
    if (powerUpsCounter === 20) {
      clearInterval(spawnPowerUpsId)
      spawnPowerUpsId = setInterval(spawner, 2500)
    // Decreases the frequency of power ups generated to 3s after 40 power ups generated
    } else if (powerUpsCounter === 40) {
      clearInterval(spawnPowerUpsId)
      spawnPowerUpsId = setInterval(spawner, 3000)
      // Decreases the frequency of power ups generated to 3.5s after 60 power ups generated
    } else if (powerUpsCounter === 60) {
      clearInterval(spawnPowerUpsId)
      spawnPowerUpsId = setInterval(spawner, 3500)
      // Decreases the frequency of power ups generated to 4s after 80 power ups generated
    } else if (powerUpsCounter === 80) {
      clearInterval(spawnPowerUpsId)
      spawnPowerUpsId = setInterval(spawner, 4000)
      // Decreases the frequency of power ups generated to 4.5s after 100 power ups generated
    } else if (powerUpsCounter === 100) {
      clearInterval(spawnPowerUpsId)
      spawnPowerUpsId = setInterval(spawner, 4500)
      // Decreases the frequency of power ups generated to 5s after 120 power ups generated
    } else if (powerUpsCounter === 120) {
      clearInterval(spawnPowerUpsId)
      spawnPowerUpsId = setInterval(spawner, 5000)
    } 
  }

  // Interval gives Id to spawnPowerUpsId (to clear)
  clearInterval(spawnPowerUpsId)
  // creates another spawner that spawns enemies every 2s
  spawnPowerUpsId = setInterval(spawner, 2000)
}

// Score a the start of the screen
function createScoreLabel(projectile, score) {
  const scoreLabel = document.createElement('label')
  scoreLabel.innerHTML = score
  scoreLabel.style.position = 'absolute'
  scoreLabel.style.color = 'white'
  scoreLabel.style.userSelect = 'none'
  scoreLabel.style.left = projectile.x
  scoreLabel.style.top = projectile.y
  document.body.appendChild(scoreLabel)

  gsap.to(scoreLabel, {
    opacity: 0,
    y: -30,
    duration: 1,
    onComplete: () => {
      scoreLabel.parentNode.removeChild(scoreLabel)
    }
  })
}

// start of the game
let animationId
let score = 0
let frame = 0
function animate() {
  animationId = requestAnimationFrame(animate)
  frame++
  c.fillStyle = 'rgba(0, 0, 0, 0.1)'
  c.fillRect(0, 0, canvas.width, canvas.height)

  // Every 200 frames spawn Enemy
  //if (frame % 200 === 0) {
    //spawnEnemies()
  //}

  // distance away from Player
  backgroundParticles.forEach((backgroundParticle) => {
    const dist = Math.hypot(
      player.x - backgroundParticle.x, 
      player.y - backgroundParticle.y
    )
    
    const hideRadius = 100
    if (dist < hideRadius) {
      if (dist < 70) {
        backgroundParticle.alpha = 0
      } else {
        backgroundParticle.alpha = 0.5
      }
    } else if (dist >= hideRadius && backgroundParticle.alpha < backgroundParticle.initialAlpha) {
      backgroundParticle.alpha += 0.01
    } else if (dist >= hideRadius && backgroundParticle.alpha > backgroundParticle.initialAlpha) {
      backgroundParticle.alpha -= 0.01
    }

    backgroundParticle.update()
  })
  // removes particles once transparecy = 0
  player.update()
  particles.forEach((particle, index) => {
    if (particle.alpha <= 0){
      particles.splice(index, 1)
    } else{
      particle.update()
    }
  })

  //shoots bullets at higher frequency when acquired powerUp
  if (player.powerUp === 'Automatic' && mouse.down) {
    if (frame % 5 === 0) {
      player.shoot(mouse, '#FFF500')
    }
  }

  powerUps.forEach((powerUp, index) => {
    const dist = Math.hypot(player.x - powerUp.x, player.y - powerUp.y)

    // gain the automatic shooting ability + obtain power up
    if (dist - player.radius - powerUp.width / 2 < 1) {
      player.color = '#FFF500'
      player.powerUp = 'Automatic'
      powerUps.splice(index, 1)

      obtainPowerUpAudio.cloneNode().play()

      // duration of PowerUp
      setTimeout(() => {
        player.powerUp = 
        player.color = '#FFFFFF'
      }, 5000)
    } else {
      powerUp.update()
    }
  })

  projectiles.forEach((projectile, index) => {
    projectile.update()

    // projectile removed from array if not on screen
    if(
      projectile.x - projectile.radius < 0 ||
      projectile.x - projectile.radius > canvas.width ||
      projectile.y + projectile.radius < 0 ||
      projectile.y - projectile.radius > canvas.height) {
      setTimeout(() => {
          projectiles.splice(index, 1)
        },0)
    }
  })

  enemies.forEach((enemy, index) => {
    enemy.update()

    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y) 
    // end game
    if (dist - enemy.radius - player.radius < 1) {
      cancelAnimationFrame(animationId)
      modalEl.style.display = 'flex'
      bigScoreEl.innerHTML = score
      endGameAudio.play()
      scene.active = false

      gsap.to('#whiteModalEl',{
        opacity: 1,
        scale: 1,
        duration: 0.5,
        ease: 'expo',
      })
    }


    projectiles.forEach((projectile, projectileIndex) => {
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y) 
      // when projectiles touch an enemy
      if (dist - enemy.radius - projectile.radius < 1) {
        //create explosions
        for (let i = 0; i < enemy.radius * 2; i++) {
          particles.push(
            new Particle(
              projectile.x, 
              projectile.y, 
              Math.random() * 2, 
              enemy.color, 
              {
                x: (Math.random() - 0.5) * (Math.random() * 5),
                y: (Math.random() - 0.5) * (Math.random() * 5)
              }
            )
          )
        }


        // shrink enemy
        if (enemy.radius - 10 > 5) {
          enemyHitAudio.cloneNode().play()
          // increase our score + make enemy smaller
          score += 100
          scoreEl.innerHTML = score 

          createScoreLabel(projectile, 100)

          gsap.to(enemy,{
            radius: enemy.radius - 10
          })

          setTimeout(() => {
            projectiles.splice(projectileIndex, 1)
          }, 0)
        } else {
          // makes enemy disappear

          enemyEliminatedAudio.cloneNode().play()
          score += 250
          scoreEl.innerHTML = score
          createScoreLabel(projectile, 250)

          // change backgroundParticle colors
          backgroundParticles.forEach((backgroundParticle) => {
            backgroundParticle.color = enemy.color
            gsap.to(backgroundParticle, {
              alpha: 0.75,
              duration: 0.015,
              onComplete: () => {
                gsap.to(backgroundParticle, {
                  alpha: backgroundParticle.initialAlpha,
                  duration: 0.03
                })
              }
            })
          })

          setTimeout(() => {
            enemies.splice(index, 1)
            projectiles.splice(projectileIndex, 1)
          },0)
        }
      }
    })
  })
}

// for pc
const mouse = {
  down: false,
  x: undefined,
  y: undefined
}
addEventListener('mousedown',({ clientX, clientY }) => {
  mouse.x = clientX
  mouse.y = clientY
  mouse.down = true
})

addEventListener('mousemove',({ clientX, clientY }) => {
  mouse.x = clientX
  mouse.y = clientY
})

addEventListener('mouseup',() => {
  mouse.down = false
})

// for mobile
addEventListener('touchstart', (event) => {
  mouse.x = event.touches[0].clientX
  mouse.y = event.touches[0].clientY
  mouse.down = true
})

addEventListener('touchmove', (event) => {
  mouse.x = event.touches[0].clientX
  mouse.y = event.touches[0].clientY
})

addEventListener('touchend', () => {
  mouse.down = false
})

// shoot when click
addEventListener('click', ({ clientX, clientY }) => {
  if (scene.active) {
    mouse.x = clientX
    mouse.y = clientY
    player.shoot(mouse)
  }
})

// reset everything
addEventListener('resize', () => {
  canvas.width = innerWidth
  canvas.height = innerHeight
  init()
})

startGameBtn.addEventListener('click', () => {
  init()
  animate()
  spawnEnemies()
  spawnPowerUps()
  startGameAudio.play()
  scene.active = true
  score = 0
  scoreEl.innerHTML = 0
  bigScoreEl.innerHTML = 0
  backgroundMusicAudio.play()

  gsap.to('#whiteModalEl',{
    opacity: 0,
    scale: 0.75,
    duration: 0.25,
    ease: 'expo.in',
    onComplete: () => {
      modalEl.style.display = 'none'
    }
  })
})

// WASD to move
addEventListener('keydown',({keyCode}) => { 
  if (keyCode === 87) {
    console.log('up')
    player.velocity.y -= 1
  } else if (keyCode === 65) {
    console.log('left')
    player.velocity.x -= 1
  } else if (keyCode === 83) {
    console.log('down')
    player.velocity.y += 1
  } else if (keyCode === 68) {
    console.log('right')
    player.velocity.x += 1
  }

  // arrow keys to move
  switch (keyCode) {
    case 38:
      player.velocity.y -= 1
      break

    case 37:
      player.velocity.x -= 1
      break
  
    case 40:
      player.velocity.y += 1
      break
 
    case 39:
      player.velocity.x += 1
      break   
  }
})