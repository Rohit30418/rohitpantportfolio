/**
 * Agency Process — real 3D sculpture timeline, not CSS faux depth.
 * One shared WebGL context, four physically lit objects, zero 3D model downloads.
 * Idle-time single-frame WebGL rendering, with CSS fallback for touch / low-power devices.
 */
import * as THREE from 'https://esm.sh/three@0.171.0?bundle';

const section=document.getElementById('process');
const flow=section?.querySelector('.agency-process-flow');
const anchors=flow?[...flow.querySelectorAll('.agency-process-art')]:[];
if(section && flow && anchors.length===4 && window.WebGLRenderingContext){
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse=matchMedia('(hover: none), (pointer: coarse)').matches;
  const connection=navigator.connection;
  const lowPower=!!(connection?.saveData || (navigator.deviceMemory && navigator.deviceMemory<3));
  const figures=[];
  let scene,camera,renderer,canvas,observer,resizeObserver;
  let idleHandle=0,delayHandle=0;
  let initialized=false,finished=false,ready=false,contextLost=false;
  let lastWidth=0,lastHeight=0,lastDpr=0;

  function createStudioEnvironment(){
    // A few luminous rectangular studio panels reflected in metal and glass.
    // This environment is generated once on the GPU, not fetched as a large HDR.
    const room=new THREE.Scene();
    room.background=new THREE.Color(0x172439);
    const panels=[
      {x:-3,y:4,z:3,w:3,h:6,c:0xd4ebff,r:.3},
      {x:4,y:2,z:1,w:2,h:6,c:0x679fdf,r:-.34},
      {x:0,y:-4,z:5,w:9,h:1.3,c:0xf6d6c6,r:0},
      {x:-1,y:0,z:-4,w:8,h:3,c:0x2a517f,r:0}
    ];
    const geometry=new THREE.PlaneGeometry(1,1);
    for(const p of panels){
      const panel=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({color:p.c,side:THREE.DoubleSide,toneMapped:false}));
      panel.position.set(p.x,p.y,p.z);
      panel.scale.set(p.w,p.h,1);
      panel.rotation.y=p.r;
      room.add(panel);
    }
    const generator=new THREE.PMREMGenerator(renderer);
    generator.compileEquirectangularShader();
    const target=generator.fromScene(room,0.07,0.1,25);
    scene.environment=target.texture;
    generator.dispose();
    room.traverse(object=>{if(object.isMesh)object.material.dispose()});
    geometry.dispose();
    return target;
  }

  function basePhysical(hex,options={}){
    return new THREE.MeshPhysicalMaterial({
      color:hex,metalness:.22,roughness:.13,clearcoat:1,clearcoatRoughness:.08,
      envMapIntensity:1.55,side:THREE.DoubleSide,...options
    });
  }

  function makeFigures(){
    // 01 / Understand — an actual volumetric, rim-lit optical cube.
    const cube=new THREE.Group();
    const cubeGeometry=new THREE.BoxGeometry(1.62,1.62,1.62);
    const cubeFace=new THREE.Mesh(cubeGeometry,basePhysical(0x62baf8,{metalness:.3,roughness:.12,transmission:.38,thickness:.9,ior:1.47,transparent:true,opacity:.84}));
    const cubeEdges=new THREE.LineSegments(new THREE.EdgesGeometry(cubeGeometry),new THREE.LineBasicMaterial({color:0x9bdbff,transparent:true,opacity:.9}));
    cube.add(cubeFace,cubeEdges);
    const inside=new THREE.Mesh(new THREE.BoxGeometry(.94,.94,.94),basePhysical(0x3579b9,{metalness:.5,roughness:.26,transparent:true,opacity:.21}));
    inside.rotation.y=.32;inside.rotation.z=.22;cube.add(inside);
    cube.rotation.set(.2,.42,-.18);
    figures.push(cube);

    // 02 / Design — two intersecting, physically shaded torus hoops.
    const rings=new THREE.Group();
    const torus=new THREE.TorusGeometry(1.05,.205,18,88);
    const first=new THREE.Mesh(torus,basePhysical(0x72adf7,{metalness:.76,roughness:.14,clearcoat:1,envMapIntensity:2.2}));
    first.rotation.set(.68,.38,.12);
    const second=new THREE.Mesh(torus,basePhysical(0x8fd8f3,{metalness:.5,roughness:.085,transmission:.17,thickness:.45,ior:1.4,envMapIntensity:2.1}));
    second.rotation.set(-.68,-.56,.33);
    rings.add(first,second);
    figures.push(rings);

    // 03 / Develop — a faceted 3D tetrahedron with refractive warm faces.
    const pyramid=new THREE.Group();
    const geo=new THREE.TetrahedronGeometry(1.55,0);
    const front=new THREE.Mesh(geo,basePhysical(0xe7ac98,{metalness:.46,roughness:.15,transmission:.17,thickness:.75,ior:1.49,flatShading:true,envMapIntensity:1.9}));
    front.rotation.set(.2,.2,-.11);
    const wire=new THREE.LineSegments(new THREE.EdgesGeometry(geo),new THREE.LineBasicMaterial({color:0xffd4bd,transparent:true,opacity:.45}));
    wire.rotation.copy(front.rotation);
    pyramid.add(front,wire);
    figures.push(pyramid);

    // 04 / Launch — glossy cobalt sphere with genuine environment reflections.
    const orb=new THREE.Group();
    const sphere=new THREE.Mesh(new THREE.SphereGeometry(1.11,48,32),basePhysical(0x2365d3,{
      metalness:.52,roughness:.12,clearcoat:1,clearcoatRoughness:.05,envMapIntensity:2.05
    }));
    orb.add(sphere);
    const orbit=new THREE.Mesh(
      new THREE.TorusGeometry(1.48,.012,5,100),
      new THREE.MeshBasicMaterial({color:0x65afff,transparent:true,opacity:.36,depthWrite:false})
    );
    orbit.rotation.set(.8,.35,-.38);
    orb.add(orbit);
    figures.push(orb);

    for(let i=0;i<figures.length;i++){
      const obj=figures[i];
      obj.userData.initialRotation=obj.rotation.clone();
      obj.userData.index=i;
      scene.add(obj);
    }
  }

  function layout(){
    if(!renderer||!camera||contextLost)return;
    const w=Math.max(2,Math.round(flow.clientWidth));
    const h=Math.max(2,Math.round(flow.clientHeight));
    const artHeight=anchors[0]?.getBoundingClientRect().height||178;
    const scale=Math.min(77,Math.max(49,artHeight*.40));
    camera.left=-w/(2*scale);camera.right=w/(2*scale);
    camera.top=h/(2*scale);camera.bottom=-h/(2*scale);
    camera.updateProjectionMatrix();
    const parent=flow.getBoundingClientRect();
    anchors.forEach((node,i)=>{
      const box=node.getBoundingClientRect();
      const x=(box.left+box.width/2-parent.left-w/2)/scale;
      const y=(h/2-(box.top+box.height/2-parent.top))/scale;
      figures[i].position.set(x,y,0);
      // Never let the 3D geometry collide with adjacent columns.
      figures[i].scale.setScalar(Math.min(1.08,Math.max(.76,(box.width-10)/190)));
    });
    const dpr=Math.min(window.devicePixelRatio||1,1.15);
    if(w!==lastWidth||h!==lastHeight||dpr!==lastDpr){
      renderer.setPixelRatio(dpr);
      renderer.setSize(w,h,false);
      lastWidth=w;lastHeight=h;lastDpr=dpr;
    }
    renderOnce();
  }

  function renderOnce(){
    if(!renderer||contextLost)return;
    renderer.render(scene,camera);
    if(!ready){
      section.classList.add('process-has-webgl');
      ready=true;
    }
  }

  function cleanup(){
    if(finished)return;
    finished=true;
    observer?.disconnect();resizeObserver?.disconnect();
    window.removeEventListener('resize',layout);
    if(idleHandle && 'cancelIdleCallback' in window)cancelIdleCallback(idleHandle);
    if(delayHandle)clearTimeout(delayHandle);
    window.removeEventListener('pagehide',cleanup);
    if(renderer){
      scene?.traverse(o=>{
        if(o.isMesh||o.isLineSegments){o.geometry?.dispose();if(Array.isArray(o.material))o.material.forEach(m=>m.dispose());else o.material?.dispose()}
      });
      scene?.environment?.dispose();
      renderer.dispose();
    }
  }
  function init(){
    if(initialized||finished)return;
    try{
      canvas=document.createElement('canvas');
      canvas.className='agency-process-webgl';
      canvas.setAttribute('aria-hidden','true');
      canvas.setAttribute('role','presentation');
      flow.prepend(canvas);
      renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:!coarse,powerPreference:'low-power'});
      renderer.setClearColor(0x000000,0);
      renderer.outputColorSpace=THREE.SRGBColorSpace;
      renderer.toneMapping=THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure=1.25;
      scene=new THREE.Scene();
      camera=new THREE.OrthographicCamera(-5,5,3,-3,.1,100);
      camera.position.set(0,0,18);
      camera.lookAt(0,0,0);
      scene.add(new THREE.AmbientLight(0x91b7ff,1.15));
      const key=new THREE.DirectionalLight(0xf5f9ff,3.3);key.position.set(-3,6,7);scene.add(key);
      const fill=new THREE.DirectionalLight(0x2f91ff,2.2);fill.position.set(5,-1,5);scene.add(fill);
      const warm=new THREE.DirectionalLight(0xffab7e,1.6);warm.position.set(2,3,-4);scene.add(warm);
      try{createStudioEnvironment()}catch(e){console.info('Studio reflections fallback:',e.message)}
      makeFigures();
      initialized=true;
      canvas.addEventListener('webglcontextlost',event=>{
        event.preventDefault();contextLost=true;section.classList.remove('process-has-webgl')
      },false);
      // Re-render only if the layout changes, never for scrolling.
      if('ResizeObserver' in window){
        resizeObserver=new ResizeObserver(()=>layout());
        resizeObserver.observe(flow);
      }else{
        window.addEventListener('resize',layout,{passive:true});
      }
      layout();
    }catch(error){
      console.warn('3D process unavailable; keeping CSS fallback:',error);
      section.classList.remove('process-has-webgl');
      cleanup();
      canvas?.remove();
    }
  }
  // Mobile, reduced-motion and low-power visitors see CSS 3D art and never
  // pay the WebGL cost. On desktop, GPU shaders compile at an idle moment
  // and render a single still frame; there is no continuous animation loop.
  if(!lowPower && !coarse && !reduced && 'IntersectionObserver' in window){
    let scheduled=false;
    const idleInit=()=>{
      idleHandle=0;
      if(!finished && !initialized && !document.hidden)init();
    };
    observer=new IntersectionObserver(entries=>{
      if(!entries[0]?.isIntersecting || initialized || scheduled)return;
      scheduled=true;
      if('requestIdleCallback' in window){
        idleHandle=requestIdleCallback(idleInit,{timeout:3500});
      }else{
        delayHandle=setTimeout(idleInit,350);
      }
      observer.disconnect();
    },{rootMargin:'600px 0px',threshold:0});
    observer.observe(section);
    window.addEventListener('pagehide',cleanup,{once:true});
  }
}
