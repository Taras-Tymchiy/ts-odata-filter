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


export type BasicBuilderProp<TBuilder extends IBasicDynamicFilterBuilder> = ODataPropertyPath;

export type BasicDynamicBuilderArg<TBuilder extends IBasicDynamicFilterBuilder> =
  BasicDynamicBuilderArgFunc<TBuilder> |
  IDynamicFilterExpressionResult |
  BasicBuilderProp<TBuilder> |
  String | Number | Boolean | Date;

export type BasicDynamicBuilderArgFunc<TBuilder extends IBasicDynamicFilterBuilder> =
  (arg: TBuilder, props: any)=> BasicDynamicBuilderArg<TBuilder>;

export type BasicDynamicBuilderFunc<TBuilder extends IBasicDynamicFilterBuilder> =
  BasicDynamicBuilderArgFunc<TBuilder>;

export interface IDynamicCollectionPropFilterBuilder<TBuilder extends IBasicDynamicFilterBuilder> {
  count: IDynamicFilterExpressionResult;
  any(condition?: BasicDynamicBuilderArgFunc<TBuilder>): IDynamicFilterBuilderResult;
  all(condition: BasicDynamicBuilderArgFunc<TBuilder>): IDynamicFilterBuilderResult;
}

export interface IBasicDynamicFilterBuilder {
  prop: any;
  // collection: <I, TBuilder extends IBasicFilterBuilder<I>>(prop: ObjPathProxy<T, Array<I>>)=> ICollectionPropFilterBuilder<I, TBuilder>;
  binaryOperator(
    op: string,
    left: BasicDynamicBuilderArg<IBasicDynamicFilterBuilder>,
    right: BasicDynamicBuilderArg<IBasicDynamicFilterBuilder>
  ): IDynamicFilterExpressionResult;
  getArgString(
    arg: BasicDynamicBuilderArg<IBasicDynamicFilterBuilder>
  ): string
}

export interface IDynamicFilterExpressionResult {
  getString(): string;
}

export interface IDynamicFilterBuilderResult extends IDynamicFilterExpressionResult { }


