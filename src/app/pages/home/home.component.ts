import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, of, Subject, takeUntil, tap } from 'rxjs';
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
  joTotal: number = 0;
  countriesTotal: number = 0;
  errorMessage: string = '';
  isLoading: boolean = false;

  // chart options
  showLabels: boolean = true;

  constructor(private olympicService: OlympicService, private router: Router) {}

  ngOnInit(): void {
    this.isLoading = true
    this.destroy$ = new Subject<boolean>()
    // get list of country datas
    this.olympicService.getOlympics().pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        this.errorMessage = `Erreur lors du chargement des données. ${error?.message}`
        return of(null);
      }),
      tap((data: Olympic[] | null) => {
        if (data) {
          // mock data to display it in chart
          this.chartData = this.transformDataForChart(data);
          this.countriesTotal = data.length;
          this.joTotal = this.getTotalJoYears(data);
        }
      }),
    ).subscribe()
    this.isLoading = false
  }

  // count jo's event
  getTotalJoYears(data: Olympic[]): number {
    const yearsSet = new Set<number>();
    data.forEach(country => {
      country.participations.forEach(participation => {
        yearsSet.add(participation.year);
      });
    });
    return yearsSet.size;
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
