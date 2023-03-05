/* tslint:disable */
/* eslint-disable */
/**
*/
export enum Cell {
  Dead = 0,
  Alive = 1,
  Selected = 2,
}
/**
*/
export class Universe {
  free(): void;
/**
* @returns {number}
*/
  width(): number;
/**
* @returns {number}
*/
  height(): number;
/**
* @param {number} row
* @param {number} column
*/
  toggle_cell(row: number, column: number): void;
/**
* @param {number} row
* @param {number} column
*/
  select_cell(row: number, column: number): void;
/**
*/
  reset_every_selected_to_alive(): void;
/**
* @returns {number}
*/
  cells(): number;
/**
*/
  tick(): void;
/**
* @returns {Universe}
*/
  static new(): Universe;
/**
* @returns {string}
*/
  render(): string;
}
