import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OlympicService } from '../core/services/olympic.service';
import { catchError, of, Subject, takeUntil, tap } from 'rxjs';
import { Olympic } from '../core/models/Olympic';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { Participation } from '../core/models/Participation';
import { LineChart } from '../core/models/LineChart';
import { Location } from '@angular/common';

@Component({
  selector: 'app-country-details',
  standalone: true,
  imports: [NgxChartsModule],
  templateUrl: './country-details.component.html',
  styleUrl: './country-details.component.scss',
})
export class CountryDetailsComponent implements OnInit {
  private destroy$!: Subject<boolean>;

  countryDetails!: Olympic | null;
  countryParticipation: Participation[] = [];
  countryChart: LineChart[] = [];

  errorMessage: string = '';
  isLoading: boolean = false;

  // chart options
  legend: boolean = true;
  showLabels: boolean = true;
  animations: boolean = true;
  xAxis: boolean = true;
  yAxis: boolean = true;
  showYAxisLabel: boolean = true;
  showXAxisLabel: boolean = true;
  xAxisLabel: string = 'Dates';
  timeline: boolean = true;

  constructor(private route: ActivatedRoute, private olympicService: OlympicService, private location: Location) {}

  ngOnInit(): void {
    this.isLoading = true
    this.destroy$ = new Subject<boolean>();

    const countryId = this.route.snapshot.params['id'];

    // get country data by id
    this.olympicService.getOlympics().pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        this.errorMessage = `Erreur lors du chargement des données. ${error?.message}`
        this.isLoading = false;
        return of(null);
      }),
      tap((data: Olympic[] | null ) => {
        if (data) {
          const countryFind = data.find(v => v.id === Number(countryId))

          // if country is found by id, assign data to dom
          if (countryFind) {
            this.countryDetails = countryFind;
            this.countryChart = this.transformDataForChart(countryFind);
            this.countryParticipation = this.countryDetails.participations;
            this.isLoading = false;
          }
        }
      })
    ).subscribe()
  }

  // go back router
  goBack(): void {
    this.location.back();
  }

  totalEntriesOlympics(): number {
    return this.countryParticipation.length;
  }

  totalNumberMedals() {
    return this.countryParticipation.reduce((acc, curr) => acc + curr.medalsCount, 0);
  }

  totalAthletes(): number {
    return this.countryParticipation.length;
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);

  }

  // mock data for chart
  private transformDataForChart(data: Olympic): LineChart[] {
    const series = data.participations.map((el) => ({
      name: el.year,
      value: el.medalsCount
    }));

    return [{
      id: data.id,
      name: data.country,
      series: series
    }];
  }
}
