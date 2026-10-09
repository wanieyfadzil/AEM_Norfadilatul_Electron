import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild
} from '@angular/core';

import { Router } from '@angular/router';

import * as d3 from 'd3';

import {
  DashboardService,
  DashboardResponse
} from '../../core/services/dashboard.service';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent
  implements AfterViewInit, OnDestroy {

  @ViewChild('donutChart')
  donutChartElement!: ElementRef<HTMLDivElement>;

  @ViewChild('barChart')
  barChartElement!: ElementRef<HTMLDivElement>;

  users: any[] = [];

  isLoading = true;
  dashboardError = '';

  isOfflineCache = false;
  cachedAt: string | null = null;

  private dashboardData?: DashboardResponse;

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngAfterViewInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {

    this.isLoading = true;
    this.dashboardError = '';

    this.isOfflineCache = false;
    this.cachedAt = null;   

    this.dashboardService
      .getDashboard()
      .subscribe({

        next: response => {

          console.log(
            'Dashboard API response:',
            response
          );

          this.dashboardData = response;

          this.cachedAt = response.cachedAt ?? null;

          this.users =
            response.tableUsers || [];

          this.isLoading = false;

          this.isOfflineCache = response.offlineCache === true;

          setTimeout(() => {

            this.renderDonutChart(
              response.chartDonut || []
            );

            this.renderBarChart(
              response.chartBar || []
            );

          });

        },

        error: error => {

          console.error(
            'Dashboard API failed:',
            error
          );

          this.isLoading = false;

          this.dashboardError =
            'Unable to load dashboard data.';
        }

      });
  }


  // =========================
  // D3 Donut Chart
  // =========================

  renderDonutChart(data: any[]): void {

    const element =
      this.donutChartElement.nativeElement;

    d3.select(element)
      .selectAll('*')
      .remove();


    const width = 300;
    const height = 220;

    const radius =
      Math.min(width, height) / 2;


    const svg = d3
      .select(element)
      .append('svg')
      .attr('width', '100%')
      .attr('height', height)
      .attr(
        'viewBox',
        `0 0 ${width} ${height}`
      );


    const group = svg
      .append('g')
      .attr(
        'transform',
        `translate(${width / 2},${height / 2})`
      );


    const values = data.map(
      item => Number(
        item.value ??
        item.data ??
        item.count ??
        item.total ??
        0
      )
    );


    const labels = data.map(
      item =>
        item.label ??
        item.name ??
        item.title ??
        item.category ??
        ''
    );


    const pie = d3
      .pie<number>()
      .sort(null)
      .value(value => value);


    const arc = d3
      .arc<d3.PieArcDatum<number>>()
      .innerRadius(radius * 0.5)
      .outerRadius(radius * 0.8);


    group
      .selectAll('path')
      .data(pie(values))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr(
        'fill',
        (_, index) =>
          this.getChartColor(index)
      )
      .attr(
        'stroke',
        '#fff'
      )
      .attr(
        'stroke-width',
        2
      );


    // Legend
    const legend = svg
      .append('g')
      .attr(
        'transform',
        `translate(15, 10)`
      );


    labels.forEach(
      (label, index) => {

        const row =
          legend
            .append('g')
            .attr(
              'transform',
              `translate(0, ${index * 20})`
            );


        row
          .append('rect')
          .attr('width', 10)
          .attr('height', 10)
          .attr(
            'fill',
            this.getChartColor(index)
          );


        row
          .append('text')
          .attr('x', 15)
          .attr('y', 9)
          .attr(
            'font-size',
            '11px'
          )
          .text(label);

      }
    );
  }


  // =========================
  // D3 Bar Chart
  // =========================

  renderBarChart(data: any[]): void {

    const element =
      this.barChartElement.nativeElement;

    d3.select(element)
      .selectAll('*')
      .remove();


    const width = 500;
    const height = 220;

    const margin = {
      top: 20,
      right: 20,
      bottom: 45,
      left: 40
    };


    const svg = d3
      .select(element)
      .append('svg')
      .attr('width', '100%')
      .attr('height', height)
      .attr(
        'viewBox',
        `0 0 ${width} ${height}`
      );


    const labels = data.map(
      (item, index) =>
        item.label ??
        item.name ??
        item.title ??
        item.category ??
        `${index + 1}`
    );


    const values = data.map(
      item => Number(
        item.value ??
        item.data ??
        item.count ??
        item.total ??
        0
      )
    );


    const chartData = labels.map(
      (label, index) => ({
        label,
        value: values[index]
      })
    );


    const x = d3
      .scaleBand()
      .domain(labels)
      .range([
        margin.left,
        width - margin.right
      ])
      .padding(0.25);


    const maxValue =
      d3.max(values) || 0;


    const y = d3
      .scaleLinear()
      .domain([
        0,
        maxValue
      ])
      .nice()
      .range([
        height - margin.bottom,
        margin.top
      ]);


    // X axis
    svg
      .append('g')
      .attr(
        'transform',
        `translate(
          0,
          ${height - margin.bottom}
        )`
      )
      .call(
        d3.axisBottom(x)
      )
      .selectAll('text')
      .attr(
        'font-size',
        '10px'
      );


    // Y axis
    svg
      .append('g')
      .attr(
        'transform',
        `translate(${margin.left},0)`
      )
      .call(
        d3.axisLeft(y)
      )
      .selectAll('text')
      .attr(
        'font-size',
        '10px'
      );


    // Bars
    svg
      .selectAll('.bar')
      .data(chartData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr(
        'x',
        item => x(item.label) || 0
      )
      .attr(
        'y',
        item => y(item.value)
      )
      .attr(
        'width',
        x.bandwidth()
      )
      .attr(
        'height',
        item =>
          height -
          margin.bottom -
          y(item.value)
      )
      .attr(
        'fill',
        '#999'
      );

  }


  getChartColor(index: number): string {

    const colors = [
      '#999',
      '#aaa',
      '#bbb',
      '#888',
      '#777'
    ];

    return colors[
      index % colors.length
    ];
  }


  // =========================
  // Table
  // =========================

  getFirstName(user: any): string {

    return (
      user.firstName ??
      user.firstname ??
      user.first_name ??
      ''
    );
  }


  getLastName(user: any): string {

    return (
      user.lastName ??
      user.lastname ??
      user.last_name ??
      ''
    );
  }


  getUsername(user: any): string {

    return (
      user.userName ??
      user.username ??
      user.user_name ??
      ''
    );
  }


  // =========================
  // Logout
  // =========================

  logout(): void {

    this.authService.logout();

    this.router.navigate(
      ['/sign-in'],
      {
        replaceUrl: true
      }
    );
  }


  ngOnDestroy(): void {

    d3.select(
      this.donutChartElement?.nativeElement
    )
      .selectAll('*')
      .remove();


    d3.select(
      this.barChartElement?.nativeElement
    )
      .selectAll('*')
      .remove();

  }

}