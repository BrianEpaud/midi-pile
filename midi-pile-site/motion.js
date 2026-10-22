(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const root=document.documentElement;
  const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches||root.classList.contains('motion-reduced');
  const hero=$('.cinema-hero'),video=$('#hero-video'),videoButton=$('#hero-motion');
  let heroVisible=true,userPaused=false,explicitPlay=false,videoReady=false;
  function reflectVideo(){
    const running=!video.paused;
    videoButton.setAttribute('aria-pressed',String(running));
    videoButton.textContent=running?'Ⅱ Pause':'▶ Lire la vidéo';
    videoButton.setAttribute('aria-label',running?'Mettre en pause la vidéo de fond':'Lire la vidéo de fond');
    hero.classList.toggle('is-paused',!running);
  }
  async function manageVideo(){
    const mobile=matchMedia('(max-width: 620px)').matches;
    const saveData=Boolean(navigator.connection?.saveData);
    const canPlay=!reduced()&&!userPaused&&heroVisible&&!document.hidden&&((!mobile&&!saveData)||explicitPlay);
    videoButton.disabled=reduced();
    if(reduced())videoButton.setAttribute('aria-label','Animation désactivée selon vos préférences de mouvement');
    if(!canPlay){video.pause();reflectVideo();return;}
    if(!videoReady){video.src=video.dataset.src;videoReady=true;video.load();}
    try{await video.play();}catch{reflectVideo();}
  }
  if(video){
    video.muted=true;
    video.addEventListener('playing',()=>{video.classList.add('ready');reflectVideo();});
    video.addEventListener('pause',reflectVideo);
    video.addEventListener('error',()=>{video.classList.remove('ready');videoButton.textContent='Image fixe';videoButton.disabled=true;hero.classList.add('is-paused');});
    videoButton.addEventListener('click',()=>{if(video.paused){explicitPlay=true;userPaused=false;}else{userPaused=true;}manageVideo();});
    if('IntersectionObserver'in window)new IntersectionObserver(entries=>{heroVisible=entries[0].isIntersecting;manageVideo();},{threshold:.05}).observe(hero);
    else manageVideo();
    document.addEventListener('visibilitychange',manageVideo);
  }

  // Scènes indépendantes et fictives : conservation des puissances, pas de calcul de charge journalier.
  const scenes=[
    {hour:'08',period:'Le réveil',title:'La maison\ns’éveille.',copy:'Le soleil commence à produire. Le réseau complète les besoins du petit-déjeuner.',solar:.8,house:1.4,car:0,battery:0,batteryMode:'idle',grid:.6,gridMode:'import',theme:'morning',equation:'0,8 kW solaires + 0,6 kW du réseau = 1,4 kW pour la maison.'},
    {hour:'12',period:'Au zénith',title:'Le soleil\ndonne le tempo.',copy:'La maison utilise l’énergie solaire. Le surplus peut charger la batterie et le véhicule.',solar:4,house:1.2,car:.8,battery:1.5,batteryMode:'charge',grid:.5,gridMode:'export',theme:'day',equation:'4 kW = 1,2 kW maison + 0,8 kW recharge + 1,5 kW stockés + 0,5 kW injecté.'},
    {hour:'18',period:'Le retour à la maison',title:'Le soleil baisse.\nLa vie continue.',copy:'La production diminue. Dans cette scène, une batterie encore chargée complète le solaire.',solar:.6,house:2,car:0,battery:1.4,batteryMode:'discharge',grid:0,gridMode:'idle',theme:'dusk',equation:'0,6 kW solaires + 1,4 kW de la batterie = 2 kW pour la maison.'},
    {hour:'22',period:'La soirée',title:'Du soleil,\nmême après le soleil.',copy:'La batterie restitue une partie de l’énergie stockée. Le réseau apporte le complément.',solar:0,house:2,car:0,battery:1.5,batteryMode:'discharge',grid:.5,gridMode:'import',theme:'night',equation:'1,5 kW de la batterie + 0,5 kW du réseau = 2 kW pour la maison.'}
  ];
  const board=$('#energy-board');let current=1,cycle=null,boardVisible=true;
  const number=n=>new Intl.NumberFormat('fr-FR',{minimumFractionDigits:1,maximumFractionDigits:1}).format(n);
  const explanations={
    solar:s=>s.solar?`À ${s.hour} h dans ce scénario, les panneaux fournissent ${number(s.solar)} kW. L’onduleur transforme leur courant continu en courant alternatif pour la maison.`:'La nuit, les panneaux ne produisent pas. La maison utilise alors la batterie, si elle dispose d’énergie, et le réseau.',
    house:s=>`La maison utilise ici ${number(s.house)} kW. ${s.car?'Le véhicule utilise séparément '+number(s.car)+' kW. ':''}Ce sont des puissances instantanées fictives, pas une consommation annuelle.`,
    battery:s=>s.batteryMode==='charge'?`La batterie reçoit ici ${number(s.battery)} kW de surplus. Cela suppose qu’elle peut encore se charger et que sa puissance le permet. Les pertes ne sont pas représentées.`:s.batteryMode==='discharge'?`La batterie fournit ici ${number(s.battery)} kW. Cela suppose une réserve d’énergie disponible. Une fois cette réserve atteinte, le réseau prend le relais.`:'La batterie est au repos dans cette scène. Son fonctionnement réel dépend de son niveau de charge, de ses réglages et des puissances disponibles.',
    charger:s=>s.car?`Le véhicule est branché et reçoit ${number(s.car)} kW de solaire dans cette scène illustrative. L’utilisation du surplus dépend du véhicule, de la borne et de son pilotage.`:'Aucune recharge du véhicule n’est représentée à cet instant. Une borne peut aussi recharger depuis le réseau, avec ou sans panneaux solaires.',
    grid:s=>s.gridMode==='export'?`Le surplus de ${number(s.grid)} kW rejoint le réseau, sous réserve du raccordement et du contrat appropriés.`:s.gridMode==='import'?`Le réseau apporte les ${number(s.grid)} kW qui manquent à la maison. Cela illustre son rôle de complément.`:'Dans cet instant fictif, le solaire et la batterie couvrent exactement les besoins représentés. Cela ne signifie pas une autonomie permanente.'
  };
  function flowState(id,amount,reverse){const p=$(id);p.classList.toggle('inactive',amount===0);p.classList.toggle('reverse',Boolean(reverse));}
  function setScene(index){
    current=index;const s=scenes[index];
    board.classList.remove('night','dusk','morning');if(s.theme!=='day')board.classList.add(s.theme);
    $('#scene-time').textContent=s.hour;$('#scene-period').textContent=s.period;
    $('#scene-title').replaceChildren(...s.title.split('\n').flatMap((line,i)=>i?[document.createElement('br'),document.createTextNode(' '+line)]:[document.createTextNode(line)]));
    $('#scene-copy').textContent=s.copy;$('#scene-equation').textContent=s.equation;
    $('#energy-status').textContent=s.theme==='day'?'La production se répartit entre les usages.':s.theme==='night'?'La batterie et le réseau prennent le relais.':s.theme==='morning'?'Le réseau complète les premiers rayons.':'La batterie accompagne la fin de journée.';
    $('#energy-hour').value=index;$('#energy-hour').setAttribute('aria-valuetext',`${s.hour} heures, ${s.period}`);
    $$('[data-time]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.time)===index)));
    const values={solar:s.solar,uses:s.house+s.car,battery:s.battery,grid:s.grid};
    for(const [key,value]of Object.entries(values))$(`[data-flow-value="${key}"]`).textContent=number(value);
    $('[data-flow-label="uses"]').textContent=s.car?'Maison + recharge':'Usages de la maison';
    $('[data-flow-label="battery"]').textContent=s.batteryMode==='charge'?'Vers la batterie':s.batteryMode==='discharge'?'Depuis la batterie':'Batterie au repos';
    $('[data-flow-label="grid"]').textContent=s.gridMode==='export'?'Vers le réseau':s.gridMode==='import'?'Depuis le réseau':'Réseau au repos';
    flowState('#flow-house',s.house,false);flowState('#flow-solar',s.solar,false);flowState('#flow-battery',s.battery,s.batteryMode==='discharge');flowState('#flow-car',s.car,false);flowState('#flow-grid',s.grid,s.gridMode==='import');
    const selected=$('[data-energy][aria-pressed="true"]');
    $('#energy-explanation').textContent=selected?explanations[selected.dataset.energy](s):s.equation+' Explorez un équipement pour comprendre son rôle.';
  }
  function stopCycle(){clearInterval(cycle);cycle=null;$('#energy-play').textContent='▶ Lire la journée';$('#energy-play').setAttribute('aria-pressed','false');}
  function startCycle(){if(reduced()||!boardVisible||document.hidden)return;$('#energy-play').textContent='Ⅱ Mettre en pause';$('#energy-play').setAttribute('aria-pressed','true');cycle=setInterval(()=>setScene((current+1)%scenes.length),5000);}
  if(board){
    // Les commandes de cette nouvelle scène remplacent les deux anciens presets.
    $('#day').onclick=null;$('#night').onclick=null;
    $$('[data-time]').forEach(b=>b.addEventListener('click',()=>{stopCycle();setScene(Number(b.dataset.time));}));
    $('#energy-hour').addEventListener('input',e=>{stopCycle();setScene(Number(e.target.value));});
    $('#energy-play').addEventListener('click',()=>cycle?stopCycle():startCycle());
    $$('[data-energy]').forEach(b=>b.addEventListener('click',()=>{stopCycle();$$('[data-energy]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$('.scene-wrap').dataset.highlight=b.dataset.energy;$('#energy-explanation').textContent=explanations[b.dataset.energy](scenes[current]);}));
    if('IntersectionObserver'in window)new IntersectionObserver(entries=>{boardVisible=entries[0].isIntersecting;if(!boardVisible)stopCycle();board.classList.toggle('scene-idle',!boardVisible);},{threshold:.08}).observe(board);
    document.addEventListener('visibilitychange',()=>{if(document.hidden)stopCycle();});
    setScene(1);
  }
  function motionPreference(){
    if(video)manageVideo();
    if(board){if(reduced())stopCycle();$('#energy-play').disabled=reduced();$('#energy-play').title=reduced()?'Utilisez les boutons horaires : mouvement réduit selon vos préférences.':'';}
  }
  new MutationObserver(motionPreference).observe(root,{attributes:true,attributeFilter:['class']});
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',motionPreference);
  motionPreference();
  const progress=document.createElement('div');progress.className='scroll-progress';progress.setAttribute('aria-hidden','true');document.body.append(progress);
  let progressFrame=false;
  const updateProgress=()=>{const max=root.scrollHeight-innerHeight;progress.style.setProperty('--read-progress',max>0?String(Math.min(1,Math.max(0,scrollY/max))):'0');progressFrame=false;};
  addEventListener('scroll',()=>{if(!progressFrame){progressFrame=true;requestAnimationFrame(updateProgress);}},{passive:true});
  addEventListener('resize',updateProgress);updateProgress();
})();
