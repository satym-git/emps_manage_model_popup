// src/app/services/employee.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private apiUrl = 'http://localhost:3000/api/employee'; // Your Express API URL

  constructor(private http: HttpClient) {}
// employee.service.ts
getEmployeeAddressById(empId: number) {
  return this.http.get<any>(`${this.apiUrl}/${empId}/details`);
}
deleteAddressById(id: number) {
  return this.http.delete(`${this.apiUrl}/address/${id}`);
}

  addEmployeeToDB(employee: any) {
    return this.http.post(`${this.apiUrl}/save`, employee);
  }

  addEmployeeToDBs(employee: any) {
  return this.http.post(`${this.apiUrl}/save`, [employee]); 
}

  getEmployees(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
  getStates(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/states`);
}
deleteEmployees(ids: number[]): Observable<any> {
return this.http.post('http://localhost:3000/deleteEmployees', { ids });
}

}

  

// private apiUrl = 'http://localhost:3000/api/users';



//   constructor(private http: HttpClient) { }

//   // Method to get users from the backend
//   getUsers(): Observable<any> {
//     return this.http.get<any>(this.apiUrl);
//   }
  
// addUser(user: { order_date: Date; quantity_ordered: number; sales_price: number }) {
//   return this.http.post(this.apiUrl, user);
// }
// deleteUser(sales_price: number): Observable<any> {
//   return this.http.delete(`http://localhost:3000/api/sale/${sales_price}`);
// }


