import type {Employee} from "./employee.interface.ts";
import type {BaseEntity} from "./baseEntity.interface.ts";

export interface Department extends BaseEntity {
    name: string,
    code: string,
    description: string,
    employees: Employee[],
}