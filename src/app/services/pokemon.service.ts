import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, BehaviorSubject, combineLatest } from 'rxjs';
import { Pokemon } from '../interfaces/pokemon.interface';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PokemonService {
  private apiUrl = 'https://pokeapi.co/api/v2/pokemon/';
  private speciesUrl = 'https://pokeapi.co/api/v2/pokemon-species/';
  
  private pokemonCache = new BehaviorSubject<Pokemon[]>([]);
  private searchTerm = new BehaviorSubject<string>('');
  
  constructor(private http: HttpClient) {}

  getPokemon(id: number): Observable<Pokemon> {
    return this.http.get<Pokemon>(`${this.apiUrl}${id}`);
  }

  getPokemonByName(name: string): Observable<Pokemon> {
    return this.http.get<Pokemon>(`${this.apiUrl}${name}`);
  }

  getPokemonBatch(start: number, limit: number): Observable<Pokemon[]> {
    const requests: Observable<Pokemon>[] = [];
    for (let i = start; i < start + limit; i++) {
      requests.push(this.getPokemon(i));
    }
    return forkJoin(requests).pipe(
      map(pokemon => {
        this.pokemonCache.next(pokemon); 
        return pokemon;
      })
    );
  }

  getPokemonSpecies(id: number): Promise<any> {
    return this.http.get(`${this.speciesUrl}${id}`).toPromise();
  }

  getEvolutionChain(id: number): Promise<any> {
    return this.http.get(`${this.speciesUrl}${id}`)
      .pipe(
        switchMap((species: any) => {
          const evolutionChainUrl = species.evolution_chain.url;
          return this.http.get(evolutionChainUrl);
        })
      ).toPromise();
  }

  updateSearchTerm(term: string): void {
    this.searchTerm.next(term.toLowerCase());
  }

  getFilteredPokemon(): Observable<Pokemon[]> {
    return combineLatest([
      this.pokemonCache,
      this.searchTerm
    ]).pipe(
      map(([pokemon, term]) => {
        if (!term) {
          return pokemon;
        }
        return pokemon.filter(p => 
          p.name.toLowerCase().includes(term) ||
          p.id.toString().includes(term) ||
          (p.types && p.types.some(type => 
            type.type.name.toLowerCase().includes(term)
          ))
        );
      })
    );
  }
}