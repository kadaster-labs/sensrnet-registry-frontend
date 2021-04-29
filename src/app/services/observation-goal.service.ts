import { EnvService } from './env.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface IObservationGoal {
  _id: string;
  name: string;
  description: string;
  legalGround?: string;
  legalGroundLink?: string;
  canEdit?: boolean;
}

export interface IRegisterObservationGoalBody {
  name: string;
  description: string;
  legalGround?: string;
  legalGroundLink?: string;
}

export interface IUpdateObservationGoalBody {
  name?: string;
  description?: string;
  legalGround?: string;
  legalGroundLink?: string;
}

@Injectable({ providedIn: 'root' })
export class ObservationGoalService {

  constructor(
    private http: HttpClient,
    private env: EnvService,
  ) {}

  public register(observationGoal: IRegisterObservationGoalBody) {
    return this.http.post(`${this.env.apiUrl}/observationgoal`, observationGoal);
  }

  public update(observationGoalId: string, observationGoal: IUpdateObservationGoalBody) {
    return this.http.put(`${this.env.apiUrl}/observationgoal/${observationGoalId}`, observationGoal);
  }

  public delete(observationGoalId: string) {
    return this.http.delete(`${this.env.apiUrl}/observationgoal/${observationGoalId}`);
  }

  public get(observationGoalId: string) {
    return this.http.get(`${this.env.apiUrl}/observationgoal/${observationGoalId}`);
  }

  public getObservationGoals(args: Record<string, any>) {
    let url = `${this.env.apiUrl}/observationgoal?pageIndex=${args.pageIndex}&pageSize=${args.pageSize}`;
    if (args.name) {
      url += `&name=${args.name}`;
    }
    if (args.sortField) {
      url += `&sortField=${args.sortField}`;
    }
    if (args.sortDirection) {
      url += `&sortDirection=${args.sortDirection}`;
    }

    return this.http.get(url);
  }
}
