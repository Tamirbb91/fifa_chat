
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatchService } from './service/match-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import {MatTableDataSource} from '@angular/material';
import { Observable, timer } from 'rxjs';

@Component({
  selector: 'match',
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.css']
})  
export class MatchComponent implements OnInit{

  loading: boolean = true;
  matches;
  type;
  dataSource;
  matchesSubscription;
  timerSubscription

  displayedColumns = ['date','hour', 'homeCountry','goals', 'awayCountry', 'status'];

  constructor(private matchService: MatchService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.type = params['type'];

      if (this.matchesSubscription) {
        this.matchesSubscription.unsubscribe();
      }
      if (this.timerSubscription) {
          this.timerSubscription.unsubscribe();
      }

      this.refreshData();
    })
  }

  // fetch matches with real time data 
  refreshData(){
    this.matchesSubscription = this.matchService.getMatches(this.type).subscribe(matches => {
        this.matches = matches;

        if(this.type == null){
          const ELEMENT_DATA: PeriodicElement[] = [];
          for(let m of this.matches){
            console.log(m.home_team.country + " " + m.datetime + " " + m.fifa_id)
            ELEMENT_DATA.push({date: m.datetime.substring(0,10),hour: m.datetime.substring(11,16), homeCountry: m.home_team.country, goals: m.home_team.goals + ' : ' + m.away_team.goals, awayCountry: m.away_team.country,  status: m.status})
          }
          this.dataSource = new MatTableDataSource(ELEMENT_DATA);
        }

        this.loading=false;

        if(this.type == 'current' && this.matches != 0) {
          console.log("calling subscription ...")
          this.subscribeToData();
        }
    });
  }

  subscribeToData(): void {
    this.timerSubscription = timer(20000).subscribe(() => this.refreshData());
  }

  // table filter
  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); 
    filterValue = filterValue.toLowerCase(); 
    this.dataSource.filter = filterValue;
  }

  showChat(fifa_id: string){
    this.router.navigate(['/chat/'+ fifa_id]);
  }

}

export interface PeriodicElement {
  date: string;
  hour: string;
  homeCountry: string;
  awayCountry: string;
  goals: string;
  status: string;
}

