import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OlympicService } from '../core/services/olympic.service';
import { pipe, Subscription } from 'rxjs';
import { Olympic } from '../core/models/Olympic';

@Component({
  selector: 'app-country-details',
  standalone: true,
  templateUrl: './country-details.component.html',
  styleUrl: './country-details.component.scss',
})
export class CountryDetailsComponent implements OnInit {
  private subscription: Subscription = new Subscription();
  countryDetails!: Olympic | null;

  constructor(private route: ActivatedRoute, private olympicService: OlympicService) {}

  ngOnInit(): void {
    const countryId = this.route.snapshot.params['id'];
    const sub = this.olympicService.getOlympics().subscribe((data: Olympic[] | null) => {
      if (data?.length) {
        const countryFind = data.find(v => v.id === Number(countryId))
        if(countryFind) {
          this.countryDetails = countryFind;
        }
      }
    });

    this.subscription.add(sub);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe()
  }
}
