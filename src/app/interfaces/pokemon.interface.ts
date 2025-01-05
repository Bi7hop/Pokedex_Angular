export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: PokemonType[];
  stats: PokemonStat[];
  abilities: PokemonAbility[];
  sprites: {
    other: {
      home: {
        front_default: string;
      }
    }
  };
}

export interface PokemonType {
  type: {
    name: string;
  };
}

export interface PokemonStat {
  base_stat: number;
  stat: {
    name: string;
  };
}

export interface PokemonAbility {
  ability: {
    name: string;
  };
}

export interface PokemonSpecies {
  flavor_text_entries: FlavorTextEntry[];
  evolution_chain: {
    url: string;
  };
}

export interface FlavorTextEntry {
  flavor_text: string;
  language: {
    name: string;
  };
}

export interface EvolutionChain {
  chain: ChainLink;
}

export interface ChainLink {
  species: {
    name: string;
  };
  evolves_to: ChainLink[];
}