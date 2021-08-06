import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from '../../services/alert.service';
import { ModalService } from '../../services/modal.service';
import { IObservationGoal, ObservationGoalService } from '../../services/observation-goal.service';

@Component({
    selector: 'app-observation-goals',
    templateUrl: './observation-goals.component.html',
    styleUrls: ['./observation-goals.component.scss'],
})
export class ObservationGoalsComponent implements OnInit, OnDestroy {
    public subscriptions = [];
    public observationGoals: IObservationGoal[] = [];

    public pageIndex = 0;
    public pageSize = 15;

    public sortField = 'name';
    public sortDirections = { ASCENDING: 'ASCENDING', DESCENDING: 'DESCENDING' };
    public sortDirection = this.sortDirections.ASCENDING;

    public successString = $localize`:@@goal.success:Successfully removed observation goal.`;

    public confirmTitleString = $localize`:@@remove.goal.confirm.title:Please confirm`;
    public confirmBodyString = $localize`:@@remove.goal.confirm.body:Do you really want to remove the observation goal?`;

    constructor(
        private readonly router: Router,
        private readonly modalService: ModalService,
        private readonly alertService: AlertService,
        private readonly observationGoalService: ObservationGoalService,
    ) {}

    public async getPreviousPage() {
        if (this.pageIndex > 0) {
            await this.getPage(this.pageIndex - 1);
        }
    }

    public async getNextPage() {
        if (this.observationGoals.length === this.pageSize) {
            await this.getPage(this.pageIndex + 1);
        }
    }

    public async getPage(pageIndex) {
        const goalsPromise = this.observationGoalService
            .getObservationGoals({
                pageIndex,
                pageSize: this.pageSize,
                sortField: this.sortField,
                sortDirection: this.sortDirection,
            })
            .toPromise();
        this.observationGoals = (await goalsPromise) as IObservationGoal[];

        this.pageIndex = pageIndex;
    }

    public async editObservationGoal(observationGoalId: string): Promise<void> {
        await this.router.navigate([`/observationgoal/${observationGoalId}`]);
    }

    public async removeObservationGoal(observationGoalId: string): Promise<void> {
        await this.modalService.confirm(this.confirmTitleString, this.confirmBodyString).then(
            () => {
                try {
                    this.observationGoalService.delete(observationGoalId).toPromise();
                    this.getPage(this.pageIndex);

                    this.alertService.success(this.successString);
                } catch (e) {
                    this.alertService.error(e.error.message);
                }
            },
            () => {},
        );
    }

    getSortClass(sortField) {
        let sortClass;
        if (this.sortField === sortField) {
            if (this.sortDirection === this.sortDirections.ASCENDING) {
                sortClass = 'sort-up';
            } else {
                sortClass = 'sort-down';
            }
        } else {
            sortClass = 'sort';
        }

        return sortClass;
    }

    async setSort(sortField) {
        if (sortField === this.sortField) {
            this.sortDirection =
                this.sortDirection === this.sortDirections.ASCENDING
                    ? this.sortDirections.DESCENDING
                    : this.sortDirections.ASCENDING;
        }

        this.sortField = sortField;
        await this.getPage(this.pageIndex);
    }

    async ngOnInit(): Promise<void> {
        await this.getPage(0);
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((x) => x.unsubscribe());
    }
}
