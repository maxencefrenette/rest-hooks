import { useContext, useEffect, useRef } from 'react';

import { DispatchContext } from '../context';
import { ReadShape, Schema } from '../../resource';

/** Keeps a resource fresh by subscribing to updates. */
export default function useSubscription<
  Params extends Readonly<object>,
  Body extends Readonly<object> | void,
  S extends Schema
>(
  requestShape: ReadShape<S, Params, Body>,
  params: Params,
  body?: Body,
  active = true,
) {
  const dispatch = useContext(DispatchContext);
  // we just want the current values when we dispatch, so
  // box the shape in a ref to make react-hooks/exhaustive-deps happy
  const shapeRef = useRef(requestShape);
  shapeRef.current = requestShape;

  useEffect(() => {
    if (!active) return;
    const { fetch, schema, getUrl, options } = shapeRef.current;
    const url = getUrl(params);

    dispatch({
      type: 'rest-hooks/subscribe',
      meta: {
        schema,
        fetch: () => fetch(url, body as Body),
        url,
        frequency: options && options.pollFrequency,
      },
    });
    return () => {
      dispatch({
        type: 'rest-hooks/unsubscribe',
        meta: {
          url,
          frequency: options && options.pollFrequency,
        },
      });
    };
  // serialize params
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, body, active, params && requestShape.getUrl(params)]);
}
