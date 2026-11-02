import * as THREE from './assets/vendor/three.module.js';

const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const chapters = window.SU_DANG_DATA.chapters;
let staticMode = reduced || !window.gsap || !window.ScrollTrigger;
if (staticMode) document.body.classList.add('story-static');
const gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
document.body.classList.toggle('story-static',staticMode||!gsap||!ScrollTrigger);
if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

let renderer, scene, camera, emblem, ribbon, heroScroll = 0, scrollTarget = 0, pointer = {x:0,y:0}, visible = true, inHero = true;
const disposable = [];
try {
  if (!reduced) {
    renderer = new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.7)); renderer.setSize(document.documentElement.clientWidth,innerHeight);
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    $('#story-webgl').append(renderer.domElement);
    scene = new THREE.Scene(); camera = new THREE.PerspectiveCamera(38,document.documentElement.clientWidth/innerHeight,.1,70); camera.position.set(0,0,10);
    scene.add(new THREE.HemisphereLight(0xffedc7,0x37121b,3.2));
    for(const [color,intensity,x,y,z] of [[0xffedc3,5,4,5,7],[0xd99d56,4,-5,-2,4],[0xffffff,2,0,2,-3]]){ const light=new THREE.DirectionalLight(color,intensity);light.position.set(x,y,z);scene.add(light); }
    const gold = new THREE.MeshStandardMaterial({color:0xcda85d,metalness:.88,roughness:.3});
    const darkGold = new THREE.MeshStandardMaterial({color:0x8b592c,metalness:.85,roughness:.5});
    const red = new THREE.MeshStandardMaterial({color:0x6f202b,metalness:.12,roughness:.85,side:THREE.DoubleSide});
    emblem = new THREE.Group(); scene.add(emblem);
    const star = new THREE.Shape();
    for(let i=0;i<10;i++){const a=Math.PI/2+i*Math.PI/5,r=i%2?.59:1.35;const x=Math.cos(a)*r,y=Math.sin(a)*r;i?star.lineTo(x,y):star.moveTo(x,y);} star.closePath();
    const starMesh=new THREE.Mesh(new THREE.ExtrudeGeometry(star,{depth:.18,bevelEnabled:true,bevelThickness:.07,bevelSize:.055,bevelSegments:4,steps:1}),gold);starMesh.position.z=.18; emblem.add(starMesh);
    const disc=new THREE.Mesh(new THREE.CylinderGeometry(1.8,1.8,.16,100),red);disc.rotation.x=Math.PI/2;emblem.add(disc);
    for(const radius of [1.83,2.08,2.32]){const ring=new THREE.Mesh(new THREE.TorusGeometry(radius,.018,10,160),gold);ring.position.z=.14;emblem.add(ring);}
    for(let i=0;i<48;i++){const a=i*Math.PI/24;const tick=new THREE.Mesh(new THREE.BoxGeometry(i%4===0?.022:.012,i%4===0?.14:.06,.025),i%4===0?gold:darkGold);tick.position.set(Math.sin(a)*2.2,Math.cos(a)*2.2,.15);tick.rotation.z=-a;emblem.add(tick);}
    const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(-6,-3,-2),new THREE.Vector3(-3,1,-1.8),new THREE.Vector3(0,-2,-1.5),new THREE.Vector3(3,1.8,-2),new THREE.Vector3(7,-1,-3)]);
    ribbon=new THREE.Mesh(new THREE.TubeGeometry(curve,150,.018,7,false),gold);scene.add(ribbon);
    const loader=new THREE.TextureLoader();loader.load('/assets/archive/paper-texture.jpg',texture=>{texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(2,2);gold.roughnessMap=texture;gold.bumpMap=texture;gold.bumpScale=.012;gold.needsUpdate=true;red.bumpMap=texture;red.bumpScale=.025;red.needsUpdate=true;});const photoSpecs=[['viet-minh-1940s.jpg',-3.7,.5,-1.8,-.16],['ba-dinh-1945.jpg',3.6,1.6,-2,.15],['letter-1946.png',2.6,-2.3,-2.8,.12]];
    photoSpecs.forEach(([name,x,y,z,rotation])=>loader.load('/assets/archive/'+name,texture=>{texture.colorSpace=THREE.SRGBColorSpace;const portrait=name.includes('ba-dinh')||name.includes('letter'),w=portrait?1.3:2.2,h=portrait?1.65:1.45;const group=new THREE.Group();const mat=new THREE.MeshBasicMaterial({color:0xe3d3b1});const backing=new THREE.Mesh(new THREE.BoxGeometry(w+.12,h+.15,.045),mat);const face=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:texture}));face.position.z=.03;group.add(backing,face);group.position.set(x,y,z);group.rotation.set(.06,rotation,rotation);emblem.add(group);disposable.push(texture,mat);}));
    emblem.rotation.set(.1,-.18,-.05);
    document.documentElement.dataset.webgl='ready';
    let last=0;
    function frame(now){requestAnimationFrame(frame);if(!visible||!inHero||staticMode||now-last<28)return;last=now;heroScroll+=(scrollTarget-heroScroll)*.07;emblem.rotation.y=-.18+heroScroll*1.9+pointer.x*.15;emblem.rotation.x=.1+heroScroll*.5+pointer.y*.08;emblem.rotation.z=-.05+heroScroll*.18;emblem.position.y=.12-heroScroll*.5;emblem.scale.setScalar((innerWidth<760?.65:.9)*(1-heroScroll*.55));camera.position.z=10-heroScroll*2;camera.position.x=heroScroll*2;emblem.position.x=-heroScroll*1.7;ribbon.rotation.z=-heroScroll*.3;renderer.render(scene,camera);}
    requestAnimationFrame(frame);
    addEventListener('resize',()=>{camera.aspect=document.documentElement.clientWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(document.documentElement.clientWidth,innerHeight);});
    addEventListener('pointermove',e=>{pointer.x=e.clientX/innerWidth-.5;pointer.y=e.clientY/innerHeight-.5;},{passive:true});
    document.addEventListener('visibilitychange',()=>visible=!document.hidden);
    const heroObserver=new IntersectionObserver(entries=>{for(const e of entries)if(e.target===$('.story-hero')){inHero=e.isIntersecting;$('#story-webgl').style.opacity=e.isIntersecting?'1':'0';}},{threshold:0});heroObserver.observe($('.story-hero'));
  }
} catch (error) { document.documentElement.dataset.webgl='fallback'; console.warn('3D unavailable; archive imagery remains visible.',error.message); }

function setupMotion(){
  if(!gsap||!ScrollTrigger||staticMode)return;
  ScrollTrigger.create({trigger:$('.story-hero'),start:'top top',end:'bottom top',onUpdate:self=>scrollTarget=self.progress});
  gsap.to('.monument-title span:first-child',{xPercent:-45,yPercent:-45,opacity:0,scrollTrigger:{trigger:'.story-hero',start:'top top',end:'75% top',scrub:.8}});
  gsap.to('.monument-title span:last-child',{xPercent:45,yPercent:45,opacity:0,scrollTrigger:{trigger:'.story-hero',start:'top top',end:'75% top',scrub:.8}});
  gsap.to('.hero-caption,.hero-edition,.hero-side-note,.hero-edge-date',{opacity:0,y:-50,scrollTrigger:{trigger:'.story-hero',start:'15% top',end:'50% top',scrub:.7}});
  for(const element of $$('.history-chapter')){
    const chapter=chapters.find(c=>c.id===element.dataset.chapter);
    const articles=[...element.querySelectorAll('.history-beat')];element.classList.add('is-live');
    gsap.set(articles,{opacity:0,x:-32});gsap.set(articles[0],{opacity:1,x:0});articles.forEach((a,i)=>a.setAttribute('aria-hidden',i?'true':'false'));
    let current=-1;const dates={c1:['1858','1911','1930','1930','1931','1935','1936','1941','1944','1945','1945','1945'],c2:['1945','1946','1954','1954','1954','1961','1975','1975'],c3:['1976','1976','1982','1986','1991','1996','2001','2006','2011','2016','2021','2021']};
    ScrollTrigger.create({trigger:element,start:'top top',end:'bottom bottom',onUpdate:self=>{
      const p=self.progress,index=Math.min(articles.length-1,Math.floor(p*articles.length));
      const photo=element.querySelector('.archive-photo'),documentPage=element.querySelector('.chapter-document');
      photo.style.transform=`translate3d(${Math.sin(p*Math.PI*2)*25}px,${-p*30}px,${p*90}px) rotateY(${-12+p*23}deg) rotateZ(${5-p*11}deg)`;
      documentPage.style.transform=`translateY(${-p*35}px) rotateZ(${-12+p*18}deg) rotateY(${12-p*20}deg)`;
      element.querySelector('.chapter-ghost').style.transform=`translateX(${-p*10}%)`;
      element.querySelector('.chapter-track i').style.width=(p*100)+'%';
      if(index!==current){current=index;element.querySelector('.chapter-ghost').textContent=dates[chapter.id][index];element.querySelector('.date-seal').textContent=dates[chapter.id][index];let image,caption;if(chapter.id==='c1'&&index>=10){image='ba-dinh-1945.jpg';caption='Lễ đài tại Quảng trường Ba Đình, 2/9/1945.';}else if(chapter.id==='c2'&&index===0){image='letter-1946.png';caption='Thư Hồ Chí Minh gửi Tổng thống Truman, 28/2/1946. NARA.';}else if(chapter.id==='c2'&&index>=6||chapter.id==='c3'&&index<3){image='saigon-1975.jpg';caption='Xe tăng quân Giải phóng tiến vào Dinh Độc Lập, 30/4/1975. Trần Mai Hưởng/TTXVN.';}else if(chapter.id==='c3'){image='congress-1986.jpg';caption='Đại hội VI, 15–18/12/1986. Ảnh: TTXVN.';}else if(chapter.id==='c2'){image='dien-bien-1954.jpg';caption='Khung hình phim tư liệu về Điện Biên Phủ, 1954.';}else{image='viet-minh-1940s.jpg';caption='Võ Nguyên Giáp cùng lực lượng Việt Minh. Tư liệu thập niên 1940.';}if(!photo.querySelector('img').src.endsWith(image)){photo.querySelector('img').src='/assets/archive/'+image;gsap.fromTo(photo.querySelector('img'),{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0% 0 0)',duration:.7,ease:'power2.out'});}photo.querySelector('img').alt=caption;photo.querySelector('figcaption').textContent=caption;articles.forEach((a,i)=>{a.setAttribute('aria-hidden',i===index?'false':'true');a.style.pointerEvents=i===index?'auto':'none';});gsap.to(articles,{opacity:0,x:-28,duration:.3,overwrite:true});gsap.fromTo(articles[index],{opacity:0,x:30},{opacity:1,x:0,duration:.5,overwrite:true,ease:'power2.out'});element.querySelector('.beat-count').textContent=`${index+1} / ${articles.length}`;documentPage.src='/assets/pages/'+chapter.sections[index].pages[0]+'.png';documentPage.alt='Trang nguồn '+chapter.sections[index].pages[0]+' của giáo trình';}
    }});
    gsap.fromTo(element.querySelector('.chapter-stage'),{clipPath:'inset(6% 7% round 10px)'},{clipPath:'inset(0% 0% round 0px)',scrollTrigger:{trigger:element,start:'top 95%',end:'top top',scrub:.7}});const folio=element.querySelector('.scene-folio');gsap.fromTo(folio,{y:90,rotationZ:6},{y:0,rotationZ:0,scrollTrigger:{trigger:element,start:'top 90%',end:'top top',scrub:.7}});
  }
  gsap.from('.prologue-links a',{y:30,opacity:0,stagger:.15,scrollTrigger:{trigger:'.prologue-links',start:'top 90%',end:'bottom 65%',scrub:1}});
  $$('.conclusion-notes article').forEach((a,i)=>gsap.from(a,{y:45,x:i%2?30:-30,opacity:.3,scrollTrigger:{trigger:a,start:'top 95%',end:'top 65%',scrub:.8}}));
}
setupMotion();
const chapterObserver=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){const id=e.target.id;$$('.story-rail a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+id));}},{rootMargin:'-35% 0px -35% 0px'});
for(const s of $$('#mo-dau,#c1,#c2,#c3,#ket-luan'))chapterObserver.observe(s);
$('#motion-toggle').setAttribute('aria-pressed',staticMode);
$('#motion-toggle').addEventListener('click',()=>{staticMode=!staticMode;document.body.classList.toggle('story-static',staticMode);$('#motion-toggle').setAttribute('aria-pressed',staticMode);$('#motion-toggle').textContent=staticMode?'Bật lại chuyển động':'Chế độ đọc tĩnh';if(staticMode){ScrollTrigger?.getAll().forEach(t=>t.disable(false));gsap?.set('.history-beat',{clearProps:'opacity,transform,visibility'});gsap?.set('.monument-title span,.hero-caption,.hero-edition,.hero-side-note,.hero-edge-date',{clearProps:'opacity,transform'});$$('.history-beat').forEach(a=>a.removeAttribute('aria-hidden'));}else{location.reload();}});
document.fonts.ready.then(()=>{ScrollTrigger?.refresh();if(location.hash){const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(target){const style=document.documentElement.style;style.scrollBehavior='auto';target.scrollIntoView();style.removeProperty('scroll-behavior');}}});
