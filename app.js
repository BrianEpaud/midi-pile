'use strict';
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const fmt = (n, digits=0) => new Intl.NumberFormat('fr-FR',{maximumFractionDigits:digits}).format(n);
const config = window.MIDI_CONFIG;
const iconPaths = {
 panel:'<path d="M6 4 21 7 18 20 3 17 6 4ZM5 10l15 3M11 5 8 18M16 6l-3 13"/>',
 battery:'<rect x="5" y="4" width="14" height="18" rx="3"/><path d="M9 4V2h6v2M9 9h6M9 13h6M9 17h4"/>',
 plug:'<path d="M8 2v5M16 2v5M6 7h12v4a6 6 0 0 1-12 0V7ZM12 17v5"/>',
 home:'<path d="m2 11 10-8 10 8M5 9v12h14V9M9 21v-7h6v7"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 1v3M12 20v3M1 12h3M20 12h3M4 4l2 2M18 18l2 2M4 20l2-2M18 6l2-2"/>',
 grid:'<path d="M12 2v20M5 7h14M4 13h16M9 2 4 22M15 2l5 20M7 7l10 6M17 7 7 13"/>',
 pin:'<path d="M19 10c0 5-7 12-7 12S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
 person:'<circle cx="12" cy="7" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/>'
};
function renderIcons(root=document){root.querySelectorAll('[data-icon]').forEach(e=>e.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[e.dataset.icon]||iconPaths.sun}</svg>`);}
renderIcons();
const details={
 battery:{title:'Du soleil pour plus tard.',text:'Une batterie stocke une partie de votre surplus solaire pour le restituer quand vous en avez besoin. Elle se choisit selon l’énergie réellement disponible et vos usages du soir.',items:['La capacité utile s’exprime en kWh ; la puissance de charge et de décharge en kW.','Le coût, les pertes, les cycles et la garantie doivent entrer dans la comparaison.','Le secours en cas de coupure dépend d’une architecture dédiée ; il n’est pas automatique.','Une installation séparée est possible selon la compatibilité de vos équipements.'],cta:'Étudier mon besoin'},
 charger:{title:'Recharger, simplement.',text:'La borne se dimensionne avec votre véhicule, votre installation électrique et vos habitudes. Avec ou sans panneaux solaires.',items:['Adapter la puissance à celle réellement disponible chez vous.','Étudier le pilotage de charge pour éviter les dépassements.','Profiter du solaire lorsque le véhicule est présent et que la production est suffisante.','Préciser les travaux, les protections et les fonctions connectées dans le devis.'],cta:'Étudier mon besoin'},
 legal:{title:'Une maquette à explorer.',text:'Midi Pile est une entreprise en création. Lancement envisagé : novembre 2027. Cette page permet de tester le futur site ; elle ne constitue pas une offre commerciale.',items:['Les tarifs sont des montants de travail fournis par les fondateurs. Les projets illustratifs sont identifiés ; aucun avis Google réel ni certification n’est revendiqué.','Les estimations sont calculées localement, sans service de cartographie ni étude météorologique.','Le formulaire ne transmet aucune donnée. Aucun compte ni cookie publicitaire n’est utilisé par cette page.','Les mentions légales, conditions commerciales et informations de confidentialité définitives seront ajoutées avant la mise en service.']},
 credits:{title:'Des visuels pour se projeter.',text:'La maquette distingue les illustrations de véritables réalisations Midi Pile.',items:['Logo, halo, soleil et illustration de maison issus du kit officiel Midi Pile du 17 octobre 2026, sans modification de leur géométrie.','Maison solaire des expertises : visuel d’ambiance généré par IA. Vidéo du hero fournie pour la maquette : illustration d’une maison équipée, sans référence à un chantier Midi Pile.','Portraits des fondateurs : photographies fournies pour la maquette.','Photographie du professionnel : banque d’images Unsplash, image 1621905251189-08b45d6a269e ; ce n’est pas un membre de l’équipe.','Batterie : visuel fabricant Hoymiles HiOne. Recharge : photographie Solarwatt. Visuels de référence ; droits de reproduction commerciale à valider avant lancement. Schémas : illustrations de principe. Carte : france-geojson / IGN, Licence Ouverte.','Manrope, police libre sous licence SIL Open Font License, distribuée par Google Fonts.']}
};
function showDetail(key){const d=details[key];if(!d)return;$('#detail-content').innerHTML=`<p class="eyebrow">Pour y voir clair</p><h2>${d.title}</h2><p>${d.text}</p><ul class="detail-list">${d.items.map(x=>`<li>${x}</li>`).join('')}</ul>${d.cta?'<button class="button" id="detail-estimate">'+d.cta+' <span>↗</span></button>':''}`;$('#detail-dialog').showModal();$('#detail-estimate')?.addEventListener('click',()=>{$('#detail-dialog').close();$('#simulateur').scrollIntoView({behavior:'smooth'});});}
$$('[data-detail]').forEach(b=>b.addEventListener('click',()=>showDetail(b.dataset.detail)));
$$('.dialog-close').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
$$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
$('.menu').addEventListener('click',()=>{const open=$('#navigation').classList.toggle('open');$('.menu').setAttribute('aria-expanded',open);$('.menu').setAttribute('aria-label',open?'Fermer le menu':'Ouvrir le menu');$('.menu').textContent=open?'×':'☰';});
$$('#navigation a').forEach(a=>a.addEventListener('click',()=>{$('#navigation').classList.remove('open');$('.menu').setAttribute('aria-expanded','false');$('.menu').setAttribute('aria-label','Ouvrir le menu');$('.menu').textContent='☰';}));
let step=0,chosenPower=null;
function showStep(n,focus=true){step=n;$('#simulateur').classList.remove('has-results');$('#sim-form').hidden=false;$('#sim-result').hidden=true;$$('[data-step]').forEach((f,i)=>{f.hidden=i!==n;f.disabled=i!==n;});$('#step-label').textContent=`0${n+1} / 03`;$('#progress-fill').style.width=(n+1)*100/3+'%';$('#sim-back').hidden=n===0;$('#sim-next').innerHTML=n===2?'Voir mon estimation <span>↗</span>':'Continuer <span>→</span>';if(focus){const f=$(`[data-step="${n}"] legend`);f.tabIndex=-1;f.focus({preventScroll:true});}}
showStep(0,false);
$('#sim-back').addEventListener('click',()=>showStep(Math.max(0,step-1)));
$('#sim-form').addEventListener('submit',e=>{e.preventDefault();if(!$(`[data-step="${step}"]`).checkValidity())return;if(step<2){showStep(step+1);return;}renderResults();});
function calculate(){
 const annual=Number($('#consumption').value), price=config.simulation.defaultPrice, area=Number($('#roof-area').value)||null;
 const orientation=$('#orientation').value,shade=$('#shade').value,presence=$('#presence').value,tilt=30;
 const orientationFactor={unknown:.90,south:1,eastwest:.82,southeast:.95,north:.60}[orientation];
 const shadeFactor={unknown:.95,none:1,some:.85,high:.65}[shade];
 const tiltFactor=tilt===15?.96:tilt===45?.97:1;
 const yieldValue=config.simulation.yieldPerKwc*orientationFactor*shadeFactor*tiltFactor;
 const flexible=$('#ev-status').value==='existing'&&presence!=='away'?.04:0;
 const baseShare={mixed:.46,day:.58,away:.31}[presence]+flexible;
 const candidates=[2,3,6,9].filter(p=>!area||p*config.simulation.roofAreaPerKwc<=area);
 const target=annual*.85/yieldValue;
 const power=candidates.length?candidates.reduce((a,b)=>Math.abs(a-target)<=Math.abs(b-target)?a:b):null;
 const blocked=shade==='high'||orientation==='north'||power===null||annual<1500;
 const production=power?Math.round(power*yieldValue):0;
 const heating=$('#heating').value==='electric';
 const r={annual,price,area,orientation,shade,tilt,presence,yieldValue,orientationFactor,shadeFactor,tiltFactor,baseShare,power,blocked,production,heating};
 const e=window.MidiSimulation.energy(r,1,config.simulation.projection);
 return {...r,selfConsumed:e.direct,autoconsumption:production?e.direct/production*100:0,coverage:e.direct/annual*100,surplus:e.exportWithout,saving:e.direct*price};
}
function renderResults(){window.MidiResults.render(calculate(),chosenPower);}

$('#contact-open').onclick=()=>$('#contact-dialog').showModal();$('#contact-form').onsubmit=e=>{e.preventDefault();$('#contact-feedback').textContent='Démonstration réussie : le formulaire est valide. Aucun message n’a été envoyé et aucune donnée n’a été enregistrée.';};
if(false&&'IntersectionObserver'in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('reveal');observer.unobserve(e.target);}}),{threshold:.12});$$('.section-heading,.offer,.method-grid article,.guide-cover').forEach(e=>observer.observe(e));}

// Une sélection depuis une page activité suit le même parcours de simulation.
const requestedPower=Number(new URLSearchParams(location.search).get('offre'));
if([2,3,6,9].includes(requestedPower)){chosenPower=requestedPower;$('#selection-note').hidden=false;$('#selection-note').textContent=`Vous explorez Midi Pile ${requestedPower} (${requestedPower} kWc). Vérifions ensemble si cette puissance est adaptée.`;}
