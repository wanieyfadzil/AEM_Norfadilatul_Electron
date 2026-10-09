
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  Observable,
  catchError,
  from,
  map,
  of,
  switchMap,
  throwError
} from 'rxjs';

import PouchDB from 'pouchdb-browser';

export interface DashboardResponse {
  success: boolean;
  chartDonut: any[];
  chartBar: any[];
  tableUsers: any[];
  offlineCache?: boolean;
  cachedAt?: string;
}

interface DashboardCache {
  _id: string;
  _rev?: string;
  type: 'dashboard-cache';
  data: DashboardResponse;
  cachedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly dashboardUrl =
    'http://test-demo.aemenersol.com/api/dashboard';

  private readonly db = new PouchDB('aem_dashboard_cache');

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<DashboardResponse> {
    return this.http
      .get<DashboardResponse>(this.dashboardUrl)
      .pipe(
        // Cache successful responses before returning them.
        switchMap(response =>
          from(this.saveCache(response)).pipe(
            map(() => response),
            catchError(cacheError => {
              console.warn(
                'Could not save dashboard cache:',
                cacheError
              );

              // Online dashboard should still work if caching fails.
              return of(response);
            })
          )
        ),

        // Use the last cached response when the API is unavailable.
        catchError((error: HttpErrorResponse) => {
          const apiUnavailable =
            error.status === 0 || error.status >= 500;

          if (!apiUnavailable) {
            return throwError(() => error);
          }

          return from(this.readCache()).pipe(
            switchMap(cached => {
              if (cached) {
                return of({
                  ...cached,
                  offlineCache: true
                });
              }

              return throwError(() => error);
            })
          );
        })
      );
  }

  private async saveCache(
    response: DashboardResponse
  ): Promise<void> {
    const id = 'dashboard-latest';

    const document: DashboardCache = {
      _id: id,
      type: 'dashboard-cache',
      data: response,
      cachedAt: new Date().toISOString()
    };

    try {
      const existing = await this.db.get(id);

      await this.db.put({
        ...document,
        _rev: existing._rev
      });
    } catch (error: any) {
      if (error.status === 404) {
        await this.db.put(document);
      } else {
        throw error;
      }
    }
  }

  private async readCache(): Promise<DashboardResponse | null> {
    try {
      const cached = await this.db.get(
        'dashboard-latest'
      ) as DashboardCache;

      return {
        ...cached.data,
        cachedAt: cached.cachedAt
      };
      
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }

      throw error;
    }
  }
}