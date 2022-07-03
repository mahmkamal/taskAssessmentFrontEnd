import { AfterViewInit, Component, TemplateRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import * as $ from 'jquery';
import { Subject } from 'rxjs';
// import 'datatables.net';
import { DataTableDirective } from 'angular-datatables';
import { ToastrService } from 'ngx-toastr';
import { PatternsService } from '../shared/patterns.service';
import { slideToTop } from '../shared/router.animations';
import Swal from 'sweetalert2';
import { isNgTemplate } from '@angular/compiler';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { EmployeeService } from '../shared/services/employee.service';
import { Employee } from '../shared/services/employee.model';

interface Role {
  code: number,
  name: string,
  selected: false
}
@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css'],
  animations: [slideToTop()]
})
export class EmployeeComponent implements OnInit, AfterViewInit, OnDestroy {
  // datatable: any;
  @ViewChild(DataTableDirective, { static: false })
  dtElement: any = DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  changePass: boolean = false;
  list: Employee[] = [];
  operation = 'view';
  errorMessage = ''
  item = new Employee();
  dropdownSettings: IDropdownSettings = {};
  employee = new Employee();
  dateTo = new Date();
  changeStatus = { id: 0, status: false }
  constructor(public patterns: PatternsService, private toastr: ToastrService, private EmployeeApi: EmployeeService) {
  }
  refreshDataSource(list): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.list = list;
      this.dtTrigger.next(void 0);
    });
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next(void 0);
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.state.clear();
    });
  }
  ngOnInit(): void {

    this.dropdownSettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };
    this.dtOptions = {
      pagingType: 'full_numbers',
      stateSave: true,
      processing: true,
      pageLength: 5,
      searching: true,
      lengthMenu: [5, 10, 15, 25, 50]
    };
    this.getEmployee();

  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
  OnDeSelect(event) { }
  OnSelect(event) { }
  getEmployee() {
    this.EmployeeApi.getAll().subscribe(result => {
      console.log(result);
      this.list = result;
      this.refreshDataSource(result);
    },
      (error: any) => this.toastr.error('', 'Check Connection Or Contact Admin')
    );
  }
  open(_item: any) {
    this.operation = _item == null ? 'add' : 'edit';
    switch (this.operation) {
      case 'add':
        this.item = new Employee();
        break;
      case 'edit':
        this.item = Object.assign({}, _item);
        this.changePass = false;
        this.EmployeeApi.getById(_item.id).subscribe(employee => {
          this.item = employee;
        })
        break;
    }
  };
  save() {
    this.item.isActive = true;
    this.applySave(this.item);
  };
  delete(_item: any, index) {
    _item.isActive = false;
    this.EmployeeApi.save(_item).subscribe(result => {
      Swal.fire({
        text: 'Deleted Successfully',
        icon: 'success',
      });
      this.list.splice(index, 1);
    });
  };
  back() {
    if (this.operation !== 'view') {
      this.item = new Employee();
      this.operation = 'view';
    }
  };
  private applySave(item) {
    item.creationUser = 1;
    this.employee = item;
    this.EmployeeApi.save(this.employee).subscribe(result => {
      const filterResult = this.list.filter(function (element, index, array) {
        return element['id'] === result.id;
      });
      if (filterResult.length > 0) {
        const index: number = this.list.indexOf(filterResult[0]);
        if (!result.isActive) {
          this.toastr.success(result['fullName'] + ' Employee' + ' Was Deleted', 'Deleted Successfully');
          this.list.splice(index, 1);
        } else {
          this.list[index] = result;
          this.toastr.info(result['fullName'] + ' Employee' + ' Was Updated', 'Updated Successfully');
          this.item = new Employee();
        }
      } else {
        Swal.fire({
          title: result['fullName'],
          text: 'Created Successfully',
          icon: 'success',
        });
        this.list.push(result);
      }
    });
    this.operation = 'view';

  }
}
