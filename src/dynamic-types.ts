export interface Type<T> {
  new (...args: any[]): T;
}

export class ODataEntityType
{
    name: string = '';
    properties: ODataProperty[] = new Array<ODataProperty>();
}

export class ODataPropertyPath
{
   constructor(public path:string) {
   }

   child(subPath: string) : ODataPropertyPath
   {
     return new ODataPropertyPath(`${this.path}/${subPath}`);
   }
}

export class ODataProperty
{
    name: string = '';
    type: ODataTypes = 0;
    isNullable: boolean = false;
}

export enum ODataTypes{
  Number,
  String,
  Date,
  Bool,
}

export type ODataDynamicTPrimitive = ODataTypes.Number | ODataTypes.String | ODataTypes.Date | ODataTypes.Bool;
export type TDynamicPropType = ODataDynamicTPrimitive;

//export type BasicBuilderProp<TBuilder extends IBasicFilterBuilder, TResult> = any;

export type BasicDynamicBuilderArg<TBuilder extends IBasicDynamicFilterBuilder, TResult extends TDynamicPropType> =
  BasicDynamicBuilderArgFunc<TBuilder, TResult> |
  IDynamicFilterExpressionResult |
  ODataPropertyPath |
  TResult;

export type BasicDynamicBuilderArgFunc<TBuilder extends IBasicDynamicFilterBuilder, TResult extends TDynamicPropType> =
  (arg: TBuilder, props: any)=> BasicDynamicBuilderArg<TBuilder, TResult>;

export type BasicDynamicBuilderFunc<TBuilder extends IBasicDynamicFilterBuilder> =
  BasicDynamicBuilderArgFunc<TBuilder, ODataTypes.Bool>;

export interface IDynamicCollectionPropFilterBuilder<TBuilder extends IBasicDynamicFilterBuilder> {
  count: IDynamicFilterExpressionResult;
  any(condition?: BasicDynamicBuilderArgFunc<TBuilder, ODataTypes.Bool>): IDynamicFilterBuilderResult;
  all(condition: BasicDynamicBuilderArgFunc<TBuilder, ODataTypes.Bool>): IDynamicFilterBuilderResult;
}

export interface IBasicDynamicFilterBuilder {
  prop: ODataPropertyPath;
  // collection: <I, TBuilder extends IBasicFilterBuilder<I>>(prop: ObjPathProxy<T, Array<I>>)=> ICollectionPropFilterBuilder<I, TBuilder>;
  binaryOperator<TArg extends TDynamicPropType>(
    op: string,
    left: BasicDynamicBuilderArg<IBasicDynamicFilterBuilder,TArg>,
    right: BasicDynamicBuilderArg<IBasicDynamicFilterBuilder,TArg>
  ): IDynamicFilterExpressionResult;
  getArgString<TResult extends TDynamicPropType>(
    arg: BasicDynamicBuilderArg<IBasicDynamicFilterBuilder, TResult>
  ): string
}

export interface IDynamicFilterExpressionResult {
  getString(): string;
}

export interface IDynamicFilterBuilderResult extends IDynamicFilterExpressionResult { }


