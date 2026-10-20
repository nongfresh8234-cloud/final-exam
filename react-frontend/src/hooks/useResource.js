import { useEffect, useState } from 'react';
import { api } from '../lib/api';
export function useResource(path) {
  const [revision, setRevision] = useState(0);
  const key = `${path}:${revision}`;
  const [state, setState] = useState({ key: '', data: null, error: '' });
  useEffect(() => {
    const controller = new AbortController();
    api(path, { signal: controller.signal }).then(data => setState({ key, data, error: '' })).catch(error => {
      if (error.name !== 'AbortError') setState({ key, data: null, error: error.message });
    });
    return () => controller.abort();
  }, [path, key]);
  return { data: state.key === key ? state.data : null, error: state.key === key ? state.error : '', loading: state.key !== key, reload: () => setRevision(value => value + 1) };
}
