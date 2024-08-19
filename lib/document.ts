/* eslint-disable max-classes-per-file */
import type { Element, Root } from 'hast';
import { matches, select, selectAll } from 'hast-util-select';

export const kTree = Symbol('tree');
export const kCurrentNode = Symbol('currentNode');
export const kParentNode = Symbol('parentNode');

export interface IDocument {
  select(selector: string): Element | undefined;
  selectAll(selector: string): Element[] | undefined;
  matches(selector: string): boolean;
  toJSON(): Root;
}

/** @deprecated */
export class Document implements IDocument {
  private readonly [kTree]: Root;

  constructor(data: Root) {
    this[kTree] = data;
  }

  public select(selector: string) {
    return select(selector, this[kTree]);
  }

  public selectAll(selector: string) {
    return selectAll(selector, this[kTree]);
  }

  public matches(selector: string) {
    return matches(selector, this[kTree]);
  }

  public static from(data: Root) {
    const tree = new Document(data);
    return tree;
  }

  public toJSON() {
    return this[kTree];
  }
}

export function createDocument(data: Root) {
  return {
    select(selector: string) {
      return select(selector, data);
    },
    selectAll(selector: string) {
      return selectAll(selector, data);
    },
    matches(selector: string) {
      return matches(selector, data);
    },
    toJSON() {
      return data;
    },
  } satisfies IDocument;
}
