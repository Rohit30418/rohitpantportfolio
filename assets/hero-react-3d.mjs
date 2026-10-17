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

  let renderer,scene,camera,atom,observer,resizeObserver,canvas;
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
    camera.updateProjectionMatrix();
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
      scene.traverse(object=>{
        if(object.isMesh){
          if(object.geometry)geometries.add(object.geometry);
          const m=object.material;
          (Array.isArray(m)?m:[m]).filter(Boolean).forEach(x=>materials.add(x));
        }
      });
      geometries.forEach(g=>g.dispose());
      materials.forEach(m=>m.dispose());
    }
    if(renderer)renderer.dispose();
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
