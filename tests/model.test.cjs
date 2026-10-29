const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const context={};context.window=context;vm.createContext(context);
for(const file of ['config.js','simulator-model.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),context);
const h={...context.MIDI_CONFIG.simulation.projection,pvCost:6990},r={production:3450,annual:6000,baseShare:.46,price:.21,heating:true},p=context.MidiSimulation.project(r,h);
assert.equal(p.rows.length,21);assert.equal(p.rows[0].withBattery,-9680);
for(const row of p.rows.slice(1)){assert.ok(Math.abs(row.production-row.direct-row.stored-row.exportWith)<1e-6);assert.ok(Math.abs(row.stored-row.delivered-row.losses)<1e-6);assert.ok(row.direct+row.delivered<=r.annual);assert.equal(row.replacement,0);}
assert.ok(Math.abs(p.last.price-.21*1.05**19)<1e-9);
assert.ok(context.MidiSimulation.project(r,{...h,priceGrowth:0}).last.withBattery<p.last.withBattery);
const empty=context.MidiSimulation.project({...r,production:0},h);assert.ok(empty.last.withBattery<empty.last.without);assert.equal(empty.paybackWith,null);
assert.equal(context.MidiSimulation.project({...r,production:10350},{...h,pvCost:10990,batteryCapacity:14,batteryCost:3690}).rows[0].withBattery,-14680);
console.log('Model checks passed: balance, costs, inflation, no forced positive gain.');
