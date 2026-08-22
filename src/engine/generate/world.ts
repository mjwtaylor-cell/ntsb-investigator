/** World generation: archetype → operator → crew → maintenance → environment. */

import { createRng, type Rng } from '../rng';
import { getArchetype, listArchetypes } from '../archetypes';
import type { Archetype } from '../archetypes';
import type {
  ArchetypeId,
  CrewMember,
  Difficulty,
  Environment,
  MaintenanceHistory,
  MelItem,
  OperatorProfile,
  TemplateId,
  TimeOfDay,
  World,
} from '../types';

export interface GenerateOpts {
  archetype?: ArchetypeId;
  template?: TemplateId;
  difficulty?: Difficulty;
}

export interface WorldGenResult {
  world: World;
  archetype: Archetype;
  difficulty: Difficulty;
}

const OPERATOR_NAMES = [
  'Pinewood Air',
  'Cascade Charter',
  'Northern Feather Lines',
  'Halcyon Regional',
  'Meridian Flight Club',
  'Kestrel Commuter',
  'Aurora Link',
  'High Plains Hop',
] as const;

const CREW_FIRST = [
  'Jordan',
  'Alex',
  'Casey',
  'Riley',
  'Morgan',
  'Taylor',
  'Quinn',
  'Avery',
  'Reese',
  'Parker',
] as const;

const CREW_LAST = [
  'Hale',
  'Brooks',
  'Nguyen',
  'Okada',
  'Silva',
  'Kline',
  'Vargas',
  'Patel',
  'Mendez',
  'Whitaker',
] as const;

const AIRPORTS: ReadonlyArray<{
  id: string;
  name: string;
  state: string;
  terrain: string;
  runway: string;
  elevationFt: number;
}> = [
  {
    id: 'KPWD',
    name: 'Pinewood Municipal',
    state: 'MT',
    terrain: 'rolling foothills',
    runway: '12/30 asphalt 5200×75',
    elevationFt: 4120,
  },
  {
    id: 'KCRK',
    name: 'Cedar Creek Regional',
    state: 'OR',
    terrain: 'forested valley',
    runway: '07/25 asphalt 6400×100',
    elevationFt: 980,
  },
  {
    id: 'KFAR',
    name: 'Fairfield Field',
    state: 'KS',
    terrain: 'flat prairie',
    runway: '18/36 asphalt 4800×75',
    elevationFt: 1420,
  },
  {
    id: 'KLKT',
    name: 'Lakeview County',
    state: 'MI',
    terrain: 'lakeshore flats',
    runway: '09/27 asphalt 5500×100',
    elevationFt: 620,
  },
  {
    id: 'KBRN',
    name: 'Burnside Municipal',
    state: 'CO',
    terrain: 'high plains / rising terrain east',
    runway: '08/26 asphalt 7000×100',
    elevationFt: 5340,
  },
  {
    id: 'KSGR',
    name: 'Sugar Ridge',
    state: 'TN',
    terrain: 'ridge and river valley',
    runway: '05/23 asphalt 5000×75',
    elevationFt: 890,
  },
];

/** Curated seed → archetype (matches DESIGN B2.13 walkthrough for 1174). */
const CURATED_ARCHETYPE: Readonly<Record<string, ArchetypeId>> = {
  '1174': 'A2',
};

function pickArchetype(seed: string, rng: Rng, opts: GenerateOpts): Archetype {
  if (opts.archetype) return getArchetype(opts.archetype);
  const curated = CURATED_ARCHETYPE[seed];
  if (curated) return getArchetype(curated);
  return rng.pick(listArchetypes());
}

function buildOperator(arch: Archetype, rng: Rng): OperatorProfile {
  return {
    id: `op.${rng.nextInt(1000, 9999)}`,
    name: rng.pick(OPERATOR_NAMES),
    opsPart: arch.opsPart,
    sopQuality: 0.35 + rng.next() * 0.55,
    schedulePressure: 0.2 + rng.next() * 0.7,
    maintenanceCulture: 0.3 + rng.next() * 0.6,
  };
}

function buildCrew(arch: Archetype, rng: Rng, fatalHeavy: boolean): CrewMember[] {
  const crew: CrewMember[] = [];
  const roles = [
    ...Array.from({ length: arch.crewFlight }, (_, i) =>
      i === 0 ? ('pic' as const) : ('sic' as const),
    ),
    ...Array.from({ length: arch.crewCabin }, () => 'cabin' as const),
  ];
  for (let i = 0; i < roles.length; i++) {
    const role = roles[i]!;
    const survived = !fatalHeavy && rng.chance(role === 'cabin' ? 0.7 : 0.25);
    crew.push({
      id: `crew.${role}.${i}`,
      role,
      displayName: `${rng.pick(CREW_FIRST)} ${rng.pick(CREW_LAST)}`,
      certificates:
        role === 'cabin'
          ? ['cabin-crew']
          : role === 'pic'
            ? ['ATP-or-Commercial', 'type-or-class', 'medical-2']
            : ['Commercial', 'instrument', 'medical-2'],
      totalHours: role === 'cabin' ? rng.nextInt(200, 4000) : rng.nextInt(800, 12000),
      typeHours: role === 'cabin' ? rng.nextInt(50, 2000) : rng.nextInt(100, 4500),
      recencyDays: rng.nextInt(1, 45),
      crmQuality: 0.35 + rng.next() * 0.55,
      survived,
    });
  }
  return crew;
}

function buildMaintenance(arch: Archetype, rng: Rng): MaintenanceHistory {
  const melItems: MelItem[] = [];
  if (arch.systems.antiIce === 'boots' && rng.chance(0.55)) {
    melItems.push({
      id: 'mel.boots.rh_outboard',
      description: 'De-ice boots, outboard RH — deferred',
      category: 'C',
      deferredDay: rng.nextInt(1, 10),
      improperRepeat: rng.chance(0.45),
    });
  }
  if (rng.chance(0.35)) {
    melItems.push({
      id: 'mel.nav_light',
      description: 'Navigation light inoperative — deferred',
      category: 'C',
      deferredDay: rng.nextInt(1, 8),
    });
  }
  return {
    recentWorkOrders: [
      `WO-${rng.nextInt(40000, 49999)}: ${rng.pick(['100-hr inspection', 'phase check', 'engine boroscope', 'avionics R&R'])}`,
      `WO-${rng.nextInt(40000, 49999)}: ${rng.pick(['tire change', 'oil analysis', 'SB review', 'cabin oxygen service'])}`,
    ],
    adSbComplianceNotes: [
      rng.chance(0.5)
        ? 'SB revision interval ambiguity noted in last shop visit'
        : 'AD/SB package current on paper',
    ],
    melItems,
    flags: rng.chance(0.3) ? ['minor logbook gap (unrelated item)'] : [],
  };
}

function buildEnvironment(rng: Rng, wxRng: Rng): Environment {
  const ap = rng.pick(AIRPORTS);
  const timeOfDay: TimeOfDay = wxRng.pick(['day', 'night', 'dawn', 'dusk']);
  const wxBits = [
    wxRng.pick(['VFR', 'MVFR', 'IFR']),
    wxRng.pick(['clear', 'broken', 'overcast', 'freezing drizzle', 'light snow', 'haze']),
    `wind ${wxRng.nextInt(4, 28)} kt`,
  ];
  return {
    airportId: ap.id,
    airportName: ap.name,
    state: ap.state,
    terrain: ap.terrain,
    runway: ap.runway,
    elevationFt: ap.elevationFt,
    timeOfDay,
    weatherSummary: wxBits.join('; '),
  };
}

function buildOccupants(
  arch: Archetype,
  crew: CrewMember[],
  rng: Rng,
): World['occupants'] {
  const paxMax = Math.max(0, arch.seats - arch.crewFlight - arch.crewCabin);
  const passengers = rng.nextInt(0, paxMax);
  const total = arch.crewFlight + arch.crewCabin + passengers;
  const fatalities = rng.nextInt(Math.ceil(total * 0.3), total);
  const seriousInjuries = Math.min(total - fatalities, rng.nextInt(0, 4));
  return {
    crewFlight: arch.crewFlight,
    crewCabin: arch.crewCabin,
    passengers,
    fatalities,
    seriousInjuries,
  };
}

/**
 * Seed → World. Uses named forks: world, crew, maintenance, weather.
 * Template selection happens in truth.ts (fork `template`).
 */
export function generateWorld(seed: string, opts: GenerateOpts = {}): WorldGenResult {
  const root = createRng(seed);
  const worldRng = root.fork('world');
  const crewRng = root.fork('crew');
  const maintRng = root.fork('maintenance');
  const wxRng = root.fork('weather');

  const archetype = pickArchetype(seed, worldRng, opts);
  const difficulty: Difficulty = opts.difficulty ?? 'standard';
  const operator = buildOperator(archetype, worldRng);
  const fatalHeavy = worldRng.chance(0.65);
  const crew = buildCrew(archetype, crewRng, fatalHeavy);
  const maintenance = buildMaintenance(archetype, maintRng);
  const environment = buildEnvironment(worldRng, wxRng);
  const occupants = buildOccupants(archetype, crew, worldRng);

  const world: World = {
    seed,
    archetypeId: archetype.id,
    operator,
    crew,
    maintenance,
    environment,
    occupants,
  };

  return { world, archetype, difficulty };
}
