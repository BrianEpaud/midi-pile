/* Modèle pédagogique : toutes les valeurs économiques sont des hypothèses, pas des tarifs. */
(function(root){
 'use strict';
 const solarMonths=[.04,.055,.085,.11,.125,.13,.13,.115,.09,.06,.035,.025];
 const winterMonths=[.15,.13,.115,.085,.06,.045,.04,.045,.06,.075,.09,.105];
 function energy(r, year, h){
  const production=r.production*Math.pow(1-h.pvDegradation,year-1);
  const batteryAge=(year-1)%h.batteryLife;
  const capacity=h.batteryCapacity*Math.pow(1-h.batteryDegradation,batteryAge);
  let direct=0,stored=0,delivered=0;
  for(let m=0;m<12;m++){
   const p=production*solarMonths[m];
   const demand=r.annual*(r.heating?winterMonths[m]:1/12);
   const d=Math.min(p*r.baseShare,demand*.7);
   // Un plafond mensuel ne remplace pas une simulation horaire : scénario exploratoire.
   const charge=Math.max(0,Math.min(p-d,(demand-d)/h.batteryEfficiency,capacity*h.batteryCycles/12));
   direct+=d;stored+=charge;delivered+=charge*h.batteryEfficiency;
  }
  return {production,direct,stored,delivered,losses:stored-delivered,exportWithout:Math.max(0,production-direct),exportWith:Math.max(0,production-direct-stored)};
 }
 function project(r,h){
  let without=-h.pvCost,withBattery=-h.pvCost-h.batteryCost;
  const rows=[{year:0,without,withBattery,avoidedWithout:0,avoidedWith:0}];
  for(let year=1;year<=20;year++){
   const e=energy(r,year,h),price=r.price*Math.pow(1+h.priceGrowth,year-1);
   const avoidedWithout=e.direct*price,avoidedWith=(e.direct+e.delivered)*price;
   const sharedCost=h.maintenance+(year===h.inverterYear?h.inverterCost:0);
   const replacement=year>1&&(year-1)%h.batteryLife===0?h.batteryReplacement:0;
   without+=avoidedWithout+e.exportWithout*h.exportPrice-sharedCost;
   withBattery+=avoidedWith+e.exportWith*h.exportPrice-sharedCost-h.batteryMaintenance-replacement;
   rows.push({year,without,withBattery,avoidedWithout,avoidedWith,price,replacement,...e});
  }
  // Première année à partir de laquelle le solde reste positif jusqu'à l'année 20.
  const payback=key=>{const i=rows.findIndex((row,index)=>row[key]>=0&&rows.slice(index).every(x=>x[key]>=0));return i<0?null:i;};
  return {rows,first:rows[1],last:rows[20],paybackWithout:payback('without'),paybackWith:payback('withBattery')};
 }
 root.MidiSimulation={energy,project};
})(typeof window==='undefined'?globalThis:window);
