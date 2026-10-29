/* Données administrables : futures options WordPress / champs personnalisés. */
window.MIDI_CONFIG = {
  guideUrl: null,
  guideEndpoint: null,
  bookingPhoneUrl: null, bookingHomeUrl: null,
  // URL HTTPS publique du rendez-vous Calendly (ou autre agenda). Null = maquette.
  bookingUrl: 'https://calendly.com/epaud-brian/nouvelle-reunion',
  contact: {
    city: 'Les Sables-d’Olonne', region: 'Vendée',
    phone: null, email: null, address: null, googleReviewsUrl: null,
    social: {instagram: null, linkedin: null, facebook: null}
  },
  offers: [
    {power:2,name:"Midi Pile 2",priceTTC:4950,description:"Les premiers kilowattheures de votre maison."},
    {power:3,name:'Midi Pile 3',priceTTC:6990,conditions:'Tarif de travail TTC · conditions à confirmer',description:'Un premier pas pour couvrir une partie des usages de votre maison.'},
    {power:6,name:'Midi Pile 6',priceTTC:8990,conditions:'Tarif de travail TTC · conditions à confirmer',description:'Plus de production, lorsque votre consommation peut en profiter.'},
    {power:9,name:'Midi Pile 9',priceTTC:10990,conditions:'Tarif de travail TTC · conditions à confirmer',description:'Pour des besoins électriques importants et une toiture adaptée.'}
  ],
  simulation: {yieldPerKwc:1150,defaultPrice:0.21,roofAreaPerKwc:6,
    // Hypothèses exploratoires TTC modifiables, sans devis fournisseur ni aide déduite.
    projection: {batteryCapacity:8,batteryCost:2690,batteryRetailCost:3190,batteryDiscount:500,batteryReplacement:3190,batteryLife:20,
      batteryEfficiency:.90,batteryCycles:220,batteryDegradation:.02,pvDegradation:.005,
      maintenance:80,batteryMaintenance:25,inverterYear:12,inverterCost:1200,
      priceGrowth:0.05,exportPrice:0}
  }
};
