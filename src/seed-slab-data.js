/**
 * SlabYardMatrix — Verified Civil & Concrete Engineering Dataset Seeder
 * Generates 236 high-search-volume items (+ 5 core/compliance pages = 241 total static HTML pages):
 *  - 84 Concrete Slab Dimension & Thickness Pages (/slabs/...)
 *  - 52 Specific Concrete & Pad Project Guides (/projects/...)
 *  - 60 Sonotube Post-Hole, Deck Pier & Continuous Perimeter Footing Pages (/footings/...)
 *  - 40 Driveway Gravel, #57 Crushed Stone & Base Tonnage Pages (/gravel/...)
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function computeSlabMetrics(lengthFt, widthFt, thicknessIn, hasThickenedEdge = false, wastePct = 10) {
  const areaSqFt = lengthFt * widthFt;
  const perimeterFt = 2 * (lengthFt + widthFt);
  const baseCubicFt = areaSqFt * (thicknessIn / 12);
  const edgeCubicFt = hasThickenedEdge ? perimeterFt * 1.0 * (8 / 12) : 0;
  const netCubicFt = baseCubicFt + edgeCubicFt;
  const netCubicYards = netCubicFt / 27;
  const grossCubicYards = netCubicYards * (1 + wastePct / 100);
  const grossCubicFt = netCubicFt * (1 + wastePct / 100);

  const bags80 = Math.ceil(grossCubicFt / 0.60);
  const bags60 = Math.ceil(grossCubicFt / 0.45);
  const bags50 = Math.ceil(grossCubicFt / 0.375);

  const pallets80 = +(bags80 / 42).toFixed(1);
  const pallets60 = +(bags60 / 56).toFixed(1);
  const weightLbs = Math.round(grossCubicYards * 4050);

  const bagCost80 = Math.round(bags80 * 5.65);
  const readyMixOrderYds = Math.max(1, Math.ceil(grossCubicYards * 2) / 2);
  const shortLoadFee = readyMixOrderYds < 9 ? 185 : 0;
  const readyMixCost = Math.round(readyMixOrderYds * 168 + shortLoadFee);

  const rowsLength = Math.ceil(widthFt / 1.5) + 1;
  const rowsWidth = Math.ceil(lengthFt / 1.5) + 1;
  const rebarLinearFt = Math.ceil((rowsLength * lengthFt + rowsWidth * widthFt) * 1.15);
  const rebarSticks20ft = Math.ceil(rebarLinearFt / 20);

  const gravelCubicYards = +((areaSqFt * (4 / 12) / 27) * 1.15).toFixed(2);
  const gravelTons = +(gravelCubicYards * 1.40).toFixed(2);
  const formBoards16ft = Math.ceil((perimeterFt * 1.1) / 16);

  return {
    lengthFt, widthFt, thicknessIn, hasThickenedEdge, wastePct, areaSqFt, perimeterFt,
    netCubicFt: +netCubicFt.toFixed(1),
    netCubicYards: +netCubicYards.toFixed(2),
    grossCubicYards: +grossCubicYards.toFixed(2),
    grossCubicFt: +grossCubicFt.toFixed(1),
    bags80, bags60, bags50, pallets80, pallets60, weightLbs,
    bagCost80, readyMixOrderYds, shortLoadFee, readyMixCost,
    rebarLinearFt, rebarSticks20ft, gravelCubicYards, gravelTons, formBoards16ft,
    winnerMethod: grossCubicYards >= 1.75 ? 'Ready-Mix Concrete Truck' : '80 lb Pre-Mixed Bags'
  };
}

const baseDimensions = [
  { l: 4, w: 4, useCase: 'HVAC Condenser, Generator or Trash Can Pad' },
  { l: 4, w: 8, useCase: 'Entryway Landing, BBQ Grill Pad or Storage Locker Base' },
  { l: 6, w: 6, useCase: '2-Person Hot Tub Pad or Small Garden Shed Slab' },
  { l: 8, w: 8, useCase: 'Standard 6-Person Hot Tub & Swim Spa Foundation' },
  { l: 8, w: 10, useCase: 'Backyard Utility Shed & Lawn Tractor Storage Slab' },
  { l: 10, w: 10, useCase: '100 Sq Ft Backyard Patio, Gazebo & Storage Shed Slab' },
  { l: 10, w: 12, useCase: '120 Sq Ft Workshop Shed & Covered Pergola Patio' },
  { l: 10, w: 16, useCase: 'Single-Car Carport Extension & Large Garden Shed' },
  { l: 10, w: 20, useCase: '1-Car Driveway Parking Pad & 200 Sq Ft Boat Storage' },
  { l: 12, w: 12, useCase: '144 Sq Ft Pergola Patio, Gazebo & Large Hot Tub Deck' },
  { l: 12, w: 16, useCase: '192 Sq Ft Workshop Shed & Small Garage Foundation' },
  { l: 12, w: 20, useCase: 'Single-Car Garage Slab & Utility Trailer Parking Pad' },
  { l: 12, w: 24, useCase: '288 Sq Ft Deep 1-Car Garage & Sprinter Van Pad' },
  { l: 12, w: 30, useCase: '360 Sq Ft Class C / Travel Trailer RV Parking Pad' },
  { l: 12, w: 40, useCase: '480 Sq Ft Fifth-Wheel & Class A Motorhome RV Pad' },
  { l: 14, w: 14, useCase: '196 Sq Ft Outdoor Kitchen & Dining Patio Slab' },
  { l: 15, w: 15, useCase: '225 Sq Ft Backyard Patio & Pavilion Foundation' },
  { l: 16, w: 16, useCase: '256 Sq Ft Oversized 1-Car Garage & Hobby Shop' },
  { l: 16, w: 20, useCase: '320 Sq Ft Outdoor Entertainment Patio & Carport' },
  { l: 16, w: 24, useCase: '384 Sq Ft Deep Single-Bay Workshop & Boat Garage' },
  { l: 18, w: 20, useCase: '360 Sq Ft Compact 2-Car Carport & Driveway Pad' },
  { l: 20, w: 20, useCase: '400 Sq Ft Standard 2-Car Garage & Driveway Apron' },
  { l: 20, w: 24, useCase: '480 Sq Ft Full-Size Pickup 2-Car Garage Slab' },
  { l: 24, w: 24, useCase: '576 Sq Ft Oversized 2-Car Garage & Detached Shop' },
  { l: 24, w: 30, useCase: '720 Sq Ft 2.5-Car Garage & Workshop Foundation' },
  { l: 24, w: 36, useCase: '864 Sq Ft 3-Car Garage & Pole Barn Floor' },
  { l: 30, w: 30, useCase: '900 Sq Ft Commercial Shop & 3-Bay Garage Slab' },
  { l: 30, w: 40, useCase: '1,200 Sq Ft Pole Barn, Metal Building & Shop Floor' }
];

const slabs = [];
for (const dim of baseDimensions) {
  slabs.push({
    slug: `${dim.l}x${dim.w}-concrete-slab-calculator`,
    title: `${dim.l}x${dim.w} Concrete Slab Calculator (4" Thick): Cubic Yards, 80lb Bags & Cost`,
    shortLabel: `${dim.l}' × ${dim.w}' Slab (4" Thick)`,
    variantType: '4-Inch Standard Slab',
    useCase: dim.useCase,
    psiRecommended: 3500,
    ...computeSlabMetrics(dim.l, dim.w, 4, false, 10)
  });
  slabs.push({
    slug: `${dim.l}x${dim.w}-concrete-slab-6-inch-thick`,
    title: `${dim.l}x${dim.w} Concrete Slab at 6 Inches Thick: Cubic Yards, Bags & Rebar Grid`,
    shortLabel: `${dim.l}' × ${dim.w}' Slab (6" Heavy-Duty)`,
    variantType: '6-Inch Heavy-Duty Slab',
    useCase: `Heavy-Duty Vehicle / RV / Forklift ${dim.useCase}`,
    psiRecommended: 4000,
    ...computeSlabMetrics(dim.l, dim.w, 6, false, 10)
  });
  slabs.push({
    slug: `${dim.l}x${dim.w}-monolithic-concrete-slab-thickened-edge`,
    title: `${dim.l}x${dim.w} Monolithic Concrete Slab (12" Thickened Edge): Yards & Rebar Guide`,
    shortLabel: `${dim.l}' × ${dim.w}' Monolithic Slab`,
    variantType: '4" Slab + 12"×12" Thickened Edge',
    useCase: `Structural Load-Bearing ${dim.useCase}`,
    psiRecommended: 4000,
    ...computeSlabMetrics(dim.l, dim.w, 4, true, 10)
  });
}

const projectTemplates = [
  { slug: 'hot-tub-concrete-pad-8x8-6-inch-calculator', name: '8x8 Hot Tub & Spa Concrete Pad (6" Reinforced)', category: 'Patio & Outdoor Living', l: 8, w: 8, t: 6, mono: false, psi: 4000, note: 'A loaded 6-person hot tub weighs 4,500 to 6,000 lbs (~95 lbs/sq ft). Pouring a 6-inch slab over 4 inches of compacted #57 stone with #4 rebar on 16" centers prevents corner cracking.' },
  { slug: 'swim-spa-concrete-pad-10x16-6-inch-calculator', name: '10x16 Swim Spa Concrete Pad (6" Thick Reinforced)', category: 'Patio & Outdoor Living', l: 10, w: 16, t: 6, mono: false, psi: 4000, note: 'Swim spas hold 1,500 to 2,500 gallons of water (15,000+ lbs total load) and require an uninterrupted 6-inch thick 4,000 PSI concrete foundation with 12" O.C. #4 rebar.' },
  { slug: 'rv-parking-pad-12x35-concrete-calculator', name: '12x35 Travel Trailer & Fifth-Wheel RV Concrete Pad', category: 'RV & Driveway Pads', l: 12, w: 35, t: 6, mono: false, psi: 4000, note: 'RV leveling jacks concentrate 3,000 to 5,000 lbs onto small jack pads. A 6-inch thick 4,000 PSI slab with fiber mesh and #4 rebar prevents point-load punching shear.' },
  { slug: 'class-a-motorhome-rv-pad-14x45-concrete-calculator', name: '14x45 Class A Motorhome Concrete Pad (6" Thick)', category: 'RV & Driveway Pads', l: 14, w: 45, t: 6, mono: true, psi: 4000, note: 'Class A diesel pushers weigh 30,000 to 45,000 lbs GVWR. Always include a thickened 12-inch monolithic apron edge where the rear dual tires climb onto the pad.' },
  { slug: '2-post-car-lift-concrete-slab-12x24-6-inch', name: '2-Post Automotive Car Lift Concrete Slab (6" 4,000 PSI)', category: 'Garage & Shop Floors', l: 12, w: 24, t: 6, mono: false, psi: 4000, note: 'BendPak and Rotary 10,000 lb 2-post lifts require a minimum of 4.25" to 6" of 4,000 PSI concrete cured for 28 days so wedge anchors achieve full pull-out torque.' },
  { slug: '4-post-car-lift-garage-bay-concrete-calculator', name: '4-Post Storage Lift Garage Bay Slab (12x20 at 5")', category: 'Garage & Shop Floors', l: 12, w: 20, t: 5, mono: false, psi: 3500, note: '4-post automotive storage lifts spread load across 4 baseplates and tolerate a 5-inch 3,500 PSI reinforced slab.' },
  { slug: 'two-car-garage-24x24-monolithic-slab-calculator', name: '24x24 Detached 2-Car Garage Monolithic Concrete Slab', category: 'Garage & Shop Floors', l: 24, w: 24, t: 4, mono: true, psi: 4000, note: 'A monolithic pour combines a 4-inch interior floor with a 12-inch deep perimeter turndown beam in a single concrete truck delivery.' },
  { slug: 'three-car-garage-24x36-concrete-slab-calculator', name: '24x36 3-Car Garage Monolithic Foundation Slab', category: 'Garage & Shop Floors', l: 24, w: 36, t: 4, mono: true, psi: 4000, note: 'Saw-cut control joints every 12 feet in both directions within 6 to 12 hours of finishing to prevent random shrinkage cracks.' },
  { slug: 'pole-barn-floor-30x40-concrete-calculator', name: '30x40 Pole Barn Concrete Floor (5" Thick Tractor Rated)', category: 'Pole Barns & Ag Buildings', l: 30, w: 40, t: 5, mono: false, psi: 4000, note: 'In post-frame buildings, posts carry roof load so the interior floor is poured floating at 5 inches thick over a 6-mil poly vapor barrier.' },
  { slug: 'pole-barn-floor-40x60-concrete-calculator', name: '40x60 Commercial Pole Barn & Shop Concrete Floor (6")', category: 'Pole Barns & Ag Buildings', l: 40, w: 60, t: 6, mono: false, psi: 4000, note: 'At 2,400 sq ft (48.9 cubic yards including 10% waste), schedule 5 standard 10-yard ready-mix trucks spaced 35 minutes apart.' },
  { slug: 'metal-building-slab-30x50-monolithic-calculator', name: '30x50 Red-Iron / Tubular Steel Building Monolithic Slab', category: 'Pole Barns & Ag Buildings', l: 30, w: 50, t: 5, mono: true, psi: 4000, note: 'Tubular steel buildings bolt directly to the perimeter edge; use a 12"x12" thickened perimeter grade beam with two continuous #5 rebar bars.' },
  { slug: 'backyard-shed-slab-10x12-concrete-calculator', name: '10x12 Backyard Storage Shed Concrete Slab (4" Thick)', category: 'Sheds & Outbuildings', l: 10, w: 12, t: 4, mono: false, psi: 3500, note: 'At 1.63 cubic yards, a 10x12 shed slab sits right on the crossover threshold between mixing 74 bags of 80 lb concrete vs ordering a short-load ready-mix truck.' },
  { slug: 'garden-shed-slab-8x12-concrete-calculator', name: '8x12 Garden Shed & Riding Mower Concrete Pad', category: 'Sheds & Outbuildings', l: 8, w: 12, t: 4, mono: false, psi: 3500, note: 'Slope the leading 12 inches at the shed doorway by 1/2 inch to create a built-in threshold ramp and prevent rainwater pooling.' },
  { slug: 'storage-shed-slab-12x16-monolithic-calculator', name: '12x16 Heavy Workshop Shed Monolithic Concrete Slab', category: 'Sheds & Outbuildings', l: 12, w: 16, t: 4, mono: true, psi: 3500, note: 'Adding a thickened perimeter edge prevents frost heave from tilting shed corners during winter freeze-thaw cycles.' },
  { slug: 'standby-generator-pad-3x5-concrete-calculator', name: '3x5 Whole-House Standby Generator Pad (Generac / Kohler)', category: 'HVAC & Equipment Pads', l: 3, w: 5, t: 4, mono: false, psi: 3500, note: 'Only 10 bags of 80 lb Quikrete required! An easy 1-hour DIY weekend pour that saves $350+ over buying a prefabricated composite pad.' },
  { slug: 'mini-split-hvac-condenser-pad-3x3-concrete', name: '3x3 Heat Pump & AC Condenser Concrete Pad (4" Thick)', category: 'HVAC & Equipment Pads', l: 3, w: 3, t: 4, mono: false, psi: 3500, note: 'Requires just 6 bags of 80 lb concrete. Set the top of forms 2 inches above surrounding grade for proper heat-pump defrost drainage.' },
  { slug: 'pool-equipment-pad-4x8-concrete-calculator', name: '4x8 Swimming Pool Pump, Filter & Heater Concrete Pad', category: 'HVAC & Equipment Pads', l: 4, w: 8, t: 4, mono: false, psi: 3500, note: 'Requires 19 bags of 80 lb concrete. Leave 2-inch PVC conduit sweeps stubbed up outside the pad perimeter.' },
  { slug: 'outdoor-kitchen-island-slab-8x14-concrete', name: '8x14 Masonry Outdoor Kitchen & Pizza Oven Slab (5")', category: 'Patio & Outdoor Living', l: 8, w: 14, t: 5, mono: false, psi: 4000, note: 'Stone veneer islands and brick pizza ovens weigh 4,000 to 8,000 lbs; upgrade from 4 inches to 5 inches with #4 rebar grid.' },
  { slug: 'gazebo-pergola-patio-slab-12x14-concrete', name: '12x14 Costco / Yardistry Gazebo Concrete Patio Slab', category: 'Patio & Outdoor Living', l: 12, w: 14, t: 4, mono: true, psi: 3500, note: 'Thickened perimeter edge gives 12 inches of solid concrete depth right where the 4 corner gazebo posts bolt down for wind-uplift resistance.' },
  { slug: 'stamped-concrete-patio-16x20-calculator', name: '16x20 Stamped Concrete Backyard Patio (4" Thick)', category: 'Patio & Outdoor Living', l: 16, w: 20, t: 4, mono: false, psi: 4000, note: 'In freeze-thaw climates, specify 4,000 PSI air-entrained ready-mix (5%–7% air content) and keep rebar chairs centered.' },
  { slug: 'backyard-patio-12x20-broom-finish-concrete', name: '12x20 Broom-Finish Backyard Patio Concrete Calculator', category: 'Patio & Outdoor Living', l: 12, w: 20, t: 4, mono: false, psi: 3500, note: 'Pitch forms 1/8 inch to 1/4 inch per foot away from the house foundation so rain sheds cleanly toward the lawn.' },
  { slug: 'basketball-half-court-25x30-concrete-slab', name: '25x30 Backyard Basketball Half-Court Concrete Slab', category: 'Sports & Recreation', l: 25, w: 30, t: 4, mono: false, psi: 4000, note: 'Pour a separate 24"x24"x48" deep reinforced concrete pier just behind the baseline to anchor the in-ground basketball hoop.' },
  { slug: 'pickleball-court-concrete-slab-30x60-calculator', name: '30x60 Regulation Backyard Pickleball Court Concrete Slab', category: 'Sports & Recreation', l: 30, w: 60, t: 4, mono: false, psi: 4000, note: 'Rebar-reinforced 4-inch slab over a 6-inch laser-graded #57 crushed stone base prevents court cracking under acrylic sports surfacing.' },
  { slug: 'concrete-sidewalk-4x50-walkway-calculator', name: '4-Foot Wide × 50-Foot Long Concrete Sidewalk Calculator', category: 'Walkways & Driveways', l: 4, w: 50, t: 4, mono: false, psi: 3500, note: 'Tool contraction joints every 4 feet (matching the 4-foot sidewalk width) and place 1/2-inch asphalt expansion felt every 20 feet.' },
  { slug: 'concrete-sidewalk-3x30-front-walkway-calculator', name: '3-Foot Wide × 30-Foot Front Entry Concrete Walkway', category: 'Walkways & Driveways', l: 3, w: 30, t: 4, mono: false, psi: 3500, note: 'Requires 1.22 cubic yards (55 bags of 80 lb concrete). Ideal size for a 2-person Saturday pour using a rented 3.5 cu ft barrel mixer.' },
  { slug: 'single-car-driveway-12x40-concrete-calculator', name: '12x40 Single-Car Concrete Driveway Calculator (5" Thick)', category: 'Walkways & Driveways', l: 12, w: 40, t: 5, mono: false, psi: 4000, note: 'Upgrading a residential driveway from 4 inches to 5 inches increases flexural load capacity by 56%.' },
  { slug: 'two-car-driveway-20x40-concrete-calculator', name: '20x40 Two-Car Concrete Driveway Calculator (5" Thick)', category: 'Walkways & Driveways', l: 20, w: 40, t: 5, mono: false, psi: 4000, note: 'Requires 13.58 cubic yards (with 10% waste). Order two 7-yard mixer trucks and divide the driveway into 10x10 control-joint panels.' },
  { slug: 'two-car-driveway-20x50-6-inch-concrete-calculator', name: '20x50 Heavy-Duty 6-Inch Concrete Driveway Calculator', category: 'Walkways & Driveways', l: 20, w: 50, t: 6, mono: false, psi: 4000, note: 'At 6 inches thick with #4 rebar on 18" centers, this driveway handles loaded dump trucks, boat trailers, and diesel pickups effortlessly.' },
  { slug: 'driveway-apron-curb-cut-10x20-6-inch-concrete', name: '10x20 Municipal Driveway Apron & Street Approach (6")', category: 'Walkways & Driveways', l: 10, w: 20, t: 6, mono: false, psi: 4000, note: 'Most city right-of-way codes mandate a minimum 6-inch thickness and 4,000 PSI air-entrained concrete for street approach aprons.' },
  { slug: 'dumpster-enclosure-pad-12x12-8-inch-concrete', name: '12x12 Commercial Roll-Off Dumpster Concrete Pad (8" Thick)', category: 'Commercial & Industrial', l: 12, w: 12, t: 8, mono: false, psi: 4500, note: 'Front-load garbage trucks exert 25,000+ lb front-axle loads while dropping steel dumpsters; pour 8 inches thick with #5 rebar on 12" centers.' },
  { slug: 'shipping-container-foundation-pad-10x22-concrete', name: '10x22 20-Foot Conex Shipping Container Concrete Slab (6")', category: 'Sheds & Outbuildings', l: 10, w: 22, t: 6, mono: true, psi: 4000, note: 'Shipping containers rest entirely on their 4 corner castings. Using the monolithic thickened edge option puts 12 inches of concrete under all four corners.' },
  { slug: 'shipping-container-40ft-foundation-10x42-concrete', name: '10x42 40-Foot Shipping Container Monolithic Concrete Slab', category: 'Sheds & Outbuildings', l: 10, w: 42, t: 6, mono: true, psi: 4000, note: 'Provides a dead-level, rodent-proof foundation that keeps container floor cross-members elevated above ground moisture.' },
  { slug: 'greenhouse-foundation-slab-10x16-concrete', name: '10x16 Polycarbonate Greenhouse Concrete Floor & Perimeter', category: 'Sheds & Outbuildings', l: 10, w: 16, t: 4, mono: true, psi: 3500, note: 'Install a central 3-inch PVC floor drain tied to daylight or a drywell before pouring so watering runoff drains cleanly.' },
  { slug: 'dog-kennel-run-concrete-slab-10x20-calculator', name: '10x20 Easy-Wash Dog Kennel Run Concrete Slab (4")', category: 'Sheds & Outbuildings', l: 10, w: 20, t: 4, mono: false, psi: 4000, note: 'Trowel to a smooth finish and seal with a penetrating silane/siloxane sealer for odor-free washdowns.' },
  { slug: 'carport-concrete-slab-18x21-metal-carport', name: '18x21 Double Metal Carport Concrete Slab Calculator', category: 'RV & Driveway Pads', l: 18, w: 21, t: 4, mono: true, psi: 3500, note: 'Standard 18x20 steel carports measure 18\'×21\' at the roof overhang. Pour a thickened edge so wedge anchors do not blow out the slab side.' },
  { slug: 'carport-concrete-slab-20x21-double-carport', name: '20x21 Two-Car Steel Carport Monolithic Concrete Slab', category: 'RV & Driveway Pads', l: 20, w: 21, t: 4, mono: true, psi: 3500, note: 'Keep anchor bolts at least 4 inches inward from the outside concrete edge to prevent corner spalling during high-wind uplift.' },
  { slug: 'rv-carport-concrete-slab-12x31-high-profile', name: '12x31 RV Metal Canopy & Carport Concrete Pad (6" Thick)', category: 'RV & Driveway Pads', l: 12, w: 31, t: 6, mono: true, psi: 4000, note: 'Combines 6-inch center thickness for RV tire loads with a 12-inch deep perimeter beam for anchoring 12-foot tall carport legs.' },
  { slug: 'ev-charger-parking-pad-10x20-concrete-calculator', name: '10x20 Home EV Charging Side-Parking Concrete Pad (5")', category: 'RV & Driveway Pads', l: 10, w: 20, t: 5, mono: false, psi: 4000, note: 'Electric pickups (F-150 Lightning, Rivian R1T) weigh 6,800 to 8,500 lbs. Pour 5 inches thick over compacted #57 stone.' },
  { slug: 'boat-trailer-parking-pad-12x28-concrete-calculator', name: '12x28 Boat & Dual-Axle Trailer Side-Yard Concrete Pad', category: 'RV & Driveway Pads', l: 12, w: 28, t: 5, mono: false, psi: 4000, note: 'Broom finish perpendicular to the trailer pull direction and embed a galvanized security D-ring anchor loop.' },
  { slug: 'basement-floor-pour-20x30-concrete-calculator', name: '20x30 Basement Interior Concrete Floor Pour (4" Over Poly)', category: 'Garage & Shop Floors', l: 20, w: 30, t: 4, mono: false, psi: 3500, note: 'Lay 4 inches of washed #57 crushed stone topped with a taped 10-mil polyethylene vapor retarder before pouring.' },
  { slug: 'crawl-space-rat-slab-24x32-2-inch-concrete', name: '24x32 Crawl Space 2-Inch Mud Slab / Rat Slab Calculator', category: 'Garage & Shop Floors', l: 24, w: 32, t: 2, mono: false, psi: 3000, note: 'A 2-inch concrete mud slab over a 15-mil crawl-space vapor barrier permanently seals out moisture, rodents, and soil gases.' },
  { slug: 'outdoor-shower-and-sauna-pad-8x12-concrete', name: '8x12 Backyard Barrel Sauna & Cold Plunge Concrete Pad', category: 'Patio & Outdoor Living', l: 8, w: 12, t: 4, mono: false, psi: 3500, note: 'A filled cold-plunge tub plus a 6-person cedar barrel sauna requires a dead-flat 4-inch slab with a slight 1/8" per foot drainage pitch.' },
  { slug: 'fire-pit-circular-patio-14x14-concrete-calculator', name: '14x14 Backyard Fire Pit Concrete Patio Slab Calculator', category: 'Patio & Outdoor Living', l: 14, w: 14, t: 4, mono: false, psi: 3500, note: 'Line the fire pit ring interior with firebrick and lava rock to insulate the concrete slab from direct thermal spalling.' },
  { slug: 'pool-deck-surround-16x32-concrete-calculator', name: '16x32 In-Ground Swimming Pool Concrete Deck Apron (4")', category: 'Patio & Outdoor Living', l: 16, w: 32, t: 4, mono: false, psi: 4000, note: 'Per NEC 680.26 equipotential bonding rules, bond the #4 rebar grid at 4 points around the pool perimeter before inspection.' },
  { slug: 'above-ground-pool-pad-24x24-concrete-slab', name: '24x24 Above-Ground Pool Base Concrete Pad (4" Thick)', category: 'Patio & Outdoor Living', l: 24, w: 24, t: 4, mono: false, psi: 3500, note: 'Trowel smooth and place a 1/2-inch extruded polystyrene foam pad under the vinyl liner.' },
  { slug: 'trash-bin-pad-4x10-side-house-concrete', name: '4x10 Side-of-House Trash & Recycling Bin Concrete Pad', category: 'Walkways & Driveways', l: 4, w: 10, t: 4, mono: false, psi: 3500, note: 'Requires 24 bags of 80 lb concrete (0.54 cubic yards). Eliminates muddy wheel ruts along the side gate path.' },
  { slug: 'ac-heat-pump-dual-condenser-pad-4x8-concrete', name: '4x8 Dual Heat Pump / Mini-Split Condenser Concrete Pad', category: 'HVAC & Equipment Pads', l: 4, w: 8, t: 4, mono: false, psi: 3500, note: 'Provides 24 inches of service clearance around twin 3-ton outdoor heat pump condensers on 18-inch snow risers.' },
  { slug: 'propane-tank-500-gallon-concrete-pad-5x12', name: '5x12 500-Gallon Above-Ground Propane Tank Concrete Pad', category: 'HVAC & Equipment Pads', l: 5, w: 12, t: 6, mono: false, psi: 4000, note: 'A full 500-gallon LP tank weighs 2,850 lbs resting on two saddle legs; NFPA 58 requires a firm masonry/concrete foundation.' },
  { slug: 'wood-boiler-outdoor-furnace-pad-6x10-concrete', name: '6x10 Outdoor Wood Furnace / Hydronic Boiler Concrete Pad', category: 'HVAC & Equipment Pads', l: 6, w: 10, t: 6, mono: false, psi: 4000, note: 'Leave a 12"x12" block-out opening in the rear center where insulated underground PEX lines enter the boiler bottom.' },
  { slug: 'chicken-coop-predator-proof-slab-8x16-concrete', name: '8x16 Predator-Proof Chicken Coop & Run Concrete Slab', category: 'Sheds & Outbuildings', l: 8, w: 16, t: 4, mono: false, psi: 3500, note: 'Stops raccoons, foxes, and rats from tunneling under coop walls and allows fast deep-litter bedding cleanup.' },
  { slug: 'horse-wash-stall-concrete-pad-12x12-broom-finish', name: '12x12 Non-Slip Horse Wash Rack & Tack Room Concrete Slab', category: 'Pole Barns & Ag Buildings', l: 12, w: 12, t: 5, mono: false, psi: 4000, note: 'Apply a coarse stiff-bristle barn broom finish for hoof traction when wet, sloped 1/4" per foot toward a central trench drain.' },
  { slug: 'tractor-implement-wash-pad-16x24-6-inch-concrete', name: '16x24 Farm Tractor & Skid-Steer Concrete Wash Pad (6")', category: 'Pole Barns & Ag Buildings', l: 16, w: 24, t: 6, mono: false, psi: 4000, note: '6-inch thickness with #4 rebar on 16-inch centers easily supports a 9,500 lb skid-steer loader and front-end attachments.' }
];

const projects = projectTemplates.map(p => ({
  slug: p.slug, name: p.name, category: p.category, psiRecommended: p.psi, engineeringNote: p.note,
  ...computeSlabMetrics(p.l, p.w, p.t, p.mono, 10)
}));

const footings = [];
const tubeDiameters = [6, 8, 10, 12, 14, 16, 18, 24];
const tubeSetupConfigs = [
  { depthIn: 36, postCount: 1 },
  { depthIn: 48, postCount: 1 },
  { depthIn: 36, postCount: 6 },
  { depthIn: 48, postCount: 8 },
  { depthIn: 48, postCount: 12 }
];

for (const dia of tubeDiameters) {
  for (const cfg of tubeSetupConfigs) {
    const radiusFt = (dia / 2) / 12;
    const heightFt = cfg.depthIn / 12;
    const singleCuFt = Math.PI * radiusFt * radiusFt * heightFt;
    const totalNetCuFt = singleCuFt * cfg.postCount;
    const totalGrossCuFt = totalNetCuFt * 1.10;
    const totalGrossCuYds = totalGrossCuFt / 27;
    const bags80PerHole = +((singleCuFt * 1.10) / 0.60).toFixed(1);
    const totalBags80 = Math.ceil(totalGrossCuFt / 0.60);
    const totalBags60 = Math.ceil(totalGrossCuFt / 0.45);
    const totalBags50 = Math.ceil(totalGrossCuFt / 0.375);

    footings.push({
      slug: cfg.postCount === 1
        ? `${dia}-inch-sonotube-${cfg.depthIn}-inches-deep-concrete-bags`
        : `${dia}-inch-sonotube-${cfg.postCount}-posts-${cfg.depthIn}-inch-deep`,
      footingType: 'Sonotube Cylindrical Pier',
      title: cfg.postCount === 1
        ? `How Many Bags of Concrete for a ${dia}" Sonotube (${cfg.depthIn}" Deep)?`
        : `${dia}" Sonotube Concrete Calculator (${cfg.postCount} Posts × ${cfg.depthIn}" Deep): Total Bags & Yards`,
      shortLabel: `${dia}" Sonotube × ${cfg.depthIn}" Deep (${cfg.postCount} ${cfg.postCount === 1 ? 'Pier' : 'Piers'})`,
      diameterIn: dia, depthIn: cfg.depthIn, postCount: cfg.postCount, widthIn: dia,
      lengthFt: +(heightFt * cfg.postCount).toFixed(1),
      singleCuFt: +singleCuFt.toFixed(2),
      netCubicFt: +totalNetCuFt.toFixed(2),
      grossCubicFt: +totalGrossCuFt.toFixed(2),
      grossCubicYards: +totalGrossCuYds.toFixed(2),
      bags80PerHole, bags80: totalBags80, bags60: totalBags60, bags50: totalBags50,
      pallets80: +(totalBags80 / 42).toFixed(1),
      bagCost80: Math.round(totalBags80 * 5.65),
      recommendedPostSize: dia <= 8 ? '4×4 Post or Fence Post' : dia <= 12 ? '6×6 Deck Post' : '6×6 or Laminated Pole Barn Column',
      rebarSpec: dia <= 8 ? '1 × #4 Vertical Rebar Center' : '3 to 4 × #4 Vertical Rebar Cage with #3 Ties'
    });
  }
}

const trenchConfigs = [
  { wIn: 12, dIn: 6, lFt: 20, use: 'Garden Wall & Brick Veneer Curb Footing (20 Linear Ft)' },
  { wIn: 12, dIn: 8, lFt: 30, use: 'CMU Block Retaining Wall Footing (30 Linear Ft)' },
  { wIn: 12, dIn: 8, lFt: 50, use: 'Masonry Fence & Privacy Wall Trench Footing (50 Linear Ft)' },
  { wIn: 16, dIn: 8, lFt: 40, use: 'Single-Story Garage Stem-Wall Continuous Footing (40 Linear Ft)' },
  { wIn: 16, dIn: 8, lFt: 60, use: '1-Car Garage Perimeter Stem-Wall Footing (60 Linear Ft)' },
  { wIn: 16, dIn: 8, lFt: 80, use: '20x20 Garage Continuous Perimeter Trench Footing (80 Linear Ft)' },
  { wIn: 16, dIn: 8, lFt: 100, use: '24x26 Garage Continuous Perimeter Footing (100 Linear Ft)' },
  { wIn: 18, dIn: 8, lFt: 80, use: '1.5-Story Residential Addition Perimeter Footing (80 Linear Ft)' },
  { wIn: 18, dIn: 10, lFt: 100, use: 'Heavy CMU Block Garage Foundation Footing (100 Linear Ft)' },
  { wIn: 18, dIn: 12, lFt: 60, use: '6-Foot Tall Retaining Wall Continuous Footing (60 Linear Ft)' },
  { wIn: 18, dIn: 12, lFt: 100, use: 'Full Basement Wall Continuous Strip Footing (100 Linear Ft)' },
  { wIn: 18, dIn: 12, lFt: 120, use: '30x30 Building Continuous Perimeter Footing (120 Linear Ft)' },
  { wIn: 20, dIn: 10, lFt: 100, use: '2-Story Home Addition Continuous Strip Footing (100 Linear Ft)' },
  { wIn: 20, dIn: 12, lFt: 140, use: '30x40 Shop Continuous Perimeter Wall Footing (140 Linear Ft)' },
  { wIn: 24, dIn: 12, lFt: 40, use: 'Heavy Structural Retaining Wall Heel/Toe Footing (40 Linear Ft)' },
  { wIn: 24, dIn: 12, lFt: 80, use: '2-Story Brick Veneer Foundation Strip Footing (80 Linear Ft)' },
  { wIn: 24, dIn: 12, lFt: 120, use: 'Commercial CMU Building Perimeter Footing (120 Linear Ft)' },
  { wIn: 24, dIn: 12, lFt: 160, use: 'Full House Foundation Continuous Strip Footing (160 Linear Ft)' },
  { wIn: 24, dIn: 16, lFt: 100, use: 'High-Load Commercial Grade Beam Trench Footing (100 Linear Ft)' },
  { wIn: 30, dIn: 12, lFt: 100, use: 'Soft-Soil Wide Bearing Foundation Strip Footing (100 Linear Ft)' }
];

for (const tc of trenchConfigs) {
  const netCuFt = (tc.wIn / 12) * (tc.dIn / 12) * tc.lFt;
  const grossCuFt = netCuFt * 1.10;
  const grossCuYds = grossCuFt / 27;
  const bags80 = Math.ceil(grossCuFt / 0.60);
  const bags60 = Math.ceil(grossCuFt / 0.45);
  const bags50 = Math.ceil(grossCuFt / 0.375);

  footings.push({
    slug: `${tc.wIn}x${tc.dIn}-continuous-footing-${tc.lFt}-ft-concrete-yards`,
    footingType: 'Continuous Trench Strip Footing',
    title: `${tc.wIn}" Wide × ${tc.dIn}" Deep Continuous Concrete Footing (${tc.lFt} Linear Ft): Cubic Yards & Bags`,
    shortLabel: `${tc.wIn}"×${tc.dIn}" Trench Footing (${tc.lFt} LF)`,
    diameterIn: tc.wIn, depthIn: tc.dIn, postCount: 1, widthIn: tc.wIn, lengthFt: tc.lFt,
    singleCuFt: +netCuFt.toFixed(1), netCubicFt: +netCuFt.toFixed(1), grossCubicFt: +grossCuFt.toFixed(1),
    grossCubicYards: +grossCuYds.toFixed(2), bags80PerHole: bags80, bags80, bags60, bags50,
    pallets80: +(bags80 / 42).toFixed(1), bagCost80: Math.round(bags80 * 5.65),
    recommendedPostSize: tc.use,
    rebarSpec: `2 Continuous Horizontal #4 Rebar Bars (${Math.ceil((tc.lFt * 2 * 1.15) / 20)} × 20-ft sticks) on 3" Dobie Chairs`
  });
}

const gravelConfigs = [
  { slug: '10x20-gravel-driveway-parking-pad-tons-calculator', l: 20, w: 10, dIn: 4, mat: '#57 Crushed Limestone / Granite', density: 1.40, app: '1-Car Gravel Parking Pad (10×20 ft at 4" Deep)' },
  { slug: '10x50-gravel-driveway-tons-and-yards-calculator', l: 50, w: 10, dIn: 4, mat: '#57 Crushed Stone over #411 Crusher Run', density: 1.42, app: '50-Foot Single-Lane Gravel Driveway (10×50 ft at 4" Deep)' },
  { slug: '10x100-gravel-driveway-tons-calculator', l: 100, w: 10, dIn: 4, mat: '#57 Crushed Stone / Driveway Gravel', density: 1.40, app: '100-Foot Gravel Driveway Topcoat (10×100 ft at 4" Deep)' },
  { slug: '10x150-gravel-driveway-tons-calculator', l: 150, w: 10, dIn: 4, mat: '#57 Crushed Limestone / Crusher Run', density: 1.42, app: '150-Foot Rural Gravel Driveway (10×150 ft at 4" Deep)' },
  { slug: '10x200-gravel-driveway-tons-calculator', l: 200, w: 10, dIn: 4, mat: 'Crusher Run (ABC Stone) + #57 Topcoat', density: 1.42, app: '200-Foot Single-Lane Gravel Driveway (10×200 ft at 4" Deep)' },
  { slug: '12x30-rv-gravel-parking-pad-tons-calculator', l: 30, w: 12, dIn: 6, mat: 'Compacted Crusher Run + #57 Stone', density: 1.45, app: '12×30 RV & Boat Trailer Gravel Parking Pad (6" Deep)' },
  { slug: '12x40-fifth-wheel-rv-gravel-pad-tons-calculator', l: 40, w: 12, dIn: 6, mat: 'Compacted Road Base / Crusher Run', density: 1.45, app: '12×40 Fifth-Wheel RV Gravel Pad (6" Heavy Base)' },
  { slug: '12x50-gravel-driveway-tons-and-cubic-yards', l: 50, w: 12, dIn: 4, mat: '#57 Crushed Stone / Driveway Gravel', density: 1.40, app: '12-Foot Wide × 50-Foot Gravel Driveway (4" Deep)' },
  { slug: '12x100-gravel-driveway-tons-and-dump-trucks', l: 100, w: 12, dIn: 4, mat: '#57 Crushed Stone (4" Maintenance Layer)', density: 1.40, app: '12-Foot Wide × 100-Foot Gravel Driveway (4" Deep)' },
  { slug: '12x100-new-gravel-driveway-6-inch-base-tons', l: 100, w: 12, dIn: 6, mat: '4" #3 Base Stone + 2" #57 Wearing Course', density: 1.45, app: '12×100 New Gravel Driveway Excavation Base (6" Deep)' },
  { slug: '12x150-gravel-driveway-tons-calculator', l: 150, w: 12, dIn: 4, mat: '#57 Crushed Stone / Crusher Run', density: 1.42, app: '12-Foot Wide × 150-Foot Gravel Driveway (4" Deep)' },
  { slug: '12x200-gravel-driveway-tons-and-cost-calculator', l: 200, w: 12, dIn: 4, mat: '#57 Crushed Stone / Limestone', density: 1.40, app: '12-Foot Wide × 200-Foot Gravel Driveway (4" Deep)' },
  { slug: '12x300-gravel-driveway-tons-calculator', l: 300, w: 12, dIn: 4, mat: 'Crusher Run + #57 Crushed Stone', density: 1.42, app: '12-Foot Wide × 300-Foot Long Gravel Driveway (4" Deep)' },
  { slug: '12x400-gravel-driveway-tons-calculator', l: 400, w: 12, dIn: 4, mat: 'Compacted Quarry Run / #57 Gravel', density: 1.42, app: '12-Foot Wide × 400-Foot Farm / Acreage Driveway (4" Deep)' },
  { slug: '12x500-gravel-driveway-tons-calculator', l: 500, w: 12, dIn: 4, mat: 'Quarry Crusher Run & #57 Stone', density: 1.42, app: '12-Foot Wide × 500-Foot Long Country Driveway (4" Deep)' },
  { slug: '12x100-gravel-driveway-2-inch-top-dressing-tons', l: 100, w: 12, dIn: 2, mat: '#57 or #67 Crushed Driveway Top-Dressing', density: 1.38, app: '12×100 Gravel Driveway 2-Inch Refresh / Top-Dressing' },
  { slug: '20x40-two-car-gravel-driveway-tons-calculator', l: 40, w: 20, dIn: 4, mat: '#57 Crushed Stone over Geotextile Fabric', density: 1.40, app: '20×40 Two-Car Gravel Driveway & Turnaround (4" Deep)' },
  { slug: '20x50-two-car-gravel-driveway-6-inch-tons', l: 50, w: 20, dIn: 6, mat: 'Compacted Dense Grade Aggregate (DGA)', density: 1.45, app: '20×50 Heavy Two-Car Gravel Driveway (6" Base)' },
  { slug: '8x10-shed-gravel-foundation-pad-tons-calculator', l: 10, w: 8, dIn: 4, mat: '#57 Washed Crushed Stone (Drainage Pad)', density: 1.38, app: '8×10 Shed 4×4 Timber Perimeter Gravel Foundation Pad' },
  { slug: '10x10-patio-paver-base-gravel-tons-calculator', l: 10, w: 10, dIn: 4, mat: 'Compacted Crusher Run / Paver Base (#411)', density: 1.45, app: '10×10 Paver Patio or Concrete Slab Sub-Base (4" Deep)' },
  { slug: '10x12-shed-gravel-pad-tons-and-bags-calculator', l: 12, w: 10, dIn: 4, mat: '#57 Washed Crushed Stone', density: 1.38, app: '10×12 Storage Shed Gravel Foundation Pad (4" Deep)' },
  { slug: '12x12-pea-gravel-patio-tons-and-yards-calculator', l: 12, w: 12, dIn: 3, mat: '3/8" Washed Pea Gravel', density: 1.35, app: '12×12 Backyard Pea Gravel Fire Pit Patio (3" Deep)' },
  { slug: '12x16-shed-gravel-pad-tons-calculator', l: 16, w: 12, dIn: 4, mat: '#57 Crushed Stone Shed Base', density: 1.40, app: '12×16 Workshop Shed Gravel Foundation Pad (4" Deep)' },
  { slug: '12x20-shed-or-garage-gravel-base-tons-calculator', l: 20, w: 12, dIn: 4, mat: '#57 Crushed Stone / Compacted Road Base', density: 1.42, app: '12×20 Single-Car Garage / Shed Sub-Base (4" Deep)' },
  { slug: '14x14-fire-pit-pea-gravel-patio-tons-calculator', l: 14, w: 14, dIn: 3, mat: '3/8" Decorative Pea Gravel / River Rock', density: 1.35, app: '14×14 Backyard Fire Pit Pea Gravel Seating Area (3" Deep)' },
  { slug: '16x20-paver-patio-gravel-base-tons-calculator', l: 20, w: 16, dIn: 4, mat: 'Crusher Run / Dense Grade Paver Base', density: 1.45, app: '16×20 Backyard Paver Patio Compacted Base (4" Deep)' },
  { slug: '20x20-garage-slab-gravel-subbase-tons-calculator', l: 20, w: 20, dIn: 4, mat: '#57 Crushed Limestone Capillary Break Base', density: 1.40, app: '20×20 2-Car Garage Slab 4-Inch Gravel Sub-Base' },
  { slug: '24x24-garage-slab-gravel-subbase-tons-calculator', l: 24, w: 24, dIn: 4, mat: '#57 Crushed Stone / Dense Grade Base', density: 1.42, app: '24×24 Oversized 2-Car Garage Slab Gravel Sub-Base (4")' },
  { slug: '24x36-three-car-garage-gravel-base-tons', l: 36, w: 24, dIn: 4, mat: 'Compacted Crusher Run / #57 Stone', density: 1.42, app: '24×36 3-Car Garage Foundation Gravel Sub-Base (4")' },
  { slug: '30x40-pole-barn-gravel-floor-pad-tons-calculator', l: 40, w: 30, dIn: 4, mat: 'Compacted Crusher Run / Limestone Screenings', density: 1.45, app: '30×40 Pole Barn Building Pad & Floor Sub-Base (4" Deep)' },
  { slug: '30x40-pole-barn-6-inch-gravel-pad-tons', l: 40, w: 30, dIn: 6, mat: '6-Inch Compacted Road Base / Crusher Run', density: 1.45, app: '30×40 Heavy Equipment Pole Barn Gravel Pad (6" Deep)' },
  { slug: '40x60-pole-barn-gravel-base-tons-calculator', l: 60, w: 40, dIn: 4, mat: 'Compacted Quarry Run / #57 Crushed Stone', density: 1.42, app: '40×60 Commercial Pole Barn Floor Sub-Base (4" Deep)' },
  { slug: 'french-drain-trench-100-ft-57-drainage-stone-tons', l: 100, w: 1.5, dIn: 18, mat: 'Washed #57 Drainage Stone (No Fines)', density: 1.35, app: '100-Foot French Drain Trench (18" Wide × 18" Deep)' },
  { slug: 'french-drain-trench-50-ft-gravel-tons-calculator', l: 50, w: 1.5, dIn: 18, mat: 'Washed #57 Crushed Stone / River Rock', density: 1.35, app: '50-Foot Yard French Drain Trench (18" Wide × 18" Deep)' },
  { slug: 'retaining-wall-backfill-50-ft-57-gravel-tons', l: 50, w: 1.5, dIn: 36, mat: 'Washed Angular #57 Drainage Backfill Stone', density: 1.38, app: '50-Foot Segmental Retaining Wall Drainage Zone (18"×36")' },
  { slug: '1-cubic-yard-of-gravel-to-tons-weight-conversion', l: 9, w: 9, dIn: 4, mat: '#57 Stone vs Pea Gravel vs Crusher Run (1 Cubic Yard)', density: 1.40, app: 'How Much Does 1 Cubic Yard of Gravel Weigh in Tons & Lbs?' },
  { slug: 'dump-truck-load-of-gravel-tons-and-coverage-chart', l: 100, w: 12, dIn: 3, mat: 'Tandem-Axle (15 Tons) vs Tri-Axle (22 Tons) Dump Truck', density: 1.40, app: 'How Far Does 1 Dump Truck Load of Gravel Go? (Sq Ft Chart)' },
  { slug: '57-stone-vs-crusher-run-411-driveway-gravel', l: 100, w: 10, dIn: 4, mat: '#57 Open-Graded Stone vs #411 Crusher Run with Fines', density: 1.42, app: '#57 Crushed Stone vs Crusher Run: Which Is Best for Driveways?' },
  { slug: 'decomposed-granite-patio-12x16-tons-calculator', l: 16, w: 12, dIn: 3, mat: 'Stabilized Decomposed Granite (DG Fines)', density: 1.50, app: '12×16 Compacted Decomposed Granite Walkway & Patio (3" Deep)' },
  { slug: 'river-rock-landscape-bed-4x50-tons-calculator', l: 50, w: 4, dIn: 3, mat: '1"–3" Washed Decorative River Rock Cobbles', density: 1.35, app: '4×50 Foundation Landscape Bed River Rock Mulch (3" Deep)' }
];

const gravel = gravelConfigs.map(g => {
  const areaSqFt = +(g.l * g.w).toFixed(1);
  const netCuFt = areaSqFt * (g.dIn / 12);
  const netCuYds = netCuFt / 27;
  const grossCuYds = +(netCuYds * 1.15).toFixed(2);
  const grossTons = +(grossCuYds * g.density).toFixed(2);
  const grossLbs = Math.round(grossTons * 2000);
  const bags50lb = Math.ceil((netCuFt * 1.15) / 0.50);
  const tandemTruckLoads15Ton = +(grossTons / 15).toFixed(1);
  const bulkMaterialCost = Math.round(grossTons * 42);
  const deliveryFee = grossTons <= 15 ? 145 : Math.ceil(grossTons / 18) * 145;
  const totalDeliveredCost = bulkMaterialCost + deliveryFee;

  return {
    slug: g.slug,
    title: `${g.app}: Gravel Tons, Cubic Yards & Cost Calculator`,
    shortLabel: g.app,
    lengthFt: g.l, widthFt: g.w, depthIn: g.dIn,
    materialName: g.mat, densityTonsPerYard: g.density,
    areaSqFt, netCubicYards: +netCuYds.toFixed(2), grossCubicYards: grossCuYds,
    grossTons, grossLbs, bags50lb, tandemTruckLoads15Ton,
    bulkMaterialCost, deliveryFee, totalDeliveredCost
  };
});

fs.writeFileSync(path.join(DATA_DIR, 'slabs.json'), JSON.stringify(slabs, null, 2));
fs.writeFileSync(path.join(DATA_DIR, 'projects.json'), JSON.stringify(projects, null, 2));
fs.writeFileSync(path.join(DATA_DIR, 'footings.json'), JSON.stringify(footings, null, 2));
fs.writeFileSync(path.join(DATA_DIR, 'gravel.json'), JSON.stringify(gravel, null, 2));

console.log(`[SlabYardMatrix Seed] Generated:
  - ${slabs.length} Concrete Slab Dimension Pages
  - ${projects.length} High-Intent Project Guides
  - ${footings.length} Sonotube Post-Hole & Continuous Footing Pages
  - ${gravel.length} Driveway Gravel & Base Tonnage Pages
  Total Data Pages: ${slabs.length + projects.length + footings.length + gravel.length} (+ 5 Core/Compliance = ${slabs.length + projects.length + footings.length + gravel.length + 5} Pages)`);
