import { Type } from './types';
import { createProxy, getPath, isProxy, ObjPathProxy } from 'ts-object-path';
import {
  IBasicFilterBuilder, ICollectionPropFilterBuilder,
  IFilterBuilderResult, IFilterExpressionResult,
  BasicBuilderFunc, BasicBuilderArg, BasicBuilderArgFunc, BasicBuilderProp,
  TPropType
} from './types';

export class FilterExpressionResult<TEntity, TResult> implements IFilterExpressionResult<TEntity, TResult> {
  constructor(private stringResult: string) {}
  getString() { return this.stringResult;}
}

export function buildWithBuilder<T, TBuilder extends BasicFilterBuilder<T>>(
    builder: TBuilder, f: BasicBuilderFunc<T, TBuilder>
) {
  if (!f) {
    return new FilterExpressionResult<T, boolean>('');
  }
  const result = f(builder, builder.prop);
  const str = builder.getArgString(result);
  return new FilterExpressionResult<T, boolean>(str);
}

export class BasicFilterBuilder<T> implements IBasicFilterBuilder<T> {
  protected constructor(protected prefix: string|null = null) { }

  getArgString<TResult extends TPropType, TBuilder extends BasicFilterBuilder<T>>(
    arg: BasicBuilderArg<T, TBuilder, TResult>
  ): string {
    if (typeof arg === 'function') {
      const func = arg as BasicBuilderArgFunc<T, BasicFilterBuilder<T>, TResult>;
      arg = func(this, this.prop);
    }
    if (isProxy<T, TResult>(arg)) {
      return getPath(arg).join('/');
    }
    if (arg instanceof FilterExpressionResult) {
      return arg.getString();
    }
    if (arg instanceof Date) {
      return arg.toISOString();
    }
    if (typeof arg === 'string') {
      return `'${(arg as string).replace(/'/g, "''")}'`;
    }
    return JSON.stringify(arg);
  }

  function<TResult extends TPropType, TBuilder extends BasicFilterBuilder<T>>(
      functionName: string,
      ...args: BasicBuilderArg<T, TBuilder, TPropType>[]
  ) {
    const argsString = args.map(a => this.getArgString(a)).join(', ');
    return new FilterExpressionResult<T, TResult>(`${functionName}(${argsString})`);
  }

  binaryOperator<TArg extends TPropType, TBuilder extends BasicFilterBuilder<T>>(
    op: string,
    left: BasicBuilderArg<T, TBuilder,TArg>,
    right: BasicBuilderArg<T, TBuilder,TArg>
  ): FilterExpressionResult<T, boolean> {
    const leftStr = this.getArgString(left);
    const rightStr = this.getArgString(right);
    return new FilterExpressionResult<T, boolean>(`(${leftStr} ${op} ${rightStr})`);
  }

  protected logicalOperator<TArg extends TPropType, TBuilder extends BasicFilterBuilder<T>>(
    op: string,
    ...args: BasicBuilderArg<T, TBuilder, TArg>[]
  ) {
    if (!args.length) {
      return new FilterExpressionResult<T, boolean>(`true`);
    }
    const argsString = args.map(a => this.getArgString(a)).join(` ${op} `);
    return new FilterExpressionResult<T, boolean>(`(${argsString})`);
  }

  get prop() {
    const prefix = this.prefix ? [this.prefix] : [];
    return createProxy<T>(prefix);
  }

  protected collectionProp<I, TBuilder extends BasicFilterBuilder<I>>(prop: ObjPathProxy<T, Array<I>>, varName: string|null): ICollectionPropFilterBuilder<I, TBuilder> {
    const polymorphicCtor = (this.constructor as any);
    return new CollectionPropFilterBuilder(prop, polymorphicCtor, varName);
  }

  protected nestedCondition<I, TBuilder extends BasicFilterBuilder<I>>(
    prop: BasicBuilderProp<I, TBuilder, any>,
    condition: BasicBuilderArg<I, TBuilder, boolean>
  ): FilterExpressionResult<T, boolean> {
    const polymorphicCtor = (this.constructor as any);
    const prefix = getPath(prop).join('/');
    const nestedBuilder: TBuilder = new polymorphicCtor(prefix);
    return new FilterExpressionResult<T, boolean>(nestedBuilder.getArgString(condition));
  }

}


class CollectionPropFilterBuilder<I, TBuilder extends BasicFilterBuilder<I>>
  implements ICollectionPropFilterBuilder<I, TBuilder> {

    constructor(private collectionProp: ObjPathProxy<any, Array<I>>,
                private builderClass: Type<TBuilder>,
                private varName: string|null) { }

    any(condition: BasicBuilderArgFunc<I, TBuilder, boolean>|null = null) {
      return this.collectionFunc('any', condition);
    }

    all(condition: BasicBuilderArgFunc<I, TBuilder, boolean>) {
      return this.collectionFunc('all', condition);
    }

    private collectionFunc(name: string, condition: BasicBuilderArgFunc<I, TBuilder, boolean>|null) {
      const prefix = getPath(this.collectionProp).join('/');
      if (!condition) {
        return new FilterExpressionResult<I, boolean>(`${prefix}/${name}()`);
      }

      const varName = this.varName || 'i' + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
      const builder = new this.builderClass(varName);
      return new FilterExpressionResult<I, boolean>(`${prefix}/${name}(${varName}: ${builder.getArgString(condition)})`);
    }

    get count() {
      const prefix = getPath(this.collectionProp).join('/');
      return new FilterExpressionResult<I, number>(`${prefix}/$count`);
    }
  }
