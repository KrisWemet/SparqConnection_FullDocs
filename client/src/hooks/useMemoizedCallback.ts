import { useCallback, useRef, useEffect } from 'react';

type AnyFunction = (...args: any[]) => any;

/**
 * A custom hook that combines useCallback with a deep comparison of dependencies.
 * This is useful when you need to memoize a callback that depends on complex objects
 * or arrays that might be recreated on each render but have the same values.
 *
 * @param callback - The function to memoize
 * @param dependencies - Array of dependencies that should trigger a callback update
 * @returns Memoized callback function
 */
export function useMemoizedCallback<T extends AnyFunction>(
  callback: T,
  dependencies: any[],
  skipFirstRender = false
): T {
  const skipFirstRenderRef = useRef(skipFirstRender);

  const memoizedCallback = useCallback((...args: Parameters<T>) => {
    if (skipFirstRenderRef.current) {
      skipFirstRenderRef.current = false;
      return;
    }
    return callback(...args);
  }, dependencies);

  useEffect(() => {
    return () => {
      skipFirstRenderRef.current = skipFirstRender;
    };
  }, [skipFirstRender]);

  return memoizedCallback as T;
}

/**
 * A custom hook that helps prevent unnecessary re-renders by deeply comparing
 * the previous and current values of dependencies.
 *
 * @param value - The value to compare
 * @param dependencies - Array of dependencies that should trigger a value update
 * @returns The memoized value
 */
export function useDeepCompareMemo<T>(value: T, dependencies: any[]): T {
  const ref = useRef<{
    deps: any[];
    value: T;
  }>();

  const depsChanged = !ref.current?.deps || dependencies.some(
    (dep, i) => !Object.is(dep, ref.current?.deps[i])
  );

  useEffect(() => {
    if (depsChanged) {
      ref.current = {
        deps: dependencies,
        value,
      };
    }
  }, [depsChanged, value, ...dependencies]);

  return depsChanged ? value : (ref.current?.value as T);
}

/**
 * A custom hook that combines useCallback with deep comparison of dependencies
 * and automatic dependency tracking.
 *
 * @param callback - The function to memoize
 * @returns Memoized callback function
 */
export function useAutoMemoizedCallback<T extends AnyFunction>(callback: T): T {
  const ref = useRef<{
    cb: T;
    fn: T;
    trackedDeps: Set<any>;
  }>();

  if (!ref.current) {
    ref.current = {
      cb: callback,
      fn: ((...args: any[]) => {
        const trackedDeps = new Set<string | symbol>();
        const proxy = new Proxy<Record<string | symbol, unknown>>({}, {
          get(target, prop) {
            trackedDeps.add(prop);
            return (target as any)[prop];
          },
        });

        const result = ref.current?.cb.apply(proxy, args);
        ref.current!.trackedDeps = trackedDeps;
        return result;
      }) as T,
      trackedDeps: new Set(),
    };
  }

  useEffect(() => {
    ref.current!.cb = callback;
  }, [callback]);

  return ref.current.fn;
}

export default useMemoizedCallback; 