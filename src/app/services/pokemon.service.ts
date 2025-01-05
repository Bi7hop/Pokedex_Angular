import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { Pokemon } from '../interfaces/pokemon.interface';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PokemonService {
  private apiUrl = 'https://pokeapi.co/api/v2/pokemon/';
  private speciesUrl = 'https://pokeapi.co/api/v2/pokemon-species/';
  
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
    return forkJoin(requests);
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
}