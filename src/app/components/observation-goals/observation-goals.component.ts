import {Component, OnDestroy, OnInit} from '@angular/core';
import {IObservationGoal, ObservationGoalService} from '../../services/observation-goal.service';

@Component({
  selector: 'app-observation-goals',
  templateUrl: './observation-goals.component.html',
  styleUrls: ['./observation-goals.component.scss']
})
export class ObservationGoalsComponent implements OnInit, OnDestroy {
  public subscriptions = [];
  public observationGoals = [];

  public pageIndex = 0;
  public pageSize = 15;

  constructor(
    private readonly observationGoalService: ObservationGoalService,
  ) {}

  public async getPreviousPage() {
    if (this.pageIndex > 0) {
      await this.getPage(this.pageIndex - 1);
    }
  }

  public async getNextPage() {
    await this.getPage(this.pageIndex + 1);
  }

  public async getPage(pageIndex) {
    this.pageIndex = pageIndex;

    const goalsPromise = this.observationGoalService.getObservationGoals(this.pageIndex, this.pageSize).toPromise();
    this.observationGoals = await goalsPromise as IObservationGoal[];
  }

  async ngOnInit(): Promise<void> {
    await this.getPage(0);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(x => x.unsubscribe());
  }
}
