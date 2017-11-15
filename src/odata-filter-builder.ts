import { ObjectPathProxy, ObjPathProxy } from './object-path-proxy';
import {
  IBasicFilterBuilder, ICollectionPropFilterBuilder,
  IFilterBuilderResult, IFilterExpressionResult,
  BasicBuilderFunc, BasicBuilderArg, BasicBuilderArgFunc, BasicBuilderProp,
  TPropType
} from './types';
import { buildWithBuilder, BasicFilterBuilder, FilterExpressionResult } from './basic-filter-builder';

export type BuilderFunc<T> = BasicBuilderFunc<T, ODataFilterBuilder<T>>;

export type BuilderArg<T, TResult extends TPropType> = BasicBuilderArg<T, ODataFilterBuilder<T>, TResult>;
export type BoolArg<T> = BuilderArg<T, boolean>;
export type NumArg<T> = BuilderArg<T, number>;
export type StringArg<T> = BuilderArg<T, string>;
export type DateArg<T> = BuilderArg<T, Date>;

export type BoolResult<T> = IFilterExpressionResult<T, boolean>;
export type StringResult<T> = IFilterExpressionResult<T, string>;
export type NumResult<T> = IFilterExpressionResult<T, number>;
export type DateResult<T> = IFilterExpressionResult<T, Date>;

export type Operator<T, TArg extends TPropType> =
  (l: BuilderArg<T, TArg>, r: BuilderArg<T, TArg>) =>  BoolResult<T>;

export type StringFunc<T> = (l: StringArg<T>) => StringResult<T>;
export type StringFunc2<T> = (l: StringArg<T>, r: StringArg<T>) => StringResult<T>;
export type StringFunc3<T> = (one: StringArg<T>, two: StringArg<T>, three: StringArg<T>) => StringResult<T>;
export type StringBoolFunc<T> = (l: StringArg<T>, r: StringArg<T>) => BoolResult<T>;
export type DateFunc<T> = (d: DateArg<T>) => DateResult<T>;
export type DatePartFunc<T> = (d: DateArg<T>) => NumResult<T>;
export type NumFunc<T> = (d: NumArg<T>) => NumResult<T>;

// implemets operators and functions from https://msdn.microsoft.com/en-us/library/hh169248(v=nav.90).aspx
export class ODataFilterBuilder<T> extends BasicFilterBuilder<T> {
  static build<T>(f: BasicBuilderFunc<T, ODataFilterBuilder<T>>): IFilterBuilderResult<T> {
    return buildWithBuilder(new ODataFilterBuilder<T>(), f);
  }

  collection = <I>(
    prop: ObjPathProxy<T, Array<I>>,
    varName: string|null = null
  ): ICollectionPropFilterBuilder<I, ODataFilterBuilder<I>> =>
    this.collectionProp(prop, varName);

  nested = <I>(
    prop: ObjPathProxy<T, I>,
    condition: BasicBuilderArg<I, ODataFilterBuilder<I>, boolean>
  ): FilterExpressionResult<T, boolean> => this.nestedCondition<I, ODataFilterBuilder<I>>(prop, condition);

  // logical
  and = (...args: BoolArg<T>[]) => this.logicalOperator('and', ...args);
  or = (...args: BoolArg<T>[]) => this.logicalOperator('or', ...args);
  not = (arg: BoolArg<T>): BoolResult<T> => this.function('not', arg);

  // number operators
  lt = <TArg extends TPropType>(l: BuilderArg<T, TArg>, r: BuilderArg<T, TArg>) =>
    this.binaryOperator('lt', l, r); // less than
  gt = <TArg extends TPropType>(l: BuilderArg<T, TArg>, r: BuilderArg<T, TArg>) =>
    this.binaryOperator('gt', l, r); // greater than
  le = <TArg extends TPropType>(l: BuilderArg<T, TArg>, r: BuilderArg<T, TArg>) =>
    this.binaryOperator('le', l, r); // less than or equals
  ge = <TArg extends TPropType>(l: BuilderArg<T, TArg>, r: BuilderArg<T, TArg>) =>
    this.binaryOperator('ge', l, r); // greater than or equals
  eq = <TArg extends TPropType>(l: BuilderArg<T, TArg>, r: BuilderArg<T, TArg>) =>
    this.binaryOperator('eq', l, r); // equals
  ne = <TArg extends TPropType>(l: BuilderArg<T, TArg>, r: BuilderArg<T, TArg>) =>
    this.binaryOperator('ne', l, r); // not equal

  // string functions
  endswith: StringBoolFunc<T> =                        (left, right) => this.function('endswith', left, right);
  startswith: StringBoolFunc<T> =                      (left, right) => this.function('startswith', left, right);
  substringof: StringBoolFunc<T> =                     (left, right) => this.function('substringof', left, right);
  length =                         (str: StringArg<T>): NumResult<T> => this.function('length', str);
  indexof =         (l: StringArg<T>, r: StringArg<T>): NumResult<T> => this.function('indexof', l, r);
  replace: StringFunc3<T> =                       (str, remove, add) => this.function('replace', str, remove, add);
  substring = (str: StringArg<T>, index: NumArg<T>): StringResult<T> => this.function('substring', str, index);
  tolower: StringFunc<T> =                                     (str) => this.function('tolower', str);
  toupper: StringFunc<T> =                                     (str) => this.function('toupper', str);
  trim: StringFunc<T> =                                        (str) => this.function('trim', str);
  concat: StringFunc2<T> =                             (left, right) => this.function('concat', left, right);
  contains =        (l: StringArg<T>, r: StringArg<T>): NumResult<T> => this.function('contains', l, r);

  // date functions
  day: DatePartFunc<T> =                d => this.function('day', d);
  month: DatePartFunc<T> =              d => this.function('month', d);
  year: DatePartFunc<T> =               d => this.function('year', d);
  hour: DatePartFunc<T> =               d => this.function('hour', d);
  minute: DatePartFunc<T> =             d => this.function('minute', d);
  second: DatePartFunc<T> =             d => this.function('second', d);
  date: DateFunc<T> =                   d => this.function('date', d);
  time: DateFunc<T> =                   d => this.function('time', d);
  totaloffsetminutes: DatePartFunc<T> = d => this.function('totaloffsetminutes', d);
  now: () => DateResult<T> =           () => this.function('now');
  mindatetime: () => DateResult<T> =   () => this.function('mindatetime');
  maxdatetime: () => DateResult<T> =   () => this.function('maxdatetime');

  // number functions
  round: NumFunc<T> = n => this.function('round', n);
  floor: NumFunc<T> = n => this.function('floor', n);
  ceiling: NumFunc<T> = n => this.function('ceiling', n);
}
