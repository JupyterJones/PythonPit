(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e={AIR:0,DIRT:1,BASALT:2,MAGMA:3,CRYSTAL_LITHIUM:4,CRYSTAL_EMERALD:5,POWER_CELL:6,DROP_POD:7,BEDROCK:8,TITANIUM_ARMOR:9},t=class{constructor(e){this.level=e,this.cols=e.cols||10,this.rows=e.rows||14,this.grid=[],this.rover={x:0,y:0,dir:`DOWN`,battery:100,maxBattery:100,cargo:[],systems:{torque:40,shield:100},drilling:!1,scanning:!1,scanDir:null},this.history=[],this.initFromLevel(e)}initFromLevel(t){this.level=t,this.cols=t.cols||10,this.rows=t.rows||14,this.grid=[];for(let n=0;n<this.rows;n++){let r=[];for(let i=0;i<this.cols;i++)r.push(t.map[n]?t.map[n][i]:e.DIRT);this.grid.push(r)}this.rover.x=t.spawn.x,this.rover.y=t.spawn.y,this.rover.dir=t.spawn.dir||`DOWN`,this.rover.battery=100,this.rover.cargo=[],this.rover.systems={torque:40,shield:100},this.rover.drilling=!1,this.rover.scanning=!1,this.rover.scanDir=null,this.history=[]}getTile(t,n){return t<0||t>=this.cols||n<0||n>=this.rows?e.BEDROCK:this.grid[n][t]}setTile(e,t,n){e>=0&&e<this.cols&&t>=0&&t<this.rows&&(this.grid[t][e]=n)}getFrontCoords(e=this.rover.dir){let t=0,n=0;return e===`DOWN`?n=1:e===`UP`?n=-1:e===`RIGHT`?t=1:e===`LEFT`&&(t=-1),{x:this.rover.x+t,y:this.rover.y+n}}canMoveTo(t,n){let r=this.getTile(t,n);return r===e.AIR||r===e.CRYSTAL_LITHIUM||r===e.CRYSTAL_EMERALD||r===e.POWER_CELL||r===e.DROP_POD}getDepthMeters(){return Math.max(0,this.rover.y*50)}checkObjectives(){return!this.level||!this.level.checkWin?!1:this.level.checkWin(this)}},n=class{constructor(e){this.canvas=e,this.ctx=e.getContext(`2d`),this.tileSize=64,this.cameraY=0,this.particles=[],this.time=0,this.visualRover={x:0,y:0,dir:`DOWN`,drillAnim:0,scanAnim:0,treadAnim:0}}resize(){let e=this.canvas.parentElement.getBoundingClientRect();this.canvas.width=e.width,this.canvas.height=e.height}syncRoverPosition(e,t=!1){t&&(this.visualRover.x=e.x,this.visualRover.y=e.y,this.visualRover.dir=e.dir)}addSparks(e,t,n=8,r=`#ffd700`){for(let i=0;i<n;i++){let n=Math.random()*Math.PI*2,i=1+Math.random()*4;this.particles.push({x:e,y:t,vx:Math.cos(n)*i,vy:Math.sin(n)*i,color:r,size:2+Math.random()*2,life:1,decay:.04+Math.random()*.05})}}addRockFragments(e,t,n=10,r=`#795548`){for(let i=0;i<n;i++){let n=Math.random()*Math.PI*2,i=1.5+Math.random()*3.5;this.particles.push({x:e,y:t,vx:Math.cos(n)*i,vy:Math.sin(n)*i+.5,color:r,size:3+Math.random()*4,rot:Math.random()*Math.PI,vrot:(Math.random()-.5)*.3,life:1,decay:.03+Math.random()*.03})}}update(e,t){this.time+=e;let n=.2;if(this.visualRover.x+=(t.rover.x-this.visualRover.x)*n,this.visualRover.y+=(t.rover.y-this.visualRover.y)*n,this.visualRover.dir=t.rover.dir,t.rover.drilling){this.visualRover.drillAnim=(this.visualRover.drillAnim+.5)%(Math.PI*2);let e=this.getDrillWorldCoords(this.visualRover.x,this.visualRover.y,this.visualRover.dir);this.addSparks(e.x,e.y,2,`#00ffff`),this.addRockFragments(e.x,e.y,1,`#a1887f`)}else this.visualRover.drillAnim=0;t.rover.scanning?this.visualRover.scanAnim=Math.min(1,this.visualRover.scanAnim+e*3):this.visualRover.scanAnim=0;let r=this.visualRover.y*this.tileSize-this.canvas.height*.45;this.cameraY+=(r-this.cameraY)*.1;for(let e=this.particles.length-1;e>=0;e--){let t=this.particles[e];t.x+=t.vx,t.y+=t.vy,t.life-=t.decay,t.vrot&&(t.rot+=t.vrot),t.life<=0&&this.particles.splice(e,1)}}getDrillWorldCoords(e,t,n){let r=(e+.5)*this.tileSize,i=(t+.5)*this.tileSize,a=this.tileSize*.45;return n===`DOWN`?{x:r,y:i+a}:n===`UP`?{x:r,y:i-a}:n===`RIGHT`?{x:r+a,y:i}:n===`LEFT`?{x:r-a,y:i}:{x:r,y:i+a}}render(e){let t=this.ctx,n=this.canvas.width,r=this.canvas.height;t.fillStyle=`#0a0d14`,t.fillRect(0,0,n,r);let i=e.cols*this.tileSize,a=Math.max(20,Math.floor((n-i)/2)),o=-Math.floor(this.cameraY);t.save(),t.translate(a,o),this.drawDepthGauge(t,e);for(let n=0;n<e.rows;n++)for(let r=0;r<e.cols;r++){let i=e.grid[n][r],a=r*this.tileSize,o=n*this.tileSize;this.drawTile(t,i,a,o,r,n)}this.visualRover.scanAnim>0&&this.drawScanWave(t,e),this.drawRover(t,this.visualRover),this.drawParticles(t),t.restore(),this.drawAtmosphereOverlay(t,n,r)}drawTile(t,n,r,i,a,o){let s=this.tileSize;if(n===e.AIR){t.fillStyle=`#111622`,t.fillRect(r,i,s,s),t.strokeStyle=`#182030`,t.lineWidth=1,t.strokeRect(r,i,s,s);return}if(n===e.DIRT){t.fillStyle=`#3e2723`,t.fillRect(r,i,s,s),t.fillStyle=`#4e342e`,t.fillRect(r+2,i+2,s-4,s-4),t.fillStyle=`#6d4c41`,t.fillRect(r+12,i+14,6,6),t.fillRect(r+36,i+28,8,5),t.fillRect(r+20,i+44,7,7),t.strokeStyle=`#271916`,t.lineWidth=1,t.strokeRect(r,i,s,s);return}if(n===e.BASALT){t.fillStyle=`#263238`,t.fillRect(r,i,s,s),t.fillStyle=`#37474f`,t.fillRect(r+4,i+4,s-8,s-8),t.strokeStyle=`#1b2327`,t.lineWidth=2,t.beginPath(),t.moveTo(r+8,i+12),t.lineTo(r+24,i+32),t.lineTo(r+50,i+26),t.stroke(),t.strokeStyle=`#161d20`,t.lineWidth=1,t.strokeRect(r,i,s,s);return}if(n===e.MAGMA){let e=.5+.5*Math.sin(this.time*4+a*2);t.fillStyle=`#b71c1c`,t.fillRect(r,i,s,s);let n=t.createRadialGradient(r+s/2,i+s/2,5,r+s/2,i+s/2,s/1.8);n.addColorStop(0,`#ffff00`),n.addColorStop(.4,`#ff5722`),n.addColorStop(1,`#d50000`),t.fillStyle=n,t.fillRect(r+3,i+3,s-6,s-6),t.fillStyle=`rgba(255, 255, 200, ${.4+e*.4})`,t.beginPath(),t.arc(r+20+Math.sin(this.time*3)*6,i+24,7,0,Math.PI*2),t.arc(r+42+Math.cos(this.time*2.5)*5,i+40,9,0,Math.PI*2),t.fill(),t.strokeStyle=`#ff9100`,t.lineWidth=2,t.strokeRect(r+1,i+1,s-2,s-2);return}if(n===e.CRYSTAL_LITHIUM){t.fillStyle=`#111622`,t.fillRect(r,i,s,s);let e=r+s/2,n=i+s/2,o=Math.sin(this.time*5+a)*.2+.8;t.shadowColor=`#00ffff`,t.shadowBlur=12*o,t.fillStyle=`#00e5ff`,t.beginPath(),t.moveTo(e,n-20),t.lineTo(e+14,n-4),t.lineTo(e+8,n+18),t.lineTo(e-8,n+18),t.lineTo(e-14,n-4),t.closePath(),t.fill(),t.fillStyle=`#ffffff`,t.beginPath(),t.moveTo(e,n-20),t.lineTo(e+4,n-4),t.lineTo(e,n),t.lineTo(e-10,n-4),t.closePath(),t.fill(),t.shadowBlur=0;return}if(n===e.CRYSTAL_EMERALD){t.fillStyle=`#111622`,t.fillRect(r,i,s,s);let e=r+s/2,n=i+s/2,a=Math.sin(this.time*6+o)*.2+.8;t.shadowColor=`#00e676`,t.shadowBlur=14*a,t.fillStyle=`#00c853`,t.beginPath(),t.moveTo(e-16,n-10),t.lineTo(e,n-22),t.lineTo(e+16,n-10),t.lineTo(e+16,n+10),t.lineTo(e,n+22),t.lineTo(e-16,n+10),t.closePath(),t.fill(),t.fillStyle=`#b9f6ca`,t.beginPath(),t.moveTo(e,n-22),t.lineTo(e+16,n-10),t.lineTo(e,n),t.closePath(),t.fill(),t.shadowBlur=0;return}if(n===e.POWER_CELL){t.fillStyle=`#111622`,t.fillRect(r,i,s,s);let e=r+s/2,n=i+s/2;t.fillStyle=`#37474f`,t.fillRect(e-14,n-20,28,40),t.fillStyle=`#ffb300`,t.shadowColor=`#ffb300`,t.shadowBlur=10,t.fillRect(e-10,n-14,20,28),t.shadowBlur=0,t.fillStyle=`#ffffff`,t.beginPath(),t.moveTo(e,n-10),t.lineTo(e-5,n),t.lineTo(e+1,n),t.lineTo(e-2,n+10),t.lineTo(e+5,n-1),t.lineTo(e-1,n-1),t.closePath(),t.fill();return}if(n===e.DROP_POD){t.fillStyle=`#263238`,t.fillRect(r,i,s,s),t.fillStyle=`#ffc107`,t.fillRect(r+4,i+4,s-8,s-8),t.fillStyle=`#212121`;for(let e=0;e<4;e++)t.beginPath(),t.moveTo(r+8+e*14,i+4),t.lineTo(r+16+e*14,i+4),t.lineTo(r+8+e*14,i+s-4),t.lineTo(r+e*14,i+s-4),t.closePath(),t.fill();let e=.5+.5*Math.sin(this.time*8);t.shadowColor=`#00e5ff`,t.shadowBlur=15*e,t.fillStyle=`#00e5ff`,t.beginPath(),t.arc(r+s/2,i+s/2,8,0,Math.PI*2),t.fill(),t.shadowBlur=0;return}if(n===e.TITANIUM_ARMOR){t.fillStyle=`#455a64`,t.fillRect(r,i,s,s),t.fillStyle=`#546e7a`,t.fillRect(r+4,i+4,s-8,s-8),t.fillStyle=`#cfd8dc`,t.fillRect(r+8,i+8,4,4),t.fillRect(r+s-12,i+8,4,4),t.fillRect(r+8,i+s-12,4,4),t.fillRect(r+s-12,i+s-12,4,4),t.fillStyle=`#ff3d00`,t.beginPath(),t.moveTo(r+s/2,i+18),t.lineTo(r+s/2+14,i+s-18),t.lineTo(r+s/2-14,i+s-18),t.closePath(),t.fill();return}if(n===e.BEDROCK){t.fillStyle=`#1a1f2c`,t.fillRect(r,i,s,s),t.strokeStyle=`#2d3748`,t.lineWidth=2,t.strokeRect(r,i,s,s);return}}drawRover(e,t){let n=this.tileSize,r=(t.x+.5)*n,i=(t.y+.5)*n;e.save(),e.translate(r,i);let a=0;t.dir===`DOWN`?a=0:t.dir===`UP`?a=Math.PI:t.dir===`RIGHT`?a=-Math.PI/2:t.dir===`LEFT`&&(a=Math.PI/2),e.rotate(a);let o=e.createRadialGradient(0,20,10,0,70,75);o.addColorStop(0,`rgba(0, 229, 255, 0.45)`),o.addColorStop(1,`rgba(0, 229, 255, 0.0)`),e.fillStyle=o,e.beginPath(),e.moveTo(-16,20),e.lineTo(-40,90),e.lineTo(40,90),e.lineTo(16,20),e.closePath(),e.fill(),e.fillStyle=`#1e2430`,e.fillRect(-26,-24,10,48),e.fillRect(16,-24,10,48),e.fillStyle=`#374151`;for(let t=-20;t<=20;t+=8)e.fillRect(-26,t,10,2),e.fillRect(16,t,10,2);e.fillStyle=`#0f172a`,e.strokeStyle=`#00e5ff`,e.lineWidth=2,this.roundRect(e,-18,-20,36,40,6,!0,!0),e.fillStyle=`#0284c7`,e.beginPath(),e.ellipse(0,-4,10,8,0,0,Math.PI*2),e.fill(),e.fillStyle=`#38bdf8`,e.fillRect(-6,-7,6,3);let s=Math.sin(t.drillAnim*4)*3;e.fillStyle=`#475569`,e.fillRect(-8,16,16,8+s),e.fillStyle=`#00ffff`,e.shadowColor=`#00ffff`,e.shadowBlur=t.drillAnim>0?12:0,e.beginPath(),e.moveTo(0,28+s),e.lineTo(-10,18+s),e.lineTo(10,18+s),e.closePath(),e.fill(),e.shadowBlur=0,e.fillStyle=`#38bdf8`,e.beginPath(),e.arc(0,6,4,0,Math.PI*2),e.fill(),e.restore()}drawScanWave(e,t){let n=this.tileSize,r=(t.rover.x+.5)*n,i=(t.rover.y+.5)*n,a=this.visualRover.scanAnim*n*1.8;e.save(),e.strokeStyle=`rgba(0, 229, 255, ${1-this.visualRover.scanAnim})`,e.lineWidth=3,e.beginPath(),e.arc(r,i,a,0,Math.PI*2),e.stroke(),e.restore()}drawParticles(e){for(let t of this.particles)e.save(),e.globalAlpha=Math.max(0,t.life),e.fillStyle=t.color,e.translate(t.x,t.y),t.rot&&e.rotate(t.rot),e.fillRect(-t.size/2,-t.size/2,t.size,t.size),e.restore()}drawDepthGauge(e,t){let n=this.tileSize;e.fillStyle=`#4b5563`,e.font=`10px "Fira Code", monospace`,e.textAlign=`right`;for(let r=0;r<t.rows;r++){let t=r*50;e.fillText(`-${t}m`,-8,r*n+n/2+4)}}drawAtmosphereOverlay(e,t,n){let r=e.createRadialGradient(t/2,n/2,n*.35,t/2,n/2,n*.85);r.addColorStop(0,`rgba(0, 0, 0, 0)`),r.addColorStop(1,`rgba(5, 8, 14, 0.7)`),e.fillStyle=r,e.fillRect(0,0,t,n)}roundRect(e,t,n,r,i,a,o,s){e.beginPath(),e.moveTo(t+a,n),e.lineTo(t+r-a,n),e.quadraticCurveTo(t+r,n,t+r,n+a),e.lineTo(t+r,n+i-a),e.quadraticCurveTo(t+r,n+i,t+r-a,n+i),e.lineTo(t+a,n+i),e.quadraticCurveTo(t,n+i,t,n+i-a),e.lineTo(t,n+a),e.quadraticCurveTo(t,n,t+a,n),e.closePath(),o&&e.fill(),s&&e.stroke()}},r=new class{constructor(){this.ctx=null,this.muted=!1,this.initialized=!1}init(){if(!this.initialized)try{let e=window.AudioContext||window.webkitAudioContext;e&&(this.ctx=new e,this.initialized=!0)}catch(e){console.warn(`Web Audio not supported or blocked`,e)}}ensureContext(){this.initialized||this.init(),this.ctx&&this.ctx.state===`suspended`&&this.ctx.resume()}toggleMute(){return this.muted=!this.muted,this.muted}playDrill(){if(this.muted||(this.ensureContext(),!this.ctx))return;let e=this.ctx.currentTime,t=this.ctx.createOscillator(),n=this.ctx.createGain(),r=this.ctx.createBiquadFilter();t.type=`sawtooth`,t.frequency.setValueAtTime(110,e),t.frequency.exponentialRampToValueAtTime(75,e+.25),r.type=`bandpass`,r.frequency.setValueAtTime(600,e),r.Q.setValueAtTime(3,e),n.gain.setValueAtTime(.18,e),n.gain.exponentialRampToValueAtTime(.001,e+.28),t.connect(r),r.connect(n),n.connect(this.ctx.destination),t.start(e),t.stop(e+.3);let i=this.ctx.sampleRate*.25,a=this.ctx.createBuffer(1,i,this.ctx.sampleRate),o=a.getChannelData(0);for(let e=0;e<i;e++)o[e]=(Math.random()*2-1)*Math.exp(-e/(i*.5));let s=this.ctx.createBufferSource();s.buffer=a;let c=this.ctx.createBiquadFilter();c.type=`lowpass`,c.frequency.setValueAtTime(900,e);let l=this.ctx.createGain();l.gain.setValueAtTime(.12,e),l.gain.exponentialRampToValueAtTime(.001,e+.25),s.connect(c),c.connect(l),l.connect(this.ctx.destination),s.start(e),s.stop(e+.25)}playMove(){if(this.muted||(this.ensureContext(),!this.ctx))return;let e=this.ctx.currentTime,t=this.ctx.createOscillator(),n=this.ctx.createGain();t.type=`triangle`,t.frequency.setValueAtTime(95,e),t.frequency.exponentialRampToValueAtTime(60,e+.15),n.gain.setValueAtTime(.12,e),n.gain.exponentialRampToValueAtTime(.001,e+.16),t.connect(n),n.connect(this.ctx.destination),t.start(e),t.stop(e+.16)}playScan(){if(this.muted||(this.ensureContext(),!this.ctx))return;let e=this.ctx.currentTime,t=this.ctx.createOscillator(),n=this.ctx.createGain();t.type=`sine`,t.frequency.setValueAtTime(700,e),t.frequency.exponentialRampToValueAtTime(1400,e+.12),n.gain.setValueAtTime(.15,e),n.gain.exponentialRampToValueAtTime(.001,e+.35),t.connect(n),n.connect(this.ctx.destination),t.start(e),t.stop(e+.36)}playCollect(){if(this.muted||(this.ensureContext(),!this.ctx))return;let e=[523.25,659.25,783.99,1046.5],t=this.ctx.currentTime;e.forEach((e,n)=>{let r=this.ctx.createOscillator(),i=this.ctx.createGain();r.type=`sine`,r.frequency.setValueAtTime(e,t+n*.05),i.gain.setValueAtTime(0,t+n*.05),i.gain.linearRampToValueAtTime(.12,t+n*.05+.01),i.gain.exponentialRampToValueAtTime(.001,t+n*.05+.35),r.connect(i),i.connect(this.ctx.destination),r.start(t+n*.05),r.stop(t+n*.05+.36)})}playHazard(){if(this.muted||(this.ensureContext(),!this.ctx))return;let e=this.ctx.currentTime,t=this.ctx.createOscillator(),n=this.ctx.createGain();t.type=`sawtooth`,t.frequency.setValueAtTime(220,e),t.frequency.linearRampToValueAtTime(150,e+.1),t.frequency.linearRampToValueAtTime(220,e+.2),n.gain.setValueAtTime(.2,e),n.gain.exponentialRampToValueAtTime(.001,e+.3),t.connect(n),n.connect(this.ctx.destination),t.start(e),t.stop(e+.32)}playVictory(){if(this.muted||(this.ensureContext(),!this.ctx))return;let e=[{f:440,delay:0},{f:554.37,delay:.1},{f:659.25,delay:.2},{f:880,delay:.32},{f:1108.73,delay:.46}],t=this.ctx.currentTime;e.forEach(({f:e,delay:n})=>{let r=this.ctx.createOscillator(),i=this.ctx.createGain();r.type=`triangle`,r.frequency.setValueAtTime(e,t+n),i.gain.setValueAtTime(.18,t+n),i.gain.exponentialRampToValueAtTime(.001,t+n+.6),r.connect(i),i.connect(this.ctx.destination),r.start(t+n),r.stop(t+n+.65)})}playClick(){if(this.muted||(this.ensureContext(),!this.ctx))return;let e=this.ctx.currentTime,t=this.ctx.createOscillator(),n=this.ctx.createGain();t.type=`sine`,t.frequency.setValueAtTime(900,e),t.frequency.exponentialRampToValueAtTime(300,e+.03),n.gain.setValueAtTime(.08,e),n.gain.exponentialRampToValueAtTime(.001,e+.035),t.connect(n),n.connect(this.ctx.destination),t.start(e),t.stop(e+.04)}playError(){if(this.muted||(this.ensureContext(),!this.ctx))return;let e=this.ctx.currentTime,t=this.ctx.createOscillator(),n=this.ctx.createGain();t.type=`sawtooth`,t.frequency.setValueAtTime(140,e),t.frequency.linearRampToValueAtTime(90,e+.2),n.gain.setValueAtTime(.2,e),n.gain.exponentialRampToValueAtTime(.001,e+.25),t.connect(n),n.connect(this.ctx.destination),t.start(e),t.stop(e+.26)}},i=class{constructor(e){this.pyodide=null,this.isLoading=!1,this.isReady=!1,this.loadError=null,this.onStatusChange=e||(()=>{})}async init(){if(!(this.isReady||this.isLoading)){this.isLoading=!0,this.onStatusChange(`LOADING`,`Downloading CPython 3.11 WebAssembly...`);try{window.loadPyodide||await new Promise((e,t)=>{let n=document.createElement(`script`);n.src=`https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js`,n.onload=e,n.onerror=()=>t(Error(`Failed to load Pyodide CDN`)),document.head.appendChild(n)}),this.pyodide=await window.loadPyodide({indexURL:`https://cdn.jsdelivr.net/pyodide/v0.26.2/full/`}),this.isReady=!0,this.isLoading=!1,this.onStatusChange(`READY`,`CPython 3.11 WASM Engine Active`),console.log(`Pyodide CPython 3.11 WASM loaded successfully.`)}catch(e){console.warn(`Pyodide CDN load failed or offline, using built-in Python mini-interpreter fallback:`,e),this.loadError=e,this.isLoading=!1,this.isReady=!1,this.onStatusChange(`FALLBACK`,`Offline Python Mini-Interpreter Ready`)}}}async execute(t,n){let r=[],i=[],a={[e.AIR]:`AIR`,[e.DIRT]:`DIRT`,[e.BASALT]:`BASALT`,[e.MAGMA]:`MAGMA`,[e.CRYSTAL_LITHIUM]:`LITHIUM`,[e.CRYSTAL_EMERALD]:`EMERALD`,[e.POWER_CELL]:`POWER_CELL`,[e.DROP_POD]:`DROP_POD`,[e.BEDROCK]:`BEDROCK`,[e.TITANIUM_ARMOR]:`TITANIUM_ARMOR`};return this.isReady&&this.pyodide?this.runWithPyodide(t,n,r,i,a):this.runWithFallback(t,n,r,i,a)}async runWithPyodide(t,n,r,i,a){let o=n.grid.map(e=>[...e]),s=n.rover.x,c=n.rover.y,l=n.rover.dir,u=[...n.rover.cargo],d={...n.rover.systems},f=n.rover.battery,p=0;window.pyBridge={print:e=>{i.push(String(e))},setTorque:e=>{d.torque=Number(e)||40},collectTile:()=>{let t=o[c][s],r=s,i=c;if(t!==e.CRYSTAL_EMERALD&&t!==e.CRYSTAL_LITHIUM&&t!==e.POWER_CELL){let a=s,u=c;if(l===`DOWN`?u++:l===`UP`?u--:l===`RIGHT`?a++:l===`LEFT`&&a--,a>=0&&a<n.cols&&u>=0&&u<n.rows){let n=o[u][a];(n===e.CRYSTAL_EMERALD||n===e.CRYSTAL_LITHIUM||n===e.POWER_CELL)&&(t=n,r=a,i=u)}}return t===e.CRYSTAL_EMERALD?(u.push(`Emerald Geode`),o[i][r]=e.AIR,`Emerald Geode`):t===e.CRYSTAL_LITHIUM?(u.push(`Lithium Core`),o[i][r]=e.AIR,`Lithium Core`):t===e.POWER_CELL?(f=Math.min(100,f+50),o[i][r]=e.AIR,`Power Cell`):``},recordAction:(t,i,a)=>{if(++p>600)throw Error(`Execution limit exceeded (possible infinite loop)`);if(t===`move_down`)l=`DOWN`,c+1<n.rows&&c++;else if(t===`move_up`)l=`UP`,c-1>=0&&c--;else if(t===`move_left`)l=`LEFT`,s-1>=0&&s--;else if(t===`move_right`)l=`RIGHT`,s+1<n.cols&&s++;else if(t.startsWith(`turn_`))l=t.replace(`turn_`,``).toUpperCase();else if(t===`drill`){let t=s,r=c;if(l===`DOWN`?r++:l===`UP`?r--:l===`RIGHT`?t++:l===`LEFT`&&t--,t>=0&&t<n.cols&&r>=0&&r<n.rows){let n=o[r][t];n===e.TITANIUM_ARMOR&&d.torque<80?a=`bounced`:n===e.CRYSTAL_EMERALD?(u.push(`Emerald Geode`),o[r][t]=e.AIR,a=`harvested_emerald`):n===e.CRYSTAL_LITHIUM?(u.push(`Lithium Core`),o[r][t]=e.AIR,a=`harvested_lithium`):o[r][t]=e.AIR}}r.push({action:t,lineno:Number(i)||1,simX:s,simY:c,simDir:l,simCargo:[...u],simSystems:{...d},simBattery:f,extra:a||null})},getScanDown:()=>{let e=c+1;return e>=n.rows?`BEDROCK`:a[o[e][s]]||`BEDROCK`},getScanTile:(e,t)=>{let r=s+e,i=c+t;return r<0||r>=n.cols||i<0||i>=n.rows?`BEDROCK`:a[o[i][r]]||`BEDROCK`}},this.pyodide.setStdout&&this.pyodide.setStdout({batched:e=>{i.push(String(e))}});try{return await this.pyodide.runPythonAsync(`
import sys
import inspect
import js

bridge = js.pyBridge

class RoverProxy:
    def __init__(self):
        self.systems = {"torque": 40, "shield": 100}
        self.cargo = []
        self.battery = 100

    def _line(self):
        try:
            return inspect.currentframe().f_back.f_back.f_lineno
        except:
            return 1

    def move_down(self):
        bridge.recordAction("move_down", self._line(), "")

    def move_up(self):
        bridge.recordAction("move_up", self._line(), "")

    def move_left(self):
        bridge.recordAction("move_left", self._line(), "")

    def move_right(self):
        bridge.recordAction("move_right", self._line(), "")

    def drill(self):
        t = int(self.systems.get("torque", 40))
        bridge.setTorque(t)
        bridge.recordAction("drill", self._line(), "")

    def drill_down(self):
        self.turn("DOWN")
        self.drill()

    def drill_up(self):
        self.turn("UP")
        self.drill()

    def drill_left(self):
        self.turn("LEFT")
        self.drill()

    def drill_right(self):
        self.turn("RIGHT")
        self.drill()

    def turn(self, direction):
        bridge.recordAction("turn_" + str(direction).lower(), self._line(), "")

    def collect(self):
        item = str(bridge.collectTile())
        if item:
            self.cargo.append(item)
        bridge.recordAction("collect", self._line(), "")

    def scan_down(self):
        res = str(bridge.getScanDown())
        bridge.recordAction("scan", self._line(), "DOWN")
        return res

    def scan_ahead(self):
        return self.scan_down()

rover = RoverProxy()
`),await this.pyodide.runPythonAsync(t),{success:!0,actions:r,output:i,error:null}}catch(e){return console.warn(`Python execution error:`,e),{success:!1,actions:r,output:i,error:this.formatPythonError(e)}}}runWithFallback(e,t,n,r,i){let a=e.split(`
`),o=t.grid.map(e=>[...e]),s=t.rover.x,c=t.rover.y,l=t.rover.dir,u=[...t.rover.cargo],d={...t.rover.systems},f=t.rover.battery;try{let e=0,p=0;for(;e<a.length&&p<500;){p++;let m=a[e],h=e+1,g=m.trim();if(!g||g.startsWith(`#`)){e++;continue}let _=g.match(/^for\s+\w+\s+in\s+range\((\d+)\):/);if(_){let p=parseInt(_[1],10),m=[],h=e+1;for(;h<a.length&&(a[h].startsWith(`    `)||a[h].startsWith(`	`)||!a[h].trim());)a[h].trim()&&m.push({text:a[h].trim(),lineno:h+1}),h++;for(let e=0;e<p;e++)for(let e of m)this.evalFallbackStatement(e.text,e.lineno,t,o,{get x(){return s},set x(e){s=e},get y(){return c},set y(e){c=e},get dir(){return l},set dir(e){l=e},cargo:u,systems:d,battery:f},n,r,i);e=h;continue}this.evalFallbackStatement(g,h,t,o,{get x(){return s},set x(e){s=e},get y(){return c},set y(e){c=e},get dir(){return l},set dir(e){l=e},cargo:u,systems:d,battery:f},n,r,i),e++}return{success:!0,actions:n,output:r,error:null}}catch(e){return{success:!1,actions:n,output:r,error:e.message}}}evalFallbackStatement(t,n,r,i,a,o,s,c){if(t.startsWith(`rover.move_down()`))a.dir=`DOWN`,a.y+1<r.rows&&a.y++,o.push({action:`move_down`,lineno:n,simX:a.x,simY:a.y,simDir:a.dir,simCargo:[...a.cargo],simSystems:{...a.systems}});else if(t.startsWith(`rover.move_up()`))a.dir=`UP`,a.y-1>=0&&a.y--,o.push({action:`move_up`,lineno:n,simX:a.x,simY:a.y,simDir:a.dir,simCargo:[...a.cargo],simSystems:{...a.systems}});else if(t.startsWith(`rover.move_left()`))a.dir=`LEFT`,a.x-1>=0&&a.x--,o.push({action:`move_left`,lineno:n,simX:a.x,simY:a.y,simDir:a.dir,simCargo:[...a.cargo],simSystems:{...a.systems}});else if(t.startsWith(`rover.move_right()`))a.dir=`RIGHT`,a.x+1<r.cols&&a.x++,o.push({action:`move_right`,lineno:n,simX:a.x,simY:a.y,simDir:a.dir,simCargo:[...a.cargo],simSystems:{...a.systems}});else if(t.startsWith(`rover.drill()`)){let t=a.x,s=a.y;a.dir===`DOWN`?s++:a.dir===`UP`?s--:a.dir===`RIGHT`?t++:a.dir===`LEFT`&&t--,t>=0&&t<r.cols&&s>=0&&s<r.rows&&(i[s][t]=e.AIR),o.push({action:`drill`,lineno:n,simX:a.x,simY:a.y,simDir:a.dir,simCargo:[...a.cargo],simSystems:{...a.systems}})}else if(t.startsWith(`rover.collect()`)){let t=i[a.y][a.x];t===e.CRYSTAL_EMERALD?(a.cargo.push(`Emerald Geode`),i[a.y][a.x]=e.AIR):t===e.CRYSTAL_LITHIUM&&(a.cargo.push(`Lithium Core`),i[a.y][a.x]=e.AIR),o.push({action:`collect`,lineno:n,simX:a.x,simY:a.y,simDir:a.dir,simCargo:[...a.cargo],simSystems:{...a.systems}})}else if(t.startsWith(`rover.systems["torque"] =`)||t.startsWith(`rover.systems['torque'] =`)){let e=parseInt(t.split(`=`)[1].trim(),10)||90;a.systems.torque=e}else t.startsWith(`print(`)&&s.push(t.replace(/^print\((.*)\)$/,`$1`))}formatPythonError(e){let t=String(e),n=t.match(/File "<exec>", line (\d+)/);return n?`Line ${n[1]}: ${t.split(`
`).slice(-2).join(` `)}`:t}},a=class{constructor(e,t){this.container=e,this.onChange=t||(()=>{}),this.activeLine=null,this.errorLine=null,this.initDOM()}initDOM(){this.container.innerHTML=`
      <div class="editor-wrapper">
        <div class="editor-gutter" id="editor-gutter"></div>
        <div class="editor-highlight-overlay" id="editor-overlay"></div>
        <textarea id="editor-textarea" spellcheck="false" autocomplete="off" autocapitalize="off"></textarea>
      </div>
    `,this.gutter=this.container.querySelector(`#editor-gutter`),this.overlay=this.container.querySelector(`#editor-overlay`),this.textarea=this.container.querySelector(`#editor-textarea`),this.textarea.addEventListener(`scroll`,()=>{this.gutter.scrollTop=this.textarea.scrollTop,this.overlay.scrollTop=this.textarea.scrollTop}),this.textarea.addEventListener(`input`,()=>{this.updateGutter(),this.onChange(this.textarea.value)}),this.textarea.addEventListener(`keydown`,e=>this.handleKeyDown(e)),this.updateGutter()}handleKeyDown(e){let t=this.textarea;if(e.key===`Tab`){e.preventDefault();let n=t.selectionStart,r=t.selectionEnd;if(!e.shiftKey)t.value=t.value.substring(0,n)+`    `+t.value.substring(r),t.selectionStart=t.selectionEnd=n+4;else{let e=t.value.substring(0,n).lastIndexOf(`
`)+1,r=t.value.substring(e,n);r.startsWith(`    `)&&(t.value=t.value.substring(0,e)+r.substring(4)+t.value.substring(n),t.selectionStart=t.selectionEnd=Math.max(e,n-4))}this.updateGutter(),this.onChange(t.value);return}if(e.key===`Enter`){let n=t.selectionStart,r=t.value.substring(0,n),i=r.lastIndexOf(`
`)+1,a=r.substring(i),o=a.match(/^(\s*)/),s=o?o[1]:``;a.trim().endsWith(`:`)&&(s+=`    `),s.length>0&&(e.preventDefault(),t.value=t.value.substring(0,n)+`
`+s+t.value.substring(t.selectionEnd),t.selectionStart=t.selectionEnd=n+1+s.length,this.updateGutter(),this.onChange(t.value))}}getValue(){return this.textarea.value}setValue(e){this.textarea.value=e,this.updateGutter(),this.clearHighlight(),this.onChange(e)}updateGutter(){let e=this.textarea.value.split(`
`),t=``;for(let n=1;n<=e.length;n++){let e=`gutter-num`;this.activeLine===n&&(e+=` active`),this.errorLine===n&&(e+=` error`),t+=`<div class="${e}">${n}</div>`}this.gutter.innerHTML=t}highlightLine(e){if(this.activeLine=e,this.updateGutter(),!e){this.overlay.innerHTML=``;return}let t=(e-1)*21;this.overlay.innerHTML=`
      <div class="line-highlight-bar" style="top: ${t}px; height: 21px;">
        <span class="step-indicator">▶ STEP</span>
      </div>
    `;let n=this.textarea.scrollTop,r=n+this.textarea.clientHeight;(t<n||t>r-42)&&(this.textarea.scrollTop=Math.max(0,t-60))}setErrorLine(e){this.errorLine=e,this.updateGutter()}clearHighlight(){this.activeLine=null,this.errorLine=null,this.overlay.innerHTML=``,this.updateGutter()}},o=[{id:0,title:`Sector 0: Calibration Drop`,subtitle:`The Basics // Sequential Execution`,strata:`Sub-Surface Loam (0m - 150m)`,badge:`BEGINNER`,cols:7,rows:8,spawn:{x:3,y:0,dir:`DOWN`},map:[[8,8,8,0,8,8,8],[8,8,8,1,8,8,8],[8,8,8,1,8,8,8],[8,8,8,1,8,8,8],[8,8,8,5,8,8,8],[8,8,8,7,8,8,8],[8,8,8,8,8,8,8],[8,8,8,8,8,8,8]],objectives:[`Drill through the 3 layers of soft loam dirt`,`Collect the rare Emerald Geode`,`Dock inside the Drop Pod at Depth 250m`],starterCode:`# ==========================================================
# SECTOR 0: CALIBRATION DROP
# Learn: Sequential method calls in Python.
# Commands available:
#   rover.drill()      - Drills the tile in front of the rover
#   rover.move_down()  - Moves the rover down 1 tile
#   rover.collect()    - Collects crystals or items
# ==========================================================

# 1. Drill and move down through the loam
rover.drill()
rover.move_down()

# TODO: Drill the remaining layers, collect the emerald,
# and reach the Drop Pod!
`,demoCode:`# --- OPTIMAL PYTHON SOLUTION ---
# Drill layer 1
rover.drill()
rover.move_down()

# Drill layer 2
rover.drill()
rover.move_down()

# Drill layer 3
rover.drill()
rover.move_down()

# Move onto the Emerald Geode and collect it
rover.move_down()
rover.collect()

# Enter the extraction Drop Pod!
rover.move_down()
`,hints:[`Python executes code line-by-line from top to bottom.`,`You cannot move into a dirt block until you drill it first!`,`Don't forget rover.collect() when you reach the glowing green crystal.`],checkWin:e=>{let t=e.rover.x===3&&e.rover.y===5,n=e.rover.cargo.includes(`Emerald Geode`);return t&&n?{won:!0,message:`Calibration complete! Emerald secured in pod.`}:t&&!n?{won:!1,message:`Docked at pod, but you forgot to rover.collect() the emerald!`}:{won:!1,message:`Drill downward and dock the rover at the Drop Pod.`}}},{id:1,title:`Sector 1: Basalt Trench`,subtitle:`Iteration // 'for' Loops & range()`,strata:`Fractured Basalt Band (350m - 700m)`,badge:`LOOPS`,cols:7,rows:10,spawn:{x:3,y:0,dir:`DOWN`},map:[[8,8,8,0,8,8,8],[8,8,8,2,8,8,8],[8,8,8,2,8,8,8],[8,8,8,2,8,8,8],[8,8,8,2,8,8,8],[8,8,8,2,8,8,8],[8,8,8,2,8,8,8],[8,8,8,4,8,8,8],[8,8,8,7,8,8,8],[8,8,8,8,8,8,8]],objectives:[`Drill through 6 thick layers of dense Basalt`,`Use a 'for' loop with range() to avoid repeating code`,`Collect the Lithium core and reach the pod`],starterCode:`# ==========================================================
# SECTOR 1: BASALT TRENCH
# Learn: 'for' loops in Python.
# Instead of writing rover.drill() 6 times, use a loop!
# Notice Python's indentation (4 spaces inside the loop block).
# ==========================================================

# Loop 6 times to blast through the basalt strata:
for layer in range(6):
    rover.drill()
    rover.move_down()

# TODO: Collect the Lithium ore and dock in the pod!
`,demoCode:`# --- OPTIMAL PYTHON SOLUTION ---
# Use a for loop to drill through all 6 basalt layers
for layer in range(6):
    rover.drill()
    rover.move_down()

# Move onto the Lithium crystal and collect it
rover.move_down()
rover.collect()

# Enter the extraction pod
rover.move_down()
`,hints:[`Python uses indentation (4 spaces) to define what is inside a loop.`,`range(6) repeats the indented block exactly 6 times.`,`Put rover.collect() after the loop finishes.`],checkWin:e=>{let t=e.rover.x===3&&e.rover.y===8,n=e.rover.cargo.includes(`Lithium Core`);return t&&n?{won:!0,message:`Basalt trench cleared with automated loop!`}:{won:!1,message:`Clear the 6 basalt layers with your loop and collect the Lithium!`}}},{id:2,title:`Sector 2: Magma Fault Line`,subtitle:`Conditionals // 'if / else' & Optical Radar`,strata:`Thermal Mantle Fault (800m - 1200m)`,badge:`CONDITIONALS`,cols:7,rows:9,spawn:{x:2,y:0,dir:`DOWN`},map:[[8,8,0,8,8,8,8],[8,8,1,8,8,8,8],[8,8,1,8,8,8,8],[8,8,3,1,8,8,8],[8,8,8,1,8,8,8],[8,8,1,1,8,8,8],[8,8,5,8,8,8,8],[8,8,7,8,8,8,8],[8,8,8,8,8,8,8]],objectives:[`Use rover.scan_down() to check strata ahead`,`Use 'if' statements to detect 'MAGMA'`,`Bypass the magma fissure safely without melting`],starterCode:`# ==========================================================
# SECTOR 2: MAGMA FAULT LINE
# Learn: Conditionals 'if' and 'else'.
# Commands available:
#   rover.scan_down()  - Returns tile type: 'DIRT', 'MAGMA', 'AIR'
#   rover.move_right() / rover.move_left() / rover.move_down()
# ==========================================================

for step in range(3):
    scan_result = rover.scan_down()
    print("Scan at depth:", scan_result)
    
    if scan_result == "MAGMA":
        # Magma alert! Step right to bypass the fissure
        rover.move_right()
        rover.drill()
        rover.move_down()
        rover.drill()
        rover.move_down()
        rover.move_left()
    else:
        rover.drill()
        rover.move_down()

# TODO: Clear the remaining strata, collect the Emerald,
# and dock in the drop pod!
`,demoCode:`# --- OPTIMAL PYTHON SOLUTION ---
for step in range(3):
    sensor = rover.scan_down()
    if sensor == "MAGMA":
        # Bypass around molten magma
        rover.move_right()
        rover.drill()
        rover.move_down()
        rover.drill()
        rover.move_down()
        rover.move_left()
    else:
        rover.drill()
        rover.move_down()

# Clear remaining layer to reach emerald
rover.drill()
rover.move_down()

# Move onto emerald, collect, and dock
rover.move_down()
rover.collect()
rover.move_down()
`,hints:[`rover.scan_down() reads the tile directly below without drilling it.`,`If you drill or step into MAGMA, the rover triggers emergency shutdown!`,`Use 'if scan_result == "MAGMA":' to divert path.`],checkWin:e=>{let t=e.rover.x===2&&e.rover.y===7,n=e.rover.cargo.includes(`Emerald Geode`);return t&&n?{won:!0,message:`Magma successfully avoided using sensor conditionals!`}:{won:!1,message:`Navigate around the magma hazard and reach the pod.`}}},{id:3,title:`Sector 3: Geode Cavern`,subtitle:`Data Structures // Python Lists & len()`,strata:`Crystalline Pocket (1500m - 2000m)`,badge:`LISTS`,cols:7,rows:9,spawn:{x:3,y:0,dir:`DOWN`},map:[[8,8,8,0,8,8,8],[8,8,8,1,8,8,8],[8,4,1,1,1,4,8],[8,8,8,1,8,8,8],[8,4,1,1,1,4,8],[8,8,8,1,8,8,8],[8,8,8,6,8,8,8],[8,8,8,7,8,8,8],[8,8,8,8,8,8,8]],objectives:[`Collect at least 3 Lithium Crystals`,`Track your inventory using Python's list: rover.cargo`,`Inspect len(rover.cargo) before docking`],starterCode:`# ==========================================================
# SECTOR 3: GEODE CAVERN
# Learn: Python lists and len().
# Your rover tracks collected samples in a real Python list:
#   rover.cargo -> ['Lithium Core', ...]
#   len(rover.cargo) -> Number of items in cargo
# ==========================================================

# Move down into the cavern
rover.drill()
rover.move_down()
rover.drill()
rover.move_down()

# Branch left to harvest mineral alcove 1
rover.drill_left()
rover.move_left()
rover.drill_left()
rover.move_left()
rover.collect()
rover.move_right()
rover.move_right()

print("Current Cargo List:", rover.cargo)
print("Items Collected:", len(rover.cargo))

# TODO: Harvest more alcoves until len(rover.cargo) >= 3,
# grab the Power Cell, and dock in the pod!
`,demoCode:`# --- OPTIMAL PYTHON SOLUTION ---
# Clear shaft down to first tier
rover.drill()
rover.move_down()
rover.drill()
rover.move_down()

# Alcove 1 (Left)
rover.drill_left()
rover.move_left()
rover.drill_left()
rover.move_left()
rover.collect()
rover.move_right()
rover.move_right()

# Alcove 2 (Right)
rover.drill_right()
rover.move_right()
rover.drill_right()
rover.move_right()
rover.collect()
rover.move_left()
rover.move_left()

# Move down to tier 2
rover.drill()
rover.move_down()
rover.drill()
rover.move_down()

# Alcove 3 (Left)
rover.drill_left()
rover.move_left()
rover.drill_left()
rover.move_left()
rover.collect()
rover.move_right()
rover.move_right()

# Recharge power cell & dock
rover.drill()
rover.move_down()
rover.drill()
rover.move_down()
`,hints:[`rover.cargo is a Python list containing strings of collected items.`,`len(rover.cargo) counts how many items you have secured.`,`You need at least 3 Lithium Cores to fulfill the quota.`],checkWin:e=>{let t=e.rover.x===3&&e.rover.y===7,n=e.rover.cargo.filter(e=>e.includes(`Lithium`)).length;return t&&n>=3?{won:!0,message:`Mission quota exceeded! ${n} Lithium cores secured.`}:t&&n<3?{won:!1,message:`Only collected ${n}/3 Lithium cores. Need at least 3!`}:{won:!1,message:`Collect at least 3 Lithium cores and dock in the drop pod.`}}},{id:4,title:`Sector 4: Reactor Power Matrix`,subtitle:`Data Structures // Python Dictionaries (dict)`,strata:`Subterranean Fortress Vault (2500m - 3200m)`,badge:`DICTIONARIES`,cols:7,rows:9,spawn:{x:3,y:0,dir:`DOWN`},map:[[8,8,8,0,8,8,8],[8,8,8,1,8,8,8],[8,8,8,9,8,8,8],[8,8,8,1,8,8,8],[8,8,8,9,8,8,8],[8,8,8,1,8,8,8],[8,8,8,5,8,8,8],[8,8,8,7,8,8,8],[8,8,8,8,8,8,8]],objectives:[`Access the rover's configuration dictionary: rover.systems`,`Overclock drill torque by setting rover.systems['torque'] = 90`,`Breach two Titanium Armor blast doors and secure the vault`],starterCode:`# ==========================================================
# SECTOR 4: REACTOR POWER MATRIX
# Learn: Python dictionaries (key-value mappings).
# The rover's hardware settings are stored in a dictionary:
#   rover.systems = {'torque': 40, 'shield': 100}
# Normal torque (40) cannot penetrate Titanium Armor doors!
# Overclock torque to 90 to shatter blast doors.
# ==========================================================

# 1. Inspect initial systems dictionary
print("Default Systems:", rover.systems)

# 2. Overclock torque key in the dictionary:
rover.systems["torque"] = 90
print("Overclocked Systems:", rover.systems)

# 3. Drill through the loam and blast through the armor door!
rover.drill()
rover.move_down()
rover.drill() # Powerful enough to crush titanium!
rover.move_down()

# TODO: Clear the remaining strata, shatter door 2,
# and collect the Vault Emerald!
`,demoCode:`# --- OPTIMAL PYTHON SOLUTION ---
# Overclock torque dictionary setting
rover.systems["torque"] = 90

for step in range(5):
    rover.drill()
    rover.move_down()

# Move onto emerald, collect, and dock
rover.move_down()
rover.collect()
rover.move_down()
`,hints:[`In Python, dictionaries store key-value pairs: my_dict['key'] = new_value.`,`If rover.systems['torque'] < 80, the drill will bounce harmlessly off titanium armor.`,`With torque >= 80, the diamond bit shatters titanium easily.`],checkWin:e=>{let t=e.rover.x===3&&e.rover.y===7,n=e.rover.cargo.includes(`Emerald Geode`);return t&&n?{won:!0,message:`Titanium vault breached via Python dictionary manipulation!`}:{won:!1,message:`Overclock torque to 90, breach both doors, and secure the vault emerald.`}}},{id:5,title:`Sector 5: Core Extraction Protocol`,subtitle:`Modularity // Functions & Subroutines`,strata:`Planetary Core Mantle (3400m - 4000m)`,badge:`FUNCTIONS`,cols:7,rows:10,spawn:{x:3,y:0,dir:`DOWN`},map:[[8,8,8,0,8,8,8],[8,8,8,1,8,8,8],[8,4,1,1,1,5,8],[8,8,8,1,8,8,8],[8,5,1,1,1,4,8],[8,8,8,1,8,8,8],[8,4,1,1,1,5,8],[8,8,8,1,8,8,8],[8,8,8,7,8,8,8],[8,8,8,8,8,8,8]],objectives:[`Define reusable Python functions (def harvest_tier(): ...)`,`Clear all 3 branching chambers with zero duplicated code`,`Collect at least 4 crystals and reach the Planetary Core Pod`],starterCode:`# ==========================================================
# SECTOR 5: CORE EXTRACTION PROTOCOL
# Learn: Python functions (def keyword).
# Functions encapsulate reusable subroutines.
# Define functions to harvest left and right alcoves cleanly!
# ==========================================================

def harvest_tier():
    # Clear left alcove
    rover.drill_left()
    rover.move_left()
    rover.drill_left()
    rover.move_left()
    rover.collect()
    rover.move_right()
    rover.move_right()
    
    # Clear right alcove
    rover.drill_right()
    rover.move_right()
    rover.drill_right()
    rover.move_right()
    rover.collect()
    rover.move_left()
    rover.move_left()

# Tier 1
rover.drill()
rover.move_down()
rover.drill()
rover.move_down()
harvest_tier()

# TODO: Clear Tiers 2 and 3 using your function in a loop,
# then dock at the Planetary Core Pod!
`,demoCode:`# --- OPTIMAL PYTHON SOLUTION ---
def harvest_tier():
    # Clear left alcove
    rover.drill_left()
    rover.move_left()
    rover.drill_left()
    rover.move_left()
    rover.collect()
    rover.move_right()
    rover.move_right()
    
    # Clear right alcove
    rover.drill_right()
    rover.move_right()
    rover.drill_right()
    rover.move_right()
    rover.collect()
    rover.move_left()
    rover.move_left()

# Traverse through 3 tiers of the planetary core
for tier in range(3):
    rover.drill()
    rover.move_down()
    rover.drill()
    rover.move_down()
    harvest_tier()

# Dock in pod
rover.drill()
rover.move_down()
rover.move_down()
`,hints:[`Functions start with 'def name():' followed by an indented block of code.`,`Calling harvest_tier() runs all its internal instructions in one neat line.`,`Combine functions with a 'for' loop for maximum elegance!`],checkWin:e=>{let t=e.rover.x===3&&e.rover.y===8,n=e.rover.cargo.length;return t&&n>=4?{won:!0,message:`PLANETARY CORE BREACHED! ${n} rare crystals extracted with modular code!`}:t&&n<4?{won:!1,message:`Only collected ${n} crystals. Harvest more alcoves using your functions!`}:{won:!1,message:`Harvest the cavern alcoves with functions and dock in the pod.`}}},{id:6,title:`Sector 6: Electromagnetic Void`,subtitle:`State Loops // 'while' Loops & Energy Systems`,strata:`Electromagnetic Void (4100m - 4700m)`,badge:`WHILE LOOPS`,cols:7,rows:9,spawn:{x:3,y:0,dir:`DOWN`},map:[[8,8,8,0,8,8,8],[8,8,8,1,8,8,8],[8,8,8,6,8,8,8],[8,8,8,1,8,8,8],[8,8,8,6,8,8,8],[8,8,8,1,8,8,8],[8,8,8,5,8,8,8],[8,8,8,7,8,8,8],[8,8,8,8,8,8,8]],objectives:[`Use a 'while' loop to drill down until reaching Depth 300m`,`Recharge your batteries at both Power Cells`,`Collect the Void Emerald and dock in the pod`],starterCode:`# ==========================================================
# SECTOR 6: ELECTROMAGNETIC VOID
# Learn: 'while' loops in Python.
# A 'while' loop continues running as long as a condition is True:
#   while rover.y < 6:
#       rover.drill()
#       rover.move_down()
# ==========================================================

# Drill downward while above the target depth
while rover.y < 6:
    rover.drill()
    rover.move_down()
    rover.collect() # Automatically grabs power cells along the way!

# TODO: Collect the Emerald and dock in the Drop Pod!
`,demoCode:`# --- OPTIMAL PYTHON SOLUTION ---
# Use a while loop to navigate down until depth y reaches 6
while rover.y < 6:
    rover.drill()
    rover.move_down()
    rover.collect() # Scoops up power cells to keep batteries full

# At emerald geode
rover.collect()
rover.move_down()
`,hints:[`A while loop repeats continuously until its condition evaluates to False.`,`Make sure you advance rover.move_down() inside the loop to avoid infinite loops!`,`rover.collect() picks up Power Cells (+50% battery) and gems alike.`],checkWin:e=>{let t=e.rover.x===3&&e.rover.y===7,n=e.rover.cargo.includes(`Emerald Geode`);return t&&n?{won:!0,message:`Electromagnetic Void crossed with automated while loop!`}:{won:!1,message:`Recharge at power cells, secure the emerald, and dock at the pod.`}}},{id:7,title:`Sector 7: Mineral Sifter`,subtitle:`Collections // List Comprehensions & Filtering`,strata:`Radioactive Slag Vein (4800m - 5400m)`,badge:`LIST COMPS`,cols:7,rows:9,spawn:{x:3,y:0,dir:`DOWN`},map:[[8,8,8,0,8,8,8],[8,8,8,1,8,8,8],[8,4,1,1,1,5,8],[8,8,8,1,8,8,8],[8,5,1,1,1,4,8],[8,8,8,1,8,8,8],[8,8,8,5,8,8,8],[8,8,8,7,8,8,8],[8,8,8,8,8,8,8]],objectives:[`Harvest minerals from side alcoves`,`Filter for Emeralds using list comprehension: [x for x in rover.cargo if 'Emerald' in x]`,`Deliver at least 2 Emeralds to the extraction pod`],starterCode:`# ==========================================================
# SECTOR 7: MINERAL SIFTER
# Learn: Python List Comprehensions!
# A list comprehension filters and transforms collections in one line:
#   emeralds = [item for item in rover.cargo if "Emerald" in item]
# ==========================================================

# Clear down to tier 1
rover.drill()
rover.move_down()
rover.drill()
rover.move_down()

# Grab left lithium and right emerald
rover.drill_left()
rover.move_left()
rover.drill_left()
rover.move_left()
rover.collect()
rover.move_right()
rover.move_right()

rover.drill_right()
rover.move_right()
rover.drill_right()
rover.move_right()
rover.collect()
rover.move_left()
rover.move_left()

# Filter collected emeralds
emeralds = [item for item in rover.cargo if "Emerald" in item]
print("Filtered Emeralds:", emeralds)

# TODO: Harvest tier 2, filter cargo, and dock in the pod!
`,demoCode:`# --- OPTIMAL PYTHON SOLUTION ---
def harvest_tier():
    # Left pocket
    rover.drill_left()
    rover.move_left()
    rover.drill_left()
    rover.move_left()
    rover.collect()
    rover.move_right()
    rover.move_right()
    # Right pocket
    rover.drill_right()
    rover.move_right()
    rover.drill_right()
    rover.move_right()
    rover.collect()
    rover.move_left()
    rover.move_left()

# Clear both tiers
for _ in range(2):
    rover.drill()
    rover.move_down()
    rover.drill()
    rover.move_down()
    harvest_tier()

# Sift cargo with list comprehension
emeralds = [c for c in rover.cargo if "Emerald" in c]
print("Total Pure Emeralds Found:", len(emeralds))

# Dock at pod
rover.drill()
rover.move_down()
rover.collect()
rover.move_down()
`,hints:[`List comprehension syntax: [item for item in list if condition].`,`rover.cargo contains strings like 'Emerald Geode' and 'Lithium Core'.`,`Ensure you dock at the pod with at least 2 Emeralds secured.`],checkWin:e=>{let t=e.rover.x===3&&e.rover.y===7,n=e.rover.cargo.filter(e=>e.includes(`Emerald`));return t&&n.length>=2?{won:!0,message:`Pure minerals purified! ${n.length} Emeralds secured.`}:{won:!1,message:`Collect at least 2 Emeralds and dock in the pod.`}}},{id:8,title:`Sector 8: Obsidian Labyrinth`,subtitle:`Data Structures // Tuples & Waypoint Navigation`,strata:`Dense Obsidian Columns (5500m - 6200m)`,badge:`TUPLES & PATHS`,cols:7,rows:9,spawn:{x:1,y:0,dir:`DOWN`},map:[[8,0,8,8,8,8,8],[8,1,8,8,8,8,8],[8,1,1,1,8,8,8],[8,8,8,1,8,8,8],[8,8,8,1,1,1,8],[8,8,8,8,8,1,8],[8,8,8,8,8,5,8],[8,8,8,8,8,7,8],[8,8,8,8,8,8,8]],objectives:[`Navigate the winding obsidian zigzag shaft`,`Store navigation steps as Python tuples: ('DIR', count)`,`Iterate over your waypoint list to clear the maze`],starterCode:`# ==========================================================
# SECTOR 8: OBSIDIAN LABYRINTH
# Learn: Python Tuples and Path Lists.
# Tuples are immutable pairs: ("DOWN", 2), ("RIGHT", 2)
# Loop through a list of waypoints to pilot through the labyrinth!
# ==========================================================

# Define your route as a list of direction-count tuples:
route = [
    ("DOWN", 2),
    ("RIGHT", 2),
    ("DOWN", 2),
    ("RIGHT", 2),
    ("DOWN", 2)
]

for direction, distance in route:
    print("Navigating:", direction, distance)
    for _ in range(distance):
        rover.drill()
        if direction == "DOWN":
            rover.move_down()
        elif direction == "RIGHT":
            rover.move_right()

# TODO: Collect the Emerald and dock into the pod!
`,demoCode:`# --- OPTIMAL PYTHON SOLUTION ---
# Define navigation waypoints as (direction, steps) tuples
route = [
    ("DOWN", 2),
    ("RIGHT", 2),
    ("DOWN", 2),
    ("RIGHT", 2),
    ("DOWN", 2)
]

for direction, steps in route:
    for _ in range(steps):
        rover.drill()
        if direction == "DOWN":
            rover.move_down()
        elif direction == "RIGHT":
            rover.move_right()

# Collect the Obsidian Vault Emerald
rover.collect()

# Enter the extraction pod
rover.move_down()
`,hints:[`Tuples are written with parentheses: ('DOWN', 2).`,`You can unpack tuples directly in a for loop: 'for direction, steps in route:'.`,`Follow the path carefully to avoid drilling into indestructible bedrock!`],checkWin:e=>{let t=e.rover.x===5&&e.rover.y===7,n=e.rover.cargo.includes(`Emerald Geode`);return t&&n?{won:!0,message:`Obsidian labyrinth charted with tuple waypoint routing!`}:{won:!1,message:`Follow the waypoint route, collect the emerald, and dock at the pod.`}}},{id:9,title:`Sector 9: The Planetary Singularity`,subtitle:`The Master Protocol // Autonomous Object-Oriented Rover`,strata:`Planetary Singularity Core (7000m+)`,badge:`MASTER PROTOCOL`,cols:7,rows:10,spawn:{x:3,y:0,dir:`DOWN`},map:[[8,8,8,0,8,8,8],[8,8,8,9,8,8,8],[8,8,8,1,8,8,8],[8,8,3,1,8,8,8],[8,8,8,1,8,8,8],[8,4,1,1,1,4,8],[8,8,8,1,8,8,8],[8,8,8,9,8,8,8],[8,8,8,5,8,8,8],[8,8,8,7,8,8,8]],objectives:[`Overclock systems['torque'] to 90 to pierce Titanium gates`,`Avoid magma fissures using optical radar scans`,`Harvest both Lithium power cores and extract the Singularity Relic`,`Dock into the Master Extraction Pod at the center of the planet!`],starterCode:`# ==========================================================
# SECTOR 9: THE PLANETARY SINGULARITY (THE GRAND FINALE)
# Combine everything you've learned:
#   - Dictionaries: rover.systems['torque'] = 90
#   - Conditionals & Scans: rover.scan_down()
#   - Functions: def clear_alcoves():
#   - Loops: for step in range(...):
# ==========================================================

# 1. Overclock torque for titanium blast doors
rover.systems["torque"] = 90

# 2. Breach gate 1
rover.drill()
rover.move_down()

# TODO: Write an autonomous master routine to bypass magma,
# harvest the cores, shatter the final blast door,
# and extract the Planetary Singularity!
`,demoCode:`# --- OPTIMAL PYTHON SOLUTION ---
# 1. Overclock drill torque
rover.systems["torque"] = 90

# 2. Breach top gate
rover.drill()
rover.move_down()

# 3. Navigate past magma bypass
for step in range(3):
    sensor = rover.scan_down()
    if sensor == "MAGMA":
        rover.move_right()
        rover.drill()
        rover.move_down()
        rover.move_left()
    else:
        rover.drill()
        rover.move_down()

# 4. Harvest alcove crystals
rover.drill_left()
rover.move_left()
rover.drill_left()
rover.move_left()
rover.collect()
rover.move_right()
rover.move_right()

rover.drill_right()
rover.move_right()
rover.drill_right()
rover.move_right()
rover.collect()
rover.move_left()
rover.move_left()

# 5. Breach gate 2 & extract Singularity
rover.drill()
rover.move_down()
rover.drill()
rover.move_down()
rover.collect() # Collect Singularity Emerald
rover.move_down() # Dock in Master Pod!
`,hints:[`Overclock torque before drilling into titanium armor doors.`,`Use scan_down() to check for dangerous magma pockets.`,`Collect all available minerals to complete the ultimate planetary expedition!`],checkWin:e=>{let t=e.rover.x===3&&e.rover.y===9,n=e.rover.cargo.includes(`Emerald Geode`),r=e.rover.cargo.filter(e=>e.includes(`Lithium`)).length;return t&&n&&r>=2?{won:!0,message:`🏆 PLANETARY SINGULARITY SECURED! You have mastered the Python Pit!`}:t&&n?{won:!0,message:`Singularity reached! Excellent expedition!`}:{won:!1,message:`Breach the final gate, secure the Singularity Relic, and dock at the core pod.`}}}],s=class{constructor(){this.currentLevelIndex=0,this.speed=1,this.isRunning=!1,this.actionQueue=[],this.actionTimer=null,this.unlockedLevel=parseInt(localStorage.getItem(`pythonpit_unlocked`)||`0`,10),this.savedCodes=JSON.parse(localStorage.getItem(`pythonpit_saved_code`)||`{}`),this.initDOM(),this.initSystems()}initDOM(){this.canvas=document.getElementById(`world-canvas`),this.editorContainer=document.getElementById(`code-editor-container`),this.levelSelect=document.getElementById(`level-select`),this.runBtn=document.getElementById(`btn-run`),this.demoBtn=document.getElementById(`btn-demo`),this.resetBtn=document.getElementById(`btn-reset`),this.speedBtn=document.getElementById(`btn-speed`),this.muteBtn=document.getElementById(`btn-mute`),this.docsBtn=document.getElementById(`btn-docs`),this.docsModal=document.getElementById(`docs-modal`),this.docsClose=document.getElementById(`docs-close`),this.victoryModal=document.getElementById(`victory-modal`),this.victoryNextBtn=document.getElementById(`victory-next-btn`),this.victoryCloseBtn=document.getElementById(`victory-close-btn`),this.victoryMsg=document.getElementById(`victory-msg`),this.hudDepth=document.getElementById(`hud-depth`),this.hudBattery=document.getElementById(`hud-battery`),this.hudCargo=document.getElementById(`hud-cargo`),this.hudTorque=document.getElementById(`hud-torque`),this.hudStrata=document.getElementById(`hud-strata`),this.levelTitle=document.getElementById(`level-title`),this.levelSubtitle=document.getElementById(`level-subtitle`),this.levelObjectives=document.getElementById(`level-objectives`),this.runtimeStatus=document.getElementById(`runtime-status`),this.consoleLogs=document.getElementById(`console-logs`)}async initSystems(){this.renderer=new n(this.canvas),this.renderer.resize(),window.addEventListener(`resize`,()=>this.renderer.resize()),this.pyodide=new i((e,t)=>{this.updateRuntimeStatus(e,t)}),this.pyodide.init(),this.editor=new a(this.editorContainer,e=>{this.savedCodes[this.currentLevelIndex]=e,localStorage.setItem(`pythonpit_saved_code`,JSON.stringify(this.savedCodes))}),this.loadLevel(this.currentLevelIndex),this.renderLevelSelector(),this.bindEvents(),this.lastTime=performance.now(),requestAnimationFrame(e=>this.loop(e))}renderLevelSelector(){this.levelSelect.innerHTML=``,o.forEach((e,t)=>{let n=document.createElement(`option`);n.value=t,n.textContent=`${t>this.unlockedLevel?`🔒`:`⚡`} ${e.title}`,t===this.currentLevelIndex&&(n.selected=!0),this.levelSelect.appendChild(n)})}loadLevel(e){this.isRunning&&this.stopExecution(),this.currentLevelIndex=e;let n=o[e];this.world=new t(n),this.renderer.syncRoverPosition(this.world.rover,!0),this.levelTitle.textContent=n.title,this.levelSubtitle.textContent=n.subtitle,this.hudStrata.textContent=n.strata,this.levelObjectives.innerHTML=n.objectives.map(e=>`<li>${e}</li>`).join(``);let r=this.savedCodes[e];this.editor.setValue(r===void 0?n.starterCode:r),this.updateHUD(),this.clearConsole(),this.logConsole(`System ready. Connected to ${n.title} strata.`,`info`)}bindEvents(){this.levelSelect.addEventListener(`change`,e=>{r.playClick(),this.loadLevel(parseInt(e.target.value,10))}),this.runBtn.addEventListener(`click`,()=>{r.playClick(),this.executePython(this.editor.getValue())}),this.demoBtn.addEventListener(`click`,()=>{r.playClick();let e=o[this.currentLevelIndex];this.editor.setValue(e.demoCode),this.logConsole(`Loading optimal Python demo solution...`,`info`),this.executePython(e.demoCode)}),this.resetBtn.addEventListener(`click`,()=>{r.playClick(),this.stopExecution(),this.world.initFromLevel(o[this.currentLevelIndex]),this.renderer.syncRoverPosition(this.world.rover,!0),this.editor.clearHighlight(),this.updateHUD(),this.logConsole(`Simulation reset to spawn point.`,`info`)}),this.speedBtn.addEventListener(`click`,()=>{r.playClick(),this.speed=this.speed===1?2:this.speed===2?4:this.speed===4?.5:1,this.speedBtn.textContent=`⚡ SPEED: ${this.speed}x`}),this.muteBtn.addEventListener(`click`,()=>{let e=r.toggleMute();this.muteBtn.textContent=e?`🔇 MUTED`:`🔊 AUDIO`}),this.docsBtn.addEventListener(`click`,()=>{r.playClick(),this.docsModal.classList.remove(`hidden`)}),this.docsClose.addEventListener(`click`,()=>{r.playClick(),this.docsModal.classList.add(`hidden`)}),this.victoryNextBtn.addEventListener(`click`,()=>{r.playClick(),this.victoryModal.classList.add(`hidden`),this.currentLevelIndex+1<o.length&&(this.loadLevel(this.currentLevelIndex+1),this.renderLevelSelector())});let e=document.getElementById(`btn-copy-console`);e&&e.addEventListener(`click`,()=>{r.playClick();let t=this.consoleLogs.innerText||this.consoleLogs.textContent;navigator.clipboard.writeText(t).then(()=>{e.textContent=`✅ COPIED!`,setTimeout(()=>{e.textContent=`📋 COPY LOGS`},1500)}).catch(()=>{let n=document.createElement(`textarea`);n.value=t,document.body.appendChild(n),n.select(),document.execCommand(`copy`),document.body.removeChild(n),e.textContent=`✅ COPIED!`,setTimeout(()=>{e.textContent=`📋 COPY LOGS`},1500)})}),this.bindManualControls()}bindManualControls(){let e=(e,t)=>{let n=document.getElementById(e);n&&n.addEventListener(`click`,()=>{this.isRunning||t()})};e(`dpad-up`,()=>this.manualMove(`UP`)),e(`dpad-down`,()=>this.manualMove(`DOWN`)),e(`dpad-left`,()=>this.manualMove(`LEFT`)),e(`dpad-right`,()=>this.manualMove(`RIGHT`)),e(`dpad-drill`,()=>this.manualDrill()),e(`dpad-scan`,()=>this.manualScan()),e(`dpad-collect`,()=>this.manualCollect()),window.addEventListener(`keydown`,e=>{this.isRunning||document.activeElement!==this.editor.textarea&&(e.key===`ArrowUp`||e.key===`w`||e.key===`W`?this.manualMove(`UP`):e.key===`ArrowDown`||e.key===`s`||e.key===`S`?this.manualMove(`DOWN`):e.key===`ArrowLeft`||e.key===`a`||e.key===`A`?this.manualMove(`LEFT`):e.key===`ArrowRight`||e.key===`d`||e.key===`D`?this.manualMove(`RIGHT`):e.key===` `||e.key===`x`?(e.preventDefault(),this.manualDrill()):e.key===`e`||e.key===`c`?this.manualCollect():(e.key===`q`||e.key===`r`)&&this.manualScan())})}manualMove(e){this.world.rover.dir=e;let t=this.world.getFrontCoords(e);this.world.canMoveTo(t.x,t.y)&&(this.world.rover.x=t.x,this.world.rover.y=t.y,r.playMove(),this.updateHUD(),this.checkLevelOutcome())}manualDrill(){let t=this.world.getFrontCoords(),n=this.world.getTile(t.x,t.y);if(n===e.CRYSTAL_EMERALD){this.world.rover.cargo.push(`Emerald Geode`),this.world.setTile(t.x,t.y,e.AIR),r.playCollect(),this.renderer.addSparks((t.x+.5)*this.renderer.tileSize,(t.y+.5)*this.renderer.tileSize,16,`#00e676`),this.logConsole(`💎 Harvested: Emerald Geode with diamond drill! (+1 to cargo)`,`success`),this.updateHUD(),this.checkLevelOutcome();return}if(n===e.CRYSTAL_LITHIUM){this.world.rover.cargo.push(`Lithium Core`),this.world.setTile(t.x,t.y,e.AIR),r.playCollect(),this.renderer.addSparks((t.x+.5)*this.renderer.tileSize,(t.y+.5)*this.renderer.tileSize,16,`#00e5ff`),this.logConsole(`💎 Harvested: Lithium Core with diamond drill! (+1 to cargo)`,`success`),this.updateHUD(),this.checkLevelOutcome();return}n===e.DIRT||n===e.BASALT||n===e.TITANIUM_ARMOR&&this.world.rover.systems.torque>=80?(this.world.rover.drilling=!0,r.playDrill(),setTimeout(()=>{this.world.setTile(t.x,t.y,e.AIR),this.world.rover.drilling=!1,this.updateHUD()},150)):n===e.MAGMA?(r.playHazard(),this.logConsole(`CRITICAL WARNING: Drill breached molten magma fissure!`,`error`)):r.playClick()}manualScan(){this.world.rover.scanning=!0,r.playScan();let t=this.world.getFrontCoords(`DOWN`),n=this.world.getTile(t.x,t.y),i={[e.AIR]:`AIR`,[e.DIRT]:`DIRT`,[e.BASALT]:`BASALT`,[e.MAGMA]:`MAGMA`,[e.CRYSTAL_EMERALD]:`EMERALD`,[e.CRYSTAL_LITHIUM]:`LITHIUM`,[e.DROP_POD]:`DROP_POD`};this.logConsole(`[RADAR SCAN] Below Strata: ${i[n]||`BEDROCK`}`,`info`),setTimeout(()=>{this.world.rover.scanning=!1},400)}manualCollect(){let t=this.world.getTile(this.world.rover.x,this.world.rover.y),n=this.world.rover.x,i=this.world.rover.y;if(t!==e.CRYSTAL_EMERALD&&t!==e.CRYSTAL_LITHIUM&&t!==e.POWER_CELL){let r=this.world.getFrontCoords(),a=this.world.getTile(r.x,r.y);(a===e.CRYSTAL_EMERALD||a===e.CRYSTAL_LITHIUM||a===e.POWER_CELL)&&(t=a,n=r.x,i=r.y)}t===e.CRYSTAL_EMERALD?(this.world.rover.cargo.push(`Emerald Geode`),this.world.setTile(n,i,e.AIR),r.playCollect(),this.renderer.addSparks((n+.5)*this.renderer.tileSize,(i+.5)*this.renderer.tileSize,16,`#00e676`),this.logConsole(`💎 Secured: Emerald Geode (+1 to cargo)`,`success`),this.updateHUD()):t===e.CRYSTAL_LITHIUM?(this.world.rover.cargo.push(`Lithium Core`),this.world.setTile(n,i,e.AIR),r.playCollect(),this.renderer.addSparks((n+.5)*this.renderer.tileSize,(i+.5)*this.renderer.tileSize,16,`#00e5ff`),this.logConsole(`💎 Secured: Lithium Core (+1 to cargo)`,`success`),this.updateHUD()):t===e.POWER_CELL?(this.world.rover.battery=Math.min(100,this.world.rover.battery+50),this.world.setTile(n,i,e.AIR),r.playCollect(),this.renderer.addSparks((n+.5)*this.renderer.tileSize,(i+.5)*this.renderer.tileSize,16,`#ffb300`),this.logConsole(`⚡ Recharged: Power Cell (+50% battery)`,`success`),this.updateHUD()):this.logConsole(`No minerals within reach to collect. (Move onto or face the crystal)`,`info`),this.checkLevelOutcome()}async executePython(e){this.isRunning&&this.stopExecution(),this.clearConsole(),this.logConsole(`Executing Python code in CPython 3.11 WASM...`,`info`),this.world.initFromLevel(o[this.currentLevelIndex]),this.renderer.syncRoverPosition(this.world.rover,!0);let t=await this.pyodide.execute(e,this.world);if(t.output&&t.output.length>0&&t.output.forEach(e=>this.logConsole(`[stdout] ${e}`,`output`)),!t.success){r.playError(),this.logConsole(`PYTHON ERROR:\n${t.error}`,`error`);let e=t.error.match(/Line (\d+)/);e&&this.editor.setErrorLine(parseInt(e[1],10));return}this.playActionQueue(t.actions)}playActionQueue(e){this.isRunning=!0,this.runBtn.disabled=!0,this.demoBtn.disabled=!0,this.actionQueue=[...e];let t=Math.max(60,Math.floor(320/this.speed)),n=()=>{if(!this.isRunning||this.actionQueue.length===0){this.finishExecution();return}let e=this.actionQueue.shift();this.applyRecordedAction(e),this.actionTimer=setTimeout(n,t)};n()}applyRecordedAction(t){let{action:n,lineno:i,simX:a,simY:o,simDir:s,simCargo:c,simSystems:l}=t;if(i&&this.editor.highlightLine(i),this.world.rover.x=a,this.world.rover.y=o,this.world.rover.dir=s,this.world.rover.cargo=[...c],this.world.rover.systems={...l},n===`drill`){this.world.rover.drilling=!0,r.playDrill();let t=this.world.getFrontCoords(s),n=this.world.getTile(t.x,t.y);(n===e.CRYSTAL_EMERALD||n===e.CRYSTAL_LITHIUM)&&(r.playCollect(),this.renderer.addSparks((t.x+.5)*this.renderer.tileSize,(t.y+.5)*this.renderer.tileSize,16,`#00e676`)),this.world.setTile(t.x,t.y,e.AIR),setTimeout(()=>{this.world.rover.drilling=!1},180/this.speed)}else if(n===`collect`){r.playCollect(),this.world.setTile(a,o,e.AIR);let t=this.world.getFrontCoords(s),n=this.world.getTile(t.x,t.y);(n===e.CRYSTAL_EMERALD||n===e.CRYSTAL_LITHIUM||n===e.POWER_CELL)&&this.world.setTile(t.x,t.y,e.AIR),this.renderer.addSparks((a+.5)*this.renderer.tileSize,(o+.5)*this.renderer.tileSize,16,`#00e676`)}else n===`scan`?(this.world.rover.scanning=!0,r.playScan(),setTimeout(()=>{this.world.rover.scanning=!1},300/this.speed)):n.startsWith(`move`)&&r.playMove();this.updateHUD()}finishExecution(){this.stopExecution(),this.editor.clearHighlight(),this.checkLevelOutcome()}stopExecution(){this.isRunning=!1,this.runBtn.disabled=!1,this.demoBtn.disabled=!1,this.actionTimer&&=(clearTimeout(this.actionTimer),null),this.actionQueue=[],this.world.rover.drilling=!1,this.world.rover.scanning=!1}checkLevelOutcome(){let e=this.world.checkObjectives();e.won?(r.playVictory(),this.logConsole(`MISSION ACCOMPLISHED: ${e.message}`,`success`),this.victoryMsg.textContent=e.message,this.victoryModal.classList.remove(`hidden`),this.currentLevelIndex+1>this.unlockedLevel&&(this.unlockedLevel=Math.min(o.length-1,this.currentLevelIndex+1),localStorage.setItem(`pythonpit_unlocked`,this.unlockedLevel.toString()),this.renderLevelSelector())):this.logConsole(`Status: ${e.message}`,`info`)}updateHUD(){this.hudDepth.textContent=`-${this.world.getDepthMeters()}m`,this.hudBattery.textContent=`${this.world.rover.battery}%`,this.hudCargo.textContent=`[${this.world.rover.cargo.length}] ${this.world.rover.cargo.join(`, `)||`EMPTY`}`,this.hudTorque.textContent=`${this.world.rover.systems.torque} Nm`}updateRuntimeStatus(e,t){e===`READY`?this.runtimeStatus.innerHTML=`<span class="badge-ready">🟢 ${t}</span>`:e===`LOADING`?this.runtimeStatus.innerHTML=`<span class="badge-loading">🟡 ${t}</span>`:this.runtimeStatus.innerHTML=`<span class="badge-fallback">🔵 ${t}</span>`}logConsole(e,t=`info`){let n=document.createElement(`div`);n.className=`log-line log-${t}`,n.textContent=`> ${e}`,this.consoleLogs.appendChild(n),this.consoleLogs.scrollTop=this.consoleLogs.scrollHeight}clearConsole(){this.consoleLogs.innerHTML=``}loop(e){let t=Math.min(.1,(e-this.lastTime)/1e3);this.lastTime=e,this.renderer.update(t,this.world),this.renderer.render(this.world),requestAnimationFrame(e=>this.loop(e))}};window.addEventListener(`DOMContentLoaded`,()=>{window.game=new s});