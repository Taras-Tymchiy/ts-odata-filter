import { ObjPathProxy } from 'ts-object-path';

export interface Type<T> {
  new (...args: any[]): T;
}

export type TPrimitive = number | string | Date | boolean;
export type TPropType = TPrimitive;

export type BasicBuilderProp<TEntity, TBuilder extends IBasicFilterBuilder<TEntity>, TResult> =
  ObjPathProxy<TEntity, TResult>;

export type BasicBuilderArg<TEntity, TBuilder extends IBasicFilterBuilder<TEntity>, TResult extends TPropType> =
  BasicBuilderArgFunc<TEntity, TBuilder, TResult> |
  IFilterExpressionResult<TEntity, TResult> |
  BasicBuilderProp<TEntity, TBuilder, TResult> |
  TResult;

export type BasicBuilderArgFunc<TEntity, TBuilder extends IBasicFilterBuilder<TEntity>, TResult extends TPropType> =
  (arg: TBuilder, props: ObjPathProxy<TEntity, TEntity>)=> BasicBuilderArg<TEntity, TBuilder, TResult>;

export type BasicBuilderFunc<TEntity, TBuilder extends IBasicFilterBuilder<TEntity>> =
  BasicBuilderArgFunc<TEntity, TBuilder, boolean>;

export interface ICollectionPropFilterBuilder<I, TBuilder extends IBasicFilterBuilder<I>> {
  count: IFilterExpressionResult<I, number>;
  any(condition?: BasicBuilderArgFunc<I, TBuilder, boolean>): IFilterBuilderResult<boolean>;
  all(condition: BasicBuilderArgFunc<I, TBuilder, boolean>): IFilterBuilderResult<boolean>;
}

export interface IBasicFilterBuilder<T> {
  prop: ObjPathProxy<T, T>;
  // collection: <I, TBuilder extends IBasicFilterBuilder<I>>(prop: ObjPathProxy<T, Array<I>>)=> ICollectionPropFilterBuilder<I, TBuilder>;
  binaryOperator<TArg extends TPropType>(
    op: string,
    left: BasicBuilderArg<T, IBasicFilterBuilder<T>,TArg>,
    right: BasicBuilderArg<T, IBasicFilterBuilder<T>,TArg>
  ): IFilterExpressionResult<T, boolean>;
  getArgString<TResult extends TPropType>(
    arg: BasicBuilderArg<T, IBasicFilterBuilder<T>, TResult>
  ): string
}

export interface IFilterExpressionResult<TEntity, TResult> {
  getString(): string;
}

export interface IFilterBuilderResult<TEntity> extends IFilterExpressionResult<TEntity, boolean> { }


