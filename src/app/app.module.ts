import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrModule } from 'ngx-toastr';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EmployeeService } from './shared/services/employee.service';
import { AppConfig } from './app.config';
import { PatternsService } from './shared/patterns.service';
import { LoaderComponent } from './shared/loader/loader.component';
import { LoaderInterceptor } from './shared/loader/loader.interceptor';
import { LoaderService } from './shared/loader/loader.service';

@NgModule({
  declarations: [
    AppComponent,LoaderComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ToastrModule.forRoot(),
    BrowserAnimationsModule,
    FormsModule,
    NgbModule,
  ],
  providers: [EmployeeService,AppConfig,PatternsService,
    { provide: APP_INITIALIZER, useFactory: (config: AppConfig) => () => config.load(), deps: [AppConfig], multi: true },
    LoaderService,{
        provide: HTTP_INTERCEPTORS,
        useClass: LoaderInterceptor,
        multi: true
    },],
  bootstrap: [AppComponent]
})
export class AppModule { }
