(function(){
 'use strict';
 const q=s=>document.querySelector(s);
 const num=(v,d=0)=>new Intl.NumberFormat('fr-FR',{maximumFractionDigits:d}).format(v);
 const euro=v=>`${num(v)} €`;
 const signed=v=>`${v>0?'+':''}${euro(v)}`;
 const payback=v=>v===null?'Au-delà de 20 ans':`Vers ${v} ans`;
 let state,chartObserver;
 function warnings(r){
  const w=[];
  if(q('#home').value==='flat')w.push('En copropriété, les droits sur la toiture et les décisions collectives doivent être étudiés avant de recommander une offre.');
  if(r.orientation==='north')w.push('Une toiture orientée nord nécessite une étude spécifique.');
  if(r.shade==='high')w.push('Les ombres importantes doivent être mesurées avant tout dimensionnement.');
  if(!r.power)w.push('La surface disponible ne permet pas de proposer nos formats de 3, 6 ou 9 kWc avec les hypothèses retenues.');
  if(r.annual<2500)w.push('Une puissance inférieure à 3 kWc peut être plus pertinente pour cette consommation.');
  if(r.annual>15000)w.push('Votre consommation élevée nécessite une analyse plus précise des usages et de leur saisonnalité.');
  return w.map(x=>`<p class="result-warning">${x}</p>`).join('');
 }
 function render(r,chosen){
  chartObserver?.disconnect();
  state={r,h:{...window.MIDI_CONFIG.simulation.projection,pvCost:window.MIDI_CONFIG.offers.find(o=>o.power===r.power)?.priceTTC||0},compare:true,year:20};
  q('#sim-form').hidden=true;q('#sim-result').hidden=false;q('#simulateur').classList.add('has-results');
  q('#step-label').textContent='VOTRE PREMIER ÉCLAIRAGE';q('#progress-fill').style.width='100%';
  const choice=chosen&&!r.blocked?`Vous exploriez ${chosen} kWc. ${chosen===r.power?'Ce format reste une piste à vérifier.':`Le repère proposé ici est plutôt ${r.power} kWc.`}`:'';
  q('#sim-result').innerHTML=`<div class="sim-result-heading"><div><span class="result-badge">VOTRE APERÇU SOLAIRE · DÉMONSTRATION</span><h3 tabindex="-1">${r.blocked?'Faisons le point ensemble.':'Du soleil. Et des perspectives.'}</h3><p>${r.blocked?'Votre configuration mérite une étude dédiée avant de chiffrer une rentabilité.':'Voici une première projection. Après notre rendez-vous, votre étude solaire complète précisera ces repères.'}</p></div><span class="result-sun" aria-hidden="true">☀</span></div>${warnings(r)}${choice?`<p class="selection-note">${choice}</p>`:''}
  ${r.blocked?'':`<div class="solar-summary"><div><span>Une puissance à explorer</span><strong>${r.power} <small>kWc</small></strong><p>Midi Pile ${r.power} · sous réserve d’étude</p></div><div><span>Votre production annuelle</span><strong>≈ ${num(r.production)} <small>kWh</small></strong><p>Repère indicatif : ${num(r.production*.85)} à ${num(r.production*1.15)} kWh</p></div><div><span>Votre consommation renseignée</span><strong>${num(r.annual)} <small>kWh/an</small></strong><p>Équipements cochés déjà inclus</p></div></div>
  ${r.heating?'<p class="season-note">❄ Chauffage électrique pris en compte : davantage de besoins en hiver, lorsque les panneaux produisent moins. Une batterie décale des usages dans la journée ; elle ne stocke pas le soleil de l’été pour l’hiver.</p>':''}
  <div class="battery-switch"><label for="compare-battery"><input type="checkbox" id="compare-battery" checked><span><strong>Et si on ajoutait une batterie ?</strong><small>Afficher le comparatif avec / sans batterie · hypothèse de 5 kWh utiles</small></span></label><span class="switch-note">À explorer, sans engagement</span></div>
  <div class="comparison-cards" id="comparison-cards"></div>
  <section class="return-panel" aria-labelledby="return-title"><div class="return-heading"><div><p class="eyebrow">Votre horizon solaire</p><h4 id="return-title">Et dans 20 ans ?</h4></div><span class="chart-unit">Gains cumulés après coûts · €</span></div><p class="chart-explainer">Au départ, votre investissement. Ensuite, les achats d’électricité évités, moins les frais prévus. La ligne zéro indique quand les coûts sont compensés.</p><div class="chart-legend"><span class="legend-direct">Solaire seul</span><span class="legend-battery" id="battery-legend">Solaire + batterie</span></div><div id="return-chart" class="return-chart"></div><div class="year-control"><label for="projection-year">Explorez votre horizon <output id="projection-year-label">Année 20</output></label><input type="range" id="projection-year" min="0" max="20" step="1" value="20" aria-describedby="year-comparison"><div class="range-endpoints"><span>Aujourd’hui</span><span>Dans 20 ans</span></div></div><div class="year-comparison" id="year-comparison" role="status" aria-live="polite"></div><p class="chart-footnote">Les baisses ponctuelles correspondent aux renouvellements prévus. Projection indicative en euros courants, non actualisés ; ce n’est pas une garantie de rentabilité.</p></section>
  <div class="battery-verdict" id="battery-verdict"></div>
  <details class="projection-settings"><summary>Les hypothèses derrière ces courbes <span>Personnaliser +</span></summary><p>Les coûts ci-dessous sont des hypothèses de démonstration TTC, à remplacer par un devis. Aucune aide, aucun financement, aucune recette de surplus ni fiscalité ne sont intégrés. L’abonnement électrique reste inchangé.</p><form id="projection-settings"><div class="hypothesis-inputs"><label>Installation solaire (€ TTC)<input id="project-pv-cost" type="number" min="1" max="100000" step="1" required value="${state.h.pvCost}"></label><label>Batterie posée (€ TTC)<input id="project-battery-cost" type="number" min="0" max="50000" step="1" required value="${state.h.batteryCost}"></label><label>Renouvellement batterie, année 13 (€ TTC)<input id="project-battery-replacement" type="number" min="0" max="50000" step="1" required value="${state.h.batteryReplacement}"></label><label>Évolution annuelle du prix du kWh<select id="project-price-growth"><option value="0">0 % · prix constant</option><option value="0.02">+2 % · scénario exploratoire</option><option value="0.04">+4 % · scénario exploratoire</option></select></label></div><button class="button small" type="submit">Recalculer mes courbes ↗</button><p id="projection-feedback" role="status"></p></form><ul><li>Prix d’électricité saisi : ${num(r.price,3)} €/kWh TTC. Production de base : ${num(window.MIDI_CONFIG.simulation.yieldPerKwc)} kWh/kWc/an, pertes usuelles incluses ; facteurs orientation ${r.orientationFactor}, ombre ${r.shadeFactor} et pente ${r.tiltFactor}.</li><li>La commune n’est pas géocodée. Hypothèse de localisation en Vendée, sans relevé réel de toiture ni données météo. Les bornes ±15 % illustrent une incertitude, sans valeur statistique.</li><li>Puissance proposée : format 3/6/9 kWc le plus proche d’une production cible de 85 % de la consommation annuelle, avec 6 m²/kWc disponibles. Cette règle ne valide pas un dimensionnement.</li><li>Production répartie selon un profil mensuel illustratif. Consommation ${r.heating?'plus importante en hiver (profil de chauffage électrique)':'répartie uniformément sur les mois'}. Usage direct mensuel = minimum de production × ${num(r.baseShare*100)} % et de consommation × 70 %. Aucun calcul horaire.</li><li>Batterie : 5 kWh utiles, plafond de 220 cycles équivalents/an répartis sur les mois, rendement aller-retour 90 %, capacité réduite de 2 %/an. Charge limitée au surplus et aux besoins restants. Ce modèle mensuel peut surestimer le stockage réellement utilisable : les courbes de charge seront indispensables.</li><li>Production solaire : baisse conventionnelle de 0,5 %/an. Entretien : 80 €/an pour le solaire, 25 €/an supplémentaires avec batterie. Renouvellement de conversion : 1 200 € en année 12 ; batterie renouvelée en début d’année 13, capacité réinitialisée. Ce sont des provisions de scénario, pas des durées de vie garanties.</li><li>Gain cumulé = achats évités + recettes de surplus (0 € ici) − investissement initial − entretien − renouvellements. Les économies annuelles affichées sont des achats évités, avant ces coûts. La batterie réduit aussi le surplus disponible : une vente du surplus pourrait changer la comparaison.</li><li>Retour estimé : première année de fin d’exercice où le solde devient positif et le reste jusqu’à l’année 20, renouvellements inclus. Un retour initial peut être suivi d’une baisse ; la courbe permet de le voir.</li></ul><details class="annual-table"><summary>Voir les chiffres année par année</summary><div id="projection-table"></div></details></details>`}
  <div class="study-next"><div><strong>Le prochain déclic ? Une vraie étude de votre maison.</strong><p>Production locale, profil de consommation, équipements et devis : nous préciserons tout après un premier échange.</p></div><a class="button" href="/#rendez-vous" data-booking>Prendre rendez-vous ↗</a></div><button class="text-link" id="restart">← Modifier mes réponses</button>`;
  q('#restart').onclick=()=>{showStep(0);q('#simulateur').scrollIntoView({behavior:'smooth',block:'start'});};
  if(!r.blocked){
   q('#compare-battery').onchange=e=>{state.compare=e.target.checked;update();};
   q('#projection-year').oninput=e=>{state.year=Number(e.target.value);showYear();};
   q('#projection-settings').onsubmit=e=>{e.preventDefault();if(!e.target.reportValidity())return;state.h.pvCost=Number(q('#project-pv-cost').value);state.h.batteryCost=Number(q('#project-battery-cost').value);state.h.batteryReplacement=Number(q('#project-battery-replacement').value);state.h.priceGrowth=Number(q('#project-price-growth').value);update();q('#projection-feedback').textContent='Courbes recalculées avec vos hypothèses.';};
   update();
   if('ResizeObserver' in window){let lastWidth=q('#return-chart').clientWidth;chartObserver=new ResizeObserver(()=>{const width=q('#return-chart')?.clientWidth;if(width&&Math.abs(width-lastWidth)>1){lastWidth=width;drawChart();showYear();}});chartObserver.observe(q('#return-chart'));}
  }
  q('#sim-result h3').focus({preventScroll:true});
  q('#simulateur').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
 }
 function card(battery,p){
  const {r,h}=state, e=p.first;
  const used=e.direct+(battery?e.delivered:0),coverage=used/r.annual*100;
  const directPct=e.direct/r.annual*100,storedPct=battery?e.delivered/r.annual*100:0;
  return `<article class="scenario-card ${battery?'with-battery':'without-battery'}"><div class="scenario-title"><span class="scenario-icon" aria-hidden="true">${battery?'▰':'☀'}</span><h4>${battery?'Solaire + batterie':'Solaire seul'}</h4><span>${battery?'5 kWh utiles':'Sans stockage'}</span></div><p class="scenario-saving"><strong>${euro(battery?e.avoidedWith:e.avoidedWithout)}</strong><span>/ an</span></p><p class="saving-label">d’achats d’électricité évités en année 1</p><div class="coverage-title"><span>Vos besoins couverts par le solaire</span><strong>${num(coverage)} %</strong></div><div class="coverage-bar" role="img" aria-label="${num(directPct)} % de solaire direct${battery?`, ${num(storedPct)} % via la batterie`:''}, ${num(100-coverage)} % de réseau"><span style="width:${directPct}%"></span>${battery?`<i style="width:${storedPct}%"></i>`:''}</div><p class="coverage-caption">${num(directPct)} % en direct${battery?` + ${num(storedPct)} % via la batterie`:''} · reste : réseau</p><dl><div><dt>Investissement du scénario</dt><dd>${euro(h.pvCost+(battery?h.batteryCost:0))}</dd></div><div><dt>Gain après coûts à 20 ans</dt><dd>${signed(battery?p.last.withBattery:p.last.without)}</dd></div><div><dt>Retour estimé, renouvellements inclus</dt><dd>${payback(battery?p.paybackWith:p.paybackWithout)}</dd></div></dl></article>`;
 }
 function update(){
  const p=window.MidiSimulation.project(state.r,state.h);state.p=p;
  q('#comparison-cards').innerHTML=card(false,p)+(state.compare?card(true,p):'');
  q('#comparison-cards').classList.toggle('single-scenario',!state.compare);
  q('#battery-legend').hidden=!state.compare;
  const extra=p.first.avoidedWith-p.first.avoidedWithout,difference=p.last.withBattery-p.last.without;
  q('#battery-verdict').hidden=!state.compare;
  q('#battery-verdict').innerHTML=`<span aria-hidden="true">✦</span><div><strong>${difference>0?'La batterie améliore le bilan dans ce scénario.':'Moins d’achats au réseau ne veut pas toujours dire plus rentable.'}</strong><p>La batterie évite environ <b>${euro(extra)} d’achats supplémentaires la première année</b>. Après son coût, ses pertes et son renouvellement, le gain à 20 ans est ${euro(Math.abs(difference))} ${difference>=0?'plus élevé':'plus faible'} que pour le solaire seul. ${difference>=0?'Ce résultat reste à confirmer avec vos courbes de consommation et un devis.':'Le solaire seul est financièrement plus favorable avec ces hypothèses.'}</p></div>`;
  drawChart();showYear();
  q('#projection-table').innerHTML=`<table><caption>Gains cumulés après coûts, en euros</caption><thead><tr><th scope="col">Année</th><th scope="col">Solaire seul</th>${state.compare?'<th scope="col">Avec batterie</th>':''}</tr></thead><tbody>${p.rows.map(x=>`<tr><th scope="row">${x.year}</th><td>${euro(x.without)}</td>${state.compare?`<td>${euro(x.withBattery)}</td>`:''}</tr>`).join('')}</tbody></table>`;
 }
 function drawChart(){
  const rows=state.p.rows,values=rows.flatMap(x=>state.compare?[x.without,x.withBattery]:[x.without]);
  const low=Math.floor(Math.min(0,...values)/5000)*5000,high=Math.max(5000,Math.ceil(Math.max(0,...values)/5000)*5000);
  const width=Math.max(280,q('#return-chart').clientWidth||780),left=52,right=width-18;
  const x=year=>left+year/20*(right-left), y=v=>24+(high-v)/(high-low)*240;
  state.chart={x,y};
  const tickCount=width<420?3:5;
  const ticks=Array.from({length:tickCount},(_,i)=>low+(high-low)*i/(tickCount-1));
  const path=key=>rows.map((r,i)=>`${i?'L':'M'}${x(r.year).toFixed(2)},${y(r[key]).toFixed(2)}`).join(' ');
  const label=v=>`${num(v/1000,1)} k€`;
  q('#return-chart').innerHTML=`<svg viewBox="0 0 ${width} 300" role="img" aria-labelledby="projection-chart-title projection-chart-desc"><title id="projection-chart-title">Gains cumulés du projet solaire sur 20 ans${state.compare?', avec et sans batterie':''}</title><desc id="projection-chart-desc">Les courbes démarrent au coût de l’investissement, en négatif. À 20 ans, solaire seul : ${euro(state.p.last.without)}${state.compare?`, solaire avec batterie : ${euro(state.p.last.withBattery)}`:''}. Les données exactes sont disponibles avec le curseur et le tableau des hypothèses.</desc>${ticks.map(v=>`<line x1="${left}" y1="${y(v)}" x2="${right}" y2="${y(v)}" stroke="#dfe5da"/><text x="42" y="${y(v)+4}" text-anchor="end">${label(v)}</text>`).join('')}<line x1="${left}" y1="${y(0)}" x2="${right}" y2="${y(0)}" stroke="#74877d" stroke-dasharray="3 4"/><text x="60" y="${y(0)-7}" class="zero-label">Coûts compensés</text>${[0,5,10,15,20].map(v=>`<text x="${x(v)}" y="290" text-anchor="middle">${v===0?'Départ':v+' ans'}</text>`).join('')}<path class="chart-line direct-line" d="${path('without')}"/>${state.compare?`<path class="chart-line battery-line" d="${path('withBattery')}"/>`:''}<line id="chart-cursor" y1="24" y2="264" stroke="#0b3d3340"/><circle id="direct-cursor" r="6" fill="#0b3d33" stroke="white" stroke-width="2"/>${state.compare?'<circle id="battery-cursor" r="6" fill="#ac7600" stroke="white" stroke-width="2"/>':''}</svg>`;
 }
 function showYear(){
  const row=state.p.rows[state.year],{x,y}=state.chart;
  q('#projection-year-label').textContent=state.year===0?'Aujourd’hui':`Année ${state.year}`;
  q('#year-comparison').innerHTML=`<div><span>Solaire seul · ${state.year===0?'investissement initial':`gain à ${state.year} ans`}</span><strong>${signed(row.without)}</strong></div>${state.compare?`<div><span>Avec batterie · ${state.year===0?'investissement initial':`gain à ${state.year} ans`}</span><strong>${signed(row.withBattery)}</strong></div>`:''}`;
  q('#chart-cursor').setAttribute('x1',x(state.year));q('#chart-cursor').setAttribute('x2',x(state.year));
  q('#direct-cursor').setAttribute('cx',x(state.year));q('#direct-cursor').setAttribute('cy',y(row.without));
  if(state.compare){q('#battery-cursor').setAttribute('cx',x(state.year));q('#battery-cursor').setAttribute('cy',y(row.withBattery));}
 }
 window.MidiResults={render};
})();
