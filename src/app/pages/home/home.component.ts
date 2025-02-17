import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, of, Subscription } from 'rxjs';
import { Olympic } from 'src/app/core/models/Olympic';
import { PieChart } from 'src/app/core/models/PieChart';
import { OlympicService } from 'src/app/core/services/olympic.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  private subscription: Subscription = new Subscription();

  chartData: PieChart[] = [];
  joTotal: number = 0
  countriesTotal: number = 0
  errorMessage: string | null = null

  // chart options
  showLabels: boolean = true;

  constructor(private olympicService: OlympicService, private router: Router) {}


  ngOnInit(): void {
    const sub = this.olympicService.getOlympics()
    // .pipe(
    //   catchError((error) => {
    //     console.log("rrrf");

    //     console.error('Erreur de chargement des données :', error);
    //     this.errorMessage = 'Une erreur est survenue. Veuillez réessayer ultérieurement.';
    //     return of(null);
    //   })
    // )
    .subscribe((data: Olympic[] | null) => {
      if (data && data.length) {
        this.chartData = this.transformDataForChart(data);
        this.countriesTotal = data.length;
      }
    });

    this.subscription.add(sub);
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
    this.subscription.unsubscribe()
  }
}
