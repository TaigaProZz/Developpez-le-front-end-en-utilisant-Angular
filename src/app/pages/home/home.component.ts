import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, interval, Observable, of, Subject, Subscription, take, takeUntil, tap } from 'rxjs';
import { Olympic } from 'src/app/core/models/Olympic';
import { PieChart } from 'src/app/core/models/PieChart';
import { OlympicService } from 'src/app/core/services/olympic.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgxChartsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {

  private destroy$!: Subject<boolean>;

  chartData: PieChart[] = [];
  joTotal: number = 0
  countriesTotal: number = 0
  errorMessage: string | null = null

  // chart options
  showLabels: boolean = true;

  constructor(private olympicService: OlympicService, private router: Router) {}

  ngOnInit(): void {
    this.destroy$ = new Subject<boolean>()

    this.olympicService.getOlympics().pipe(
      takeUntil(this.destroy$),
      tap((data: Olympic[]) => {
        if (data?.length) {

          this.chartData = this.transformDataForChart(data);
          this.countriesTotal = data.length;
        }
      }),
      catchError((error) => {
        this.errorMessage = 'Une erreur est survenue. Veuillez réessayer ultérieurement.';
        return of(null);
      })
    ).subscribe()
  }

  // on click chart element
  onSelect(data: PieChart): void {
    const countryId = this.chartData.find(item => item.name === data.name)?.id;
    if (countryId) {
      this.router.navigateByUrl('country-details/' + countryId);
    }
  }

  // mock data for chart
  private transformDataForChart(data: Olympic[]): PieChart[] {
    return data.map(olympic => ({
      id: olympic.id,
      name: olympic.country,
      value: olympic.participations.reduce((acc, p) => acc + p.medalsCount, 0)
    }));
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
  }
}
