// Type definition for cli-table to avoid any type issues
import Table = require('cli-table');

export interface TableInstance {
    push(row: string[]): void;
    toString(): string;
}

export type TableConstructor = typeof Table;