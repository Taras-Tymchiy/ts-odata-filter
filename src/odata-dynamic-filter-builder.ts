import {
  IBasicDynamicFilterBuilder, IDynamicCollectionPropFilterBuilder,
  IDynamicFilterBuilderResult, IDynamicFilterExpressionResult,
  BasicDynamicBuilderFunc, BasicDynamicBuilderArg, BasicDynamicBuilderArgFunc,
  TDynamicPropType,
  ODataPropertyPath,
  ODataTypes
} from './dynamic-types';
import { buildWithBuilder, BasicDynamicFilterBuilder, DynamicFilterExpressionResult } from './basic-dynamic-filter-builder';

export type BuilderFunc<T> = BasicDynamicBuilderFunc<ODataDynamicFilterBuilder>;

export type BuilderArg<TResult extends TDynamicPropType> = BasicDynamicBuilderArg<ODataDynamicFilterBuilder, TResult>;
export type BoolArg = BuilderArg<ODataTypes.Bool>;
export type NumArg = BuilderArg<ODataTypes.Number>;
export type StringArg = BuilderArg<ODataTypes.String>;
export type DateArg = BuilderArg<ODataTypes.Date>;

export type BoolResult = IDynamicFilterExpressionResult;
export type StringResult = IDynamicFilterExpressionResult;
export type NumResult = IDynamicFilterExpressionResult;
export type DateResult = IDynamicFilterExpressionResult;

export type Operator<T, TArg extends TDynamicPropType> =
  (l: BuilderArg<TArg>, r: BuilderArg<TArg>) =>  BoolResult;

export type StringFunc = (l: StringArg) => StringResult;
export type StringFunc2 = (l: StringArg, r: StringArg) => StringResult;
export type StringFunc3 = (one: StringArg, two: StringArg, three: StringArg) => StringResult;
export type StringBoolFunc = (l: StringArg, r: StringArg) => BoolResult;
export type DateFunc = (d: DateArg) => DateResult;
export type DatePartFunc = (d: DateArg) => NumResult;
export type NumFunc = (d: NumArg) => NumResult;

// implemets operators and functions from https://msdn.microsoft.com/en-us/library/hh169248(v=nav.90).aspx
export class ODataDynamicFilterBuilder extends BasicDynamicFilterBuilder {
  static build(f: BasicDynamicBuilderFunc<ODataDynamicFilterBuilder>): IDynamicFilterBuilderResult {
    return buildWithBuilder(new ODataDynamicFilterBuilder(), f);
  }

  collection = (
    prop: ODataPropertyPath,
    varName: string|null = null
  ): IDynamicCollectionPropFilterBuilder<ODataDynamicFilterBuilder> =>
    this.collectionProp(prop, varName);

  nested = (
    prop: ODataPropertyPath,
    condition: BasicDynamicBuilderArg<ODataDynamicFilterBuilder, ODataTypes.Bool>
  ): DynamicFilterExpressionResult => this.nestedCondition<ODataDynamicFilterBuilder>(prop, condition);

  // logical
  and = (...args: BoolArg[]) => this.logicalOperator('and', ...args);
  or = (...args: BoolArg[]) => this.logicalOperator('or', ...args);
  not = (arg: BoolArg): BoolResult => this.function('not', arg);

  // number operators
  lt = <TArg extends TDynamicPropType>(l: BuilderArg<TArg>, r: BuilderArg<TArg>) =>
    this.binaryOperator('lt', l, r); // less than
  gt = <TArg extends TDynamicPropType>(l: BuilderArg<TArg>, r: BuilderArg<TArg>) =>
    this.binaryOperator('gt', l, r); // greater than
  le = <TArg extends TDynamicPropType>(l: BuilderArg<TArg>, r: BuilderArg<TArg>) =>
    this.binaryOperator('le', l, r); // less than or equals
  ge = <TArg extends TDynamicPropType>(l: BuilderArg<TArg>, r: BuilderArg<TArg>) =>
    this.binaryOperator('ge', l, r); // greater than or equals
  eq = <TArg extends TDynamicPropType>(l: BuilderArg<TArg>, r: BuilderArg<TArg>) =>
    this.binaryOperator('eq', l, r); // equals
  ne = <TArg extends TDynamicPropType>(l: BuilderArg<TArg>, r: BuilderArg<TArg>) =>
    this.binaryOperator('ne', l, r); // not equal

  // string functions
  endswith: StringBoolFunc =                        (left, right) => this.function('endswith', left, right);
  startswith: StringBoolFunc =                      (left, right) => this.function('startswith', left, right);
  substringof: StringBoolFunc =                     (left, right) => this.function('substringof', left, right);
  length =                         (str: StringArg): NumResult => this.function('length', str);
  indexof =         (l: StringArg, r: StringArg): NumResult => this.function('indexof', l, r);
  replace: StringFunc3 =                       (str, remove, add) => this.function('replace', str, remove, add);
  substring = (str: StringArg, index: NumArg): StringResult => this.function('substring', str, index);
  tolower: StringFunc =                                     (str) => this.function('tolower', str);
  toupper: StringFunc =                                     (str) => this.function('toupper', str);
  trim: StringFunc =                                        (str) => this.function('trim', str);
  concat: StringFunc2 =                             (left, right) => this.function('concat', left, right);
  contains =        (l: StringArg, r: StringArg): NumResult => this.function('contains', l, r);

  // date functions
  day: DatePartFunc =                d => this.function('day', d);
  month: DatePartFunc =              d => this.function('month', d);
  year: DatePartFunc =               d => this.function('year', d);
  hour: DatePartFunc =               d => this.function('hour', d);
  minute: DatePartFunc =             d => this.function('minute', d);
  second: DatePartFunc =             d => this.function('second', d);
  date: DateFunc =                   d => this.function('date', d);
  time: DateFunc =                   d => this.function('time', d);
  totaloffsetminutes: DatePartFunc = d => this.function('totaloffsetminutes', d);
  now: () => DateResult =           () => this.function('now');
  mindatetime: () => DateResult =   () => this.function('mindatetime');
  maxdatetime: () => DateResult =   () => this.function('maxdatetime');

  // number functions
  round: NumFunc = n => this.function('round', n);
  floor: NumFunc = n => this.function('floor', n);
  ceiling: NumFunc = n => this.function('ceiling', n);
}
