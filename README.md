# DEMANIO Angular 5 e Layout ita web toolkit 

Prime idee:

## Layout 

    app-root in index.html
    app.component.html contenitore di 
        <app-header></app-header>
        <app-sidebar></app-sidebar>
        <router-outlet></router-outlet>
        <app-footerbar></app-footerbar>

## Angular 2/4

- https://angular.io/tutorial/toh-pt1
- ng serve (avvia il progetto live-reload)

- Struttura cartelle interessante
- http://jasonwatmore.com/post/2016/08/16/angular-2-jwt-authentication-example-tutorial

- struttura cartelle scelta
- - components
- - models 
- - services
- - 123

## Routing con Guard

- usata la app.routing.ts 



## Librerie 

- Riadattato il modulo https://italia.github.io/design-web-toolkit/components/detail/page--landing.html

- Angular Material  - NO
    - https://material.angular.io/guide/getting-started
    - npm install --save @angular/material @angular/cdk
    - npm install --save @angular/animations

- ng-bootstrap bootstrap 4 - NO

- npm install --save bootstrap@4.0.0-alpha.6 font-awesome

- npm install bootstrap@4.0.0-beta --save

- npm install --save @ng-bootstrap/ng-bootstrap

- npm install --save ngx-bootstrap

- http://valor-software.com/ngx-bootstrap/index-bs4.html#/

- Template
- https://github.com/start-angular/SB-Admin-BS4-Angular-4

- Fake json per accesso a backend https://jsonplaceholder.typicode.com/

## Services / Singleton

- get save delete Observable
- https://www.barbarianmeetscoding.com/blog/2016/04/02/getting-started-with-angular-2-step-by-step-6-consuming-real-data-with-http/

Per accesso ai dati

# Sicurezza

 - Autorizzazioni e Login e Profilo
 - http://jasonwatmore.com/post/2016/08/16/angular-2-jwt-authentication-example-tutorial

# Interceptor

    Usato per intercettare tutte le chiamate e mettere TOKEN e redirezione

- https://scotch.io/@kashyapmukkamala/using-http-interceptor-with-angular2

# Grid

- ng2-smart-table
- https://akveo.github.io/ng2-smart-table/#/

- Grid - https://swimlane.gitbooks.io/ngx-datatable/content/introduction/features.html
- ng2-grid

- ng2-table
- npm i ng2-table --save

- AngularJs DataTable
- http://danielnagy.me/md-data-table/

- Da provare
- https://akveo.github.io/ng2-smart-table/#/demo

# Chart

- npm install ng2-charts --save

# Template

# Pdf 

- pdfMake
- https://stackoverflow.com/questions/45136111/angular2-how-to-use-pdfmake-library

# Test e2e

# Documentation tool

- https://github.com/compodoc/compodoc

