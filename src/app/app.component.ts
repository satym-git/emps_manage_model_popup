import { Component, OnInit } from '@angular/core';
import { EmployeeService } from './user.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  currentDate: string = new Date().toISOString().split('T')[0];
  gridApi: any;



  employee = {
    emp_id: null,
    guid: '',
    first_name: '',
    last_name: '',
    dob: '',
    age: null as number | null,
    address1: '',
    address2: '',
    address3: '',

    state_id: null,
    city: '',
    pincode: ''
  };
  rowSelection = 'multiple';

  columnDefs = [
    {
      headerName: '',
      checkboxSelection: true,
      headerCheckboxSelection: true,

      width: 50,
      suppressSizeToFit: true
    },
    { headerName: 'First_name', field: 'first_name', width: 150 },
    { headerName: 'Last_Name', field: 'last_name', width: 150 },
    {
      headerName: 'DOB', width: 150,
      field: 'dob',
      valueFormatter: (params: any) => {
        if (!params.value) return '';
        return new Date(params.value).toISOString().split('T')[0];
      }
    },
    { headerName: 'Age', field: 'age', width: 100 },
    { headerName: 'Address1', field: 'address1' },


    { headerName: 'Address 2', field: 'address2' },
    { headerName: 'Address 3', field: 'address3' },

    {
      headerName: 'State',
      field: 'state_id',
      valueGetter: (params: any) => {
        if (!params.data || params.data.state_id === null || params.data.state_id === undefined) return 'Unknown';
        const stateId = String(params.data.state_id);
        const state = this.states.find(state => String(state.state_id) === stateId);
        return state ? state.state_name : 'Unknown';
      }
    },
    { headerName: 'City', field: 'city' },
    { headerName: 'Pincode', field: 'pincode' },
    {
      headerName: 'Actions',
      cellRenderer: (params: any) => {
        const e = document.createElement('button');
        e.innerText = 'Delete';
        e.classList.add('btn', 'btn-danger', 'btn-sm');
        e.addEventListener('click', () => {
          this.deleteRows(params.data.emp_id, params.data.guid);
        });
        return e;
      }
    }
  ];

  onSelectionChanged(event: any) {
    const selectedRows = event.api.getSelectedRows();
    console.log('Currently selected rows:', selectedRows);
  }


  //use for multiple delete
  deleteSelectedRows() {
  const selectedRows = this.gridApi.getSelectedRows();

  if (selectedRows.length === 0) {
    alert('Please select rows to delete');
    return;
  }

  const idsToDelete: number[] = [];
  const guidsToDelete: string[] = [];

  selectedRows.forEach((row: any) => {
    if (row.emp_id) idsToDelete.push(row.emp_id);
    else if (row.guid) guidsToDelete.push(row.guid);
  });

  if (idsToDelete.length === 0 && guidsToDelete.length === 0) {
    alert('No valid IDs found to delete.');
    return;
  }

  const confirmDelete = confirm(`Are you sure you want to delete ${selectedRows.length} record(s)?`);
  if (!confirmDelete) return;

  //  Fix: use emp_id instead of id
  this.rowData = this.rowData.filter(
    row => !idsToDelete.includes(row.emp_id) && !guidsToDelete.includes(row.guid)
  );

  this.gridApi.setRowData(this.rowData);
  localStorage.setItem('employeeData', JSON.stringify(this.rowData));

  //  Backend delete (only for saved data)
  if (idsToDelete.length > 0) {
    this.userService.deleteEmployees(idsToDelete).subscribe({
      next: (res) => {
        console.log('Server Response:', res);
        alert('Deleted successfully!');
      },
      error: (err) => {
        console.error('Delete failed:', err);
        alert('Error deleting records.');
      }
    });
  }
}

  // for single delete use fetch id 
  deleteRows(emp_id: number | null, guid?: string) {
    // const row = this.rowData.find(r => r.guid === guid);
    // if (row && row.id !== null && row.id !== undefined) {
    //   this.deletedRows.push(row.id);
    //   console.log('Deleted rows:', this.deletedRows);
    // }
    // this.rowData = this.rowData.filter(r => r.guid !== guid);
    if (emp_id) {
      console.log("clicked");
      this.deletedRows.push(emp_id);
      this.rowData = this.rowData.filter(r => r.emp_id !== emp_id);
    }
    else if (guid) {
      this.rowData = this.rowData.filter(r => r.guid !== guid);

    }
  }

  deletedRows: number[] = [];
  deletedIds: number[] = [];

  rowData: any[] = [];
  states: any[] = [];
  updatedRows: any[] = [];




  defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true
  };

  constructor(private userService: EmployeeService) { }

  ngOnInit(): void {
    this.getStates();
    this.loadEmployeeData();
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    if (this.states.length > 0) {
      this.gridApi.refreshCells({ force: true });
    }
  }

  calculateAge(): void {
    if (!this.employee.dob) return;

    const today = new Date();
    const dob = new Date(this.employee.dob);

    if (dob > today) {
      alert('Date of Birth cannot be in the future')
      this.employee.age = null;
      return;
    }

    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    const dayDiff = today.getDate() - dob.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    this.employee.age = age;
  }

  clearLocalData() {
    localStorage.removeItem('employeeData');
    this.rowData = [];
    if (this.gridApi) {
      this.gridApi.setRowData([]);
    }
  }

 addemployee(form: NgForm) {
  if (form.invalid) {
    Object.values(form.controls).forEach(control => control.markAsTouched());
    alert('Please fill out all required fields');
    return;
  }

  const {
    emp_id,
    guid,
    first_name,
    last_name,
    dob,
    age,
    address1,
    address2,
    address3,
    state_id,
    city,
    pincode
  } = this.employee;

  if (!first_name || !last_name || !dob || !age || !address1 || !state_id || !city || !pincode) {
    alert('Please fill in all required fields: First Name, Last Name, DOB, Age, Address1, State, City, and Pincode.');
    return;
  }

  const formattedDob = new Date(dob).toISOString().split('T')[0];
  const empGuid = guid || crypto.randomUUID();

  let index = -1;

  if (emp_id !== null && emp_id !== undefined) {
    index = this.rowData.findIndex(emp => emp.emp_id === emp_id);
  } else {
    index = this.rowData.findIndex(emp => emp.guid === empGuid);
  }

  const updatedEmployee = {
    ...this.employee,
    emp_id: emp_id ?? null,
    guid: empGuid,
    dob: formattedDob,
    status: index !== -1 ? 'modified' : 'new'
  };

  if (index !== -1) {
    // Immutable update for change detection
    this.rowData = [
      ...this.rowData.slice(0, index),
      updatedEmployee,
      ...this.rowData.slice(index + 1)
    ];
  } else {
    this.rowData = [...this.rowData, updatedEmployee];
  }

  localStorage.setItem('employeeData', JSON.stringify(this.rowData));

  this.employee = {
    emp_id: null,
    guid: '',
    first_name: '',
    last_name: '',
    dob: '',
    age: null,
    address1: '',
    address2: '',
    address3: '',
    state_id: null,
    city: '',
    pincode: ''
  };

  this.clearForm(form);
}

onRowDoubleClick(event: any) {
  const rowData = event.data;

  const formattedDob = rowData.dob
    ? new Date(rowData.dob).toISOString().substring(0, 10)
    : '';

  this.employee = {
    emp_id: rowData.emp_id ?? null,
    guid: rowData.guid ?? '',
    first_name: rowData.first_name ?? '',
    last_name: rowData.last_name ?? '',
    dob: formattedDob, 
    age: rowData.age ?? null,
    address1: rowData.address1 ?? '',
    address2: rowData.address2 ?? '',
    address3: rowData.address3 ?? '',
    state_id: rowData.state_id ?? null,
    city: rowData.city ?? '',
    pincode: rowData.pincode ?? ''
  };
}
formatDateToInput(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().substring(0, 10); // gives 'yyyy-MM-dd'
  }


  clearForm(form: NgForm) {
    form.resetForm();
    this.employee = {
      emp_id: null,
      guid: '',
      first_name: '',
      last_name: '',
      dob: '',
      age: null,
      address1: '',
      address2: '',
      address3: '',

      state_id: null,
      city: '',
      pincode: ''
    };
  }

  getStates(): void {
    this.userService.getStates().subscribe({
      next: (data: any) => {
        this.states = data;
        this.loadEmployeeData();
      },
      error: (err) => {
        console.error('Error loading states', err);
      }
    });
  }

  loadEmployeeData(): void {
    // const storedData = localStorage.getItem('employeeData');
    // if (storedData) {
    //   this.rowData = JSON.parse(storedData);
    // } else {
    this.userService.getEmployees().subscribe({
      next: (data) => {
        this.rowData = data.map((emp: any) => ({
          ...emp,
          // guid: crypto.randomUUID(),
          status: 'unchanged'
        }));
        localStorage.setItem('employeeData', JSON.stringify(this.rowData));
      },
      error: (err) => {
        console.error('Error loading employees', err);
      }
    });
  }


  save() {
    const dataToSend = this.rowData
      .filter(row => row.status === 'new' || row.status === 'modified')
      .map(row => {
        return {
          emp_id: row.emp_id || null,
          first_name: row.first_name,
          last_name: row.last_name,
          dob: this.validateDob(row.dob),
          age: row.age,
          add1: row.address1,
          add2: row.address2,
          add3: row.address3,
          state_id: row.state_id,
          city: row.city,
          pincode: row.pincode
        };
      });

    const saveToDB = () => {
      if (dataToSend.length === 0) {
        alert('No new or modified data to save.');
        return;
      }

      this.userService.addEmployeeToDB(dataToSend).subscribe({
        next: () => {
          alert('Data saved to database!');
          this.rowData = this.rowData.map(row => ({ ...row, status: 'unchanged' }));
          localStorage.setItem('employeeData', JSON.stringify(this.rowData));
        },
        error: err => {
          console.error('Error saving data!', err);
          alert('Failed to save data.');
        }
      });   
    };

    if (this.deletedRows.length > 0) {
      this.userService.deleteEmployees(this.deletedRows).subscribe({
        next: () => {
          console.log('Deleted IDs:', this.deletedRows);
          this.deletedRows = [];
          alert('Data deleted successfully');
          // saveToDB(); // then save new/modified data
        },
        error: err => {
          console.error('Error deleting data:', err);
          alert('Failed to delete records.');
        }
      });
    } else {
      saveToDB(); // directly save if nothing to delete
    }
  }



  validateDob(dob: string): string | null {
    if (!dob || dob === '0000-00-00' || dob === '') {
      return null;
    }
    return dob;
  }
}
