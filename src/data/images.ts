// Every entry of assets/images.json, bundled locally (no remote URLs).
export const images = {
  heroOnboarding: require('../../assets/images/hero-onboarding-palawan-catamaran.jpg'),
  heroSignin: require('../../assets/images/hero-signin-marina-sunrise.jpg'),
  destFiji: require('../../assets/images/dest-fiji.jpg'),
  destBali: require('../../assets/images/dest-bali.jpg'),
  destSingapore: require('../../assets/images/dest-singapore.jpg'),
  destPalawan: require('../../assets/images/dest-palawan.jpg'),
  destTahiti: require('../../assets/images/dest-tahiti.jpg'),
  destMaldives: require('../../assets/images/dest-maldives.jpg'),
  destPhuket: require('../../assets/images/dest-phuket.jpg'),
  destWhitsundays: require('../../assets/images/dest-whitsundays.jpg'),
  boatVedanta: require('../../assets/images/boat-vedanta-phinisi.jpg'),
  boatGili: require('../../assets/images/boat-gili-express.jpg'),
  boatLombok: require('../../assets/images/boat-lombok-sunset-cruise.jpg'),
  boatLagoonHero: require('../../assets/images/boat-lagoon380-hero.jpg'),
  boatLagoonAnchored: require('../../assets/images/boat-lagoon380-anchored.jpg'),
  boatBlueHorizon: require('../../assets/images/boat-blue-horizon.jpg'),
  boatAurelia: require('../../assets/images/boat-prometheus-cool.jpg'),
  fleetLagoon: require('../../assets/images/fleet-lagoon.jpg'),
  fleetBali46: require('../../assets/images/fleet-bali-46.jpg'),
  fleetSuperyacht: require('../../assets/images/fleet-superyacht.jpg'),
  emptyDock: require('../../assets/images/illustration-empty-dock.jpg'),
  emptyTrips: require('../../assets/images/illustration-empty-trips.jpg'),
  captain: require('../../assets/images/portrait-captain-liam-reeves.jpg'),
  marinaMap: require('../../assets/images/map-abell-point-marina.jpg'),
  avatarOlivia: require('../../assets/images/avatar-olivia-hart.jpg'),
};

export type ImageKey = keyof typeof images;

export const logoMark = require('../../assets/images/logo-mark.png');
export const logoMarkWhite = require('../../assets/images/logo-mark-white.png');
