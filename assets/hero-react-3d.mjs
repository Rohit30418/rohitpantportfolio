/**
 * Portfolio V2 / React atom hero.
 * Real Three.js geometry, one lightweight WebGL canvas. No GLB, video,
 * image sequences or React runtime needed on the existing static site.
 * The accessible SVG remains visible until a successful GPU render.
 */
(() => {
  const stage=document.getElementById('reactHeroStage');
  const slot=document.getElementById('reactHeroCanvasSlot');
  if(!stage||!slot)return;

  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse=window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const connection=navigator.connection;
  const constrained=!!(connection?.saveData||(navigator.deviceMemory&&navigator.deviceMemory<3));
  if(constrained||!window.WebGLRenderingContext)return;

  let renderer,scene,camera,atom,techBadges=[],observer,resizeObserver,canvas;
  let running=false,initialized=false,loading=false,disposed=false,rendered=false,contextLost=false;
  let raf=0,lastDraw=0,epoch=0;
  const pointer={x:0,y:0};
  const eased={x:0,y:0};
  const frameInterval=1000/(coarse?24:35);
  let THREE;

  function layout(){
    if(!renderer||!camera||disposed||contextLost)return;
    const width=Math.max(2,Math.round(slot.clientWidth));
    const height=Math.max(2,Math.round(slot.clientHeight));
    renderer.setPixelRatio(Math.min(devicePixelRatio||1,coarse?1.15:1.55));
    renderer.setSize(width,height,false);
    camera.aspect=width/height;
    techBadges.forEach(badge=>{
      badge.visible=!(width<345 && badge.userData.hideOnCompact);
    });

    // Fit the *whole* composition into the canvas, not just the central atom.
    // The previous fixed camera distance clipped JS, HTML, CSS and Firebase
    // near the edges, especially at browser zoom and smaller viewport sizes.
    scene.updateMatrixWorld(true);
    const bounds=new THREE.Box3().setFromObject(atom);
    for(const badge of techBadges){
      if(badge.visible)bounds.expandByObject(badge);
    }
    const padding=.28; // reserve room for floating and pointer rotation
    const furthestX=Math.max(Math.abs(bounds.min.x),Math.abs(bounds.max.x))+padding;
    const furthestY=Math.max(Math.abs(bounds.min.y),Math.abs(bounds.max.y))+padding;
    const frontZ=bounds.max.z+.22;
    const halfFov=Math.tan(THREE.MathUtils.degToRad(camera.fov*.5));
    const usableX=.76; // 12% left/right inset protects floating cards
    const usableY=.76; // 12% top/bottom inset protects labels and cards
    camera.position.z=Math.max(9.3,frontZ+Math.max(
      furthestX/(halfFov*camera.aspect*usableX),
      furthestY/(halfFov*usableY)
    ));
    camera.lookAt(0,0,0);
    camera.updateProjectionMatrix();

    const projectedX=furthestX/((camera.position.z-frontZ)*halfFov*camera.aspect);
    const projectedY=furthestY/((camera.position.z-frontZ)*halfFov);
    stage.dataset.cameraDistance=camera.position.z.toFixed(2);
    stage.dataset.compositionMargin=Math.max(0,(1-Math.max(projectedX,projectedY))/2).toFixed(3);
    draw();
  }

  function draw(){
    if(!renderer||!scene||contextLost||disposed)return;
    renderer.render(scene,camera);
    if(!rendered){
      rendered=true;
      stage.classList.add('has-webgl');
    }
  }

  function animate(now){
    raf=0;
    if(!running||disposed||document.hidden||contextLost)return;
    if(now-lastDraw<frameInterval){
      raf=requestAnimationFrame(animate);
      return;
    }
    lastDraw=now;
    if(!epoch)epoch=now;
    const time=(now-epoch)*.001;
    eased.x+=(pointer.x-eased.x)*.055;
    eased.y+=(pointer.y-eased.y)*.055;

    atom.rotation.x=-.12+Math.sin(time*.34)*.085+eased.y*.14;
    atom.rotation.y=.27+Math.sin(time*.26)*.33+eased.x*.24;
    atom.rotation.z=.045+Math.sin(time*.18)*.065;
    // Independently bob and tilt each 3D technology plaque around the atom.
    techBadges.forEach((badge,i)=>{
      const origin=badge.userData.origin;
      badge.position.y=origin.y+Math.sin(time*(.50+i*.035)+i*1.4)*(.075+(i%3)*.014);
      badge.rotation.y=badge.userData.yaw+Math.sin(time*.38+i)*.12;
      badge.rotation.x=badge.userData.pitch+Math.cos(time*.44+i*1.2)*.075;
      badge.rotation.z=badge.userData.roll+Math.sin(time*.33+i)*.045;
    });
    draw();
    if(!reduced)raf=requestAnimationFrame(animate);
  }

  function start(){
    if(disposed||contextLost||!initialized||running||document.hidden)return;
    if(reduced){draw();return}
    running=true;
    lastDraw=0;
    raf=requestAnimationFrame(animate);
  }
  function pause(){
    running=false;
    if(raf){cancelAnimationFrame(raf);raf=0}
  }
  function onVisibility(){
    if(document.hidden)pause();
    else if(observer?.heroVisible)start();
  }
  function onPointer(event){
    if(coarse||reduced)return;
    const rect=stage.getBoundingClientRect();
    pointer.x=Math.max(-1,Math.min(1,((event.clientX-rect.left)/rect.width-.5)*2));
    pointer.y=Math.max(-1,Math.min(1,((event.clientY-rect.top)/rect.height-.5)*2));
  }
  function resetPointer(){pointer.x=0;pointer.y=0}

  function cleanup(){
    if(disposed)return;
    disposed=true;
    pause();
    observer?.disconnect();
    resizeObserver?.disconnect();
    document.removeEventListener('visibilitychange',onVisibility);
    window.removeEventListener('pagehide',cleanup);
    stage.removeEventListener('pointermove',onPointer);
    stage.removeEventListener('pointerleave',resetPointer);
    if(scene){
      const geometries=new Set();
      const materials=new Set();
      const textures=new Set();
      scene.traverse(object=>{
        if(object.isMesh){
          if(object.geometry)geometries.add(object.geometry);
          const m=object.material;
          (Array.isArray(m)?m:[m]).filter(Boolean).forEach(x=>materials.add(x));
        }
      });
      geometries.forEach(g=>g.dispose());
      materials.forEach(m=>{if(m.map)textures.add(m.map);m.dispose()});
      textures.forEach(texture=>texture.dispose());
    }
    if(renderer)renderer.dispose();
  }


  function createBadgeTexture(brand){
    // Branding is painted into a small local canvas: no external icon libraries
    // or model downloads and no additional rendering contexts.
    const surface=document.createElement('canvas');
    surface.width=256;surface.height=256;
    const ctx=surface.getContext('2d');
    if(!ctx)throw Error('2D icon texture unavailable');

    function roundRect(x,y,w,h,r){
      ctx.beginPath();
      ctx.roundRect(x,y,w,h,r);
    }
    // Semi-transparent gloss along the upper edge of each metal/glass tile.
    const wash=ctx.createLinearGradient(0,0,256,256);
    wash.addColorStop(0,'rgba(110,205,253,.20)');
    wash.addColorStop(.50,'rgba(22,60,92,.09)');
    wash.addColorStop(1,'rgba(7,25,39,.15)');
    roundRect(8,8,240,240,35);ctx.fillStyle=wash;ctx.fill();
    roundRect(15,15,226,226,30);
    ctx.strokeStyle='rgba(154,220,255,.44)';ctx.lineWidth=2;ctx.stroke();

    const accent=brand.color;
    if(brand.key==='JS'||brand.key==='TS'){
      roundRect(55,37,146,143,26);
      ctx.fillStyle=accent;ctx.fill();
      ctx.fillStyle=brand.key==='JS'?'#132027':'#ffffff';
      ctx.font='800 93px system-ui, Arial';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(brand.key,128,109);
    }else if(brand.key==='HTML'||brand.key==='CSS'){
      // Shield shape makes the familiar HTML/CSS identity recognizable.
      ctx.beginPath();
      ctx.moveTo(59,39);ctx.lineTo(197,39);ctx.lineTo(184,175);
      ctx.lineTo(128,198);ctx.lineTo(72,175);ctx.closePath();
      ctx.fillStyle=accent;ctx.fill();
      ctx.fillStyle='#ffffff';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.font='850 114px system-ui, Arial';
      ctx.fillText(brand.key==='HTML'?'5':'3',128,114);
    }else if(brand.key==='FIRE'){
      // Distinctive warm flame made entirely of simple vector paths.
      ctx.beginPath();ctx.moveTo(78,167);ctx.lineTo(111,42);
      ctx.lineTo(148,111);ctx.lineTo(176,77);
      ctx.lineTo(190,163);ctx.lineTo(131,199);ctx.closePath();
      ctx.fillStyle='#ffa928';ctx.fill();
      ctx.beginPath();ctx.moveTo(97,170);ctx.lineTo(148,111);
      ctx.lineTo(176,78);ctx.lineTo(170,167);ctx.lineTo(131,197);ctx.closePath();
      ctx.fillStyle='#ffdc73';ctx.fill();
    }else if(brand.key==='GIT'){
      ctx.save();ctx.translate(128,111);ctx.rotate(Math.PI/4);
      roundRect(-61,-61,122,122,23);ctx.fillStyle=accent;ctx.fill();
      ctx.restore();
      ctx.strokeStyle='#ffffff';ctx.lineWidth=9;ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(102,78);ctx.lineTo(102,155);ctx.lineTo(149,155);ctx.stroke();
      for(const [x,y] of [[102,78],[102,155],[149,155]]){
        ctx.beginPath();ctx.arc(x,y,10,0,Math.PI*2);ctx.fillStyle='#ffffff';ctx.fill();
      }
    }
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.font='700 22px system-ui, Arial';
    ctx.fillStyle='#d1e9fa';ctx.letterSpacing='1px';
    ctx.fillText(brand.label,128,222);

    const texture=new THREE.CanvasTexture(surface);
    texture.colorSpace=THREE.SRGBColorSpace;
    texture.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),4);
    return texture;
  }

  function addTechBadges(){
    const specs=[
      {key:'JS',label:'JAVASCRIPT',color:'#f7df1e',x:-1.94,y:1.45,z:.89,yaw:.17,roll:-.10},
      {key:'TS',label:'TYPESCRIPT',color:'#3178c6',x:-.32,y:2.04,z:.52,yaw:-.17,roll:.13},
      {key:'CSS',label:'CSS3',color:'#2196f3',x:1.94,y:1.29,z:.80,yaw:-.26,roll:.10},
      {key:'HTML',label:'HTML5',color:'#ed642e',x:-2.08,y:-.60,z:.82,yaw:.22,roll:-.12},
      {key:'FIRE',label:'FIREBASE',color:'#ffb32d',x:2.05,y:-.60,z:.84,yaw:-.17,roll:.13},
      {key:'GIT',label:'GIT',color:'#e86f52',x:1.01,y:-1.93,z:.65,yaw:-.10,roll:-.11}
    ];
    // Share one beveled extrusion and one matte-metal chassis material.
    const shape=new THREE.Shape();
    const width=.69,height=.78,radius=.105;
    const left=-width/2,bottom=-height/2,right=width/2,top=height/2;
    shape.moveTo(left+radius,bottom);
    shape.lineTo(right-radius,bottom);shape.quadraticCurveTo(right,bottom,right,bottom+radius);
    shape.lineTo(right,top-radius);shape.quadraticCurveTo(right,top,right-radius,top);
    shape.lineTo(left+radius,top);shape.quadraticCurveTo(left,top,left,top-radius);
    shape.lineTo(left,bottom+radius);shape.quadraticCurveTo(left,bottom,left+radius,bottom);
    const chassisGeometry=new THREE.ExtrudeGeometry(shape,{
      depth:.09,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.028,
      bevelThickness:.03,curveSegments:5
    });
    const chassisMaterial=new THREE.MeshPhysicalMaterial({
      color:0x13263b,metalness:.69,roughness:.22,clearcoat:1,
      clearcoatRoughness:.11
    });
    const imageGeometry=new THREE.PlaneGeometry(.65,.73);
    specs.forEach((spec,i)=>{
      const badge=new THREE.Group();
      badge.name='tech-badge-'+spec.key;
      const panel=new THREE.Mesh(chassisGeometry,chassisMaterial);
      badge.add(panel);
      const imageMaterial=new THREE.MeshBasicMaterial({
        map:createBadgeTexture(spec),transparent:true,side:THREE.FrontSide,
        depthWrite:false,toneMapped:false
      });
      const face=new THREE.Mesh(imageGeometry,imageMaterial);
      face.position.z=.125;
      badge.add(face);
      badge.position.set(spec.x,spec.y,spec.z);
      badge.rotation.set((i%2?-.13:.11),spec.yaw,spec.roll);
      badge.scale.setScalar(coarse?.87:1);
      badge.userData.origin=badge.position.clone();
      badge.userData.yaw=spec.yaw;
      badge.userData.pitch=badge.rotation.x;
      badge.userData.roll=spec.roll;
      // Fewer icons on extra-narrow viewports to keep React visually dominant.
      badge.userData.hideOnCompact=spec.key==='HTML'||spec.key==='GIT';
      atom?.updateMatrixWorld();
      scene.add(badge);
      techBadges.push(badge);
    });
    stage.dataset.iconCount=String(techBadges.length);
    stage.dataset.technologies=specs.map(s=>s.label).join(', ');
  }

  async function initialize(){
    if(initialized||loading||disposed)return;
    loading=true;
    try{
      THREE=await import('https://esm.sh/three@0.171.0?bundle');
      if(disposed||!stage.isConnected)return;
      canvas=document.createElement('canvas');
      canvas.className='react-hero-webgl';
      canvas.setAttribute('aria-hidden','true');
      slot.appendChild(canvas);
      renderer=new THREE.WebGLRenderer({
        canvas,alpha:true,antialias:!coarse,powerPreference:'low-power',depth:true
      });
      renderer.setClearColor(0x000000,0);
      renderer.outputColorSpace=THREE.SRGBColorSpace;
      renderer.toneMapping=THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure=1.4;

      scene=new THREE.Scene();
      camera=new THREE.PerspectiveCamera(37,1,.1,100);
      camera.position.set(0,0,8.1);
      camera.lookAt(0,0,0);
      scene.add(new THREE.HemisphereLight(0xd7f3ff,0x0b2036,2));
      const lights=[
        {color:0xeaf8ff,power:4,position:[-4,5,7]},
        {color:0x45b7ff,power:3,position:[4,-1,5]},
        {color:0xffb788,power:1.7,position:[3,3,-3]}
      ];
      lights.forEach(light=>{
        const source=new THREE.DirectionalLight(light.color,light.power);
        source.position.set(...light.position);
        scene.add(source);
      });

      // A genuine volumetric React atom: three elliptical, raised tube orbits
      // intersecting at 60-degree intervals, sharing a luminous central nucleus.
      atom=new THREE.Group();
      scene.add(atom);
      const orbitGeometry=new THREE.TorusGeometry(1.9,.104,15,132);
      const orbitColors=[0x65dfff,0x8be6fb,0x46b5e7];
      for(let i=0;i<3;i++){
        const orbitMaterial=new THREE.MeshPhysicalMaterial({
          color:orbitColors[i],metalness:.34,roughness:.14,
          clearcoat:1,clearcoatRoughness:.075,emissive:0x0c5d7f,
          emissiveIntensity:.28
        });
        const orbit=new THREE.Mesh(orbitGeometry,orbitMaterial);
        orbit.scale.set(1,.43,1);
        orbit.rotation.z=i*Math.PI/3;
        orbit.rotation.x=(i-1)*.1;
        orbit.rotation.y=(i-1)*.075;
        atom.add(orbit);
      }
      const nucleus=new THREE.Mesh(
        new THREE.SphereGeometry(.45,40,28),
        new THREE.MeshPhysicalMaterial({
          color:0x83eaff,metalness:.33,roughness:.09,clearcoat:1,
          clearcoatRoughness:.045,emissive:0x0d80a8,emissiveIntensity:.55
        })
      );
      nucleus.position.z=.11;
      atom.add(nucleus);
      const lightCore=new THREE.Mesh(
        new THREE.SphereGeometry(.28,30,20),
        new THREE.MeshBasicMaterial({color:0xa9f2ff,transparent:true,opacity:.22,depthWrite:false})
      );
      lightCore.position.z=.23;
      atom.add(lightCore);
      addTechBadges();

      canvas.addEventListener('webglcontextlost',event=>{
        event.preventDefault();
        contextLost=true;
        pause();
        stage.classList.remove('has-webgl');
      },false);
      canvas.addEventListener('webglcontextrestored',()=>{
        // A refresh is safer than trying to reuse invalidated GPU buffers.
        stage.classList.remove('has-webgl');
        contextLost=true;
      },false);

      initialized=true;
      resizeObserver=new ResizeObserver(layout);
      resizeObserver.observe(slot);
      layout();
      draw();
      if(observer?.heroVisible)start();
    }catch(error){
      console.warn('React 3D hero unavailable; keeping SVG alternative:',error);
      stage.classList.remove('has-webgl');
      cleanup();
      canvas?.remove();
    }finally{
      loading=false;
    }
  }

  observer=new IntersectionObserver(entries=>{
    const visible=!!entries[0]?.isIntersecting;
    observer.heroVisible=visible;
    if(visible){
      if(!initialized)initialize();
      else start();
    }else pause();
  },{rootMargin:'100px 0px',threshold:0});
  observer.observe(stage);
  document.addEventListener('visibilitychange',onVisibility,{passive:true});
  window.addEventListener('pagehide',cleanup,{once:true});
  stage.addEventListener('pointermove',onPointer,{passive:true});
  stage.addEventListener('pointerleave',resetPointer,{passive:true});
})();
