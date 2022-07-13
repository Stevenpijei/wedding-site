import React, { Suspense } from 'react';
const AnotherLazyComponent = React.lazy(() => import('./AnotherLazyComponent'));

export const LazyVideoComponent = () => (
  <>
    <p>Stuff</p>
    <Suspense fallback={<div>Loading...</div>}>
      <AnotherLazyComponent/>
    </Suspense>
  </>
)
export default LazyVideoComponent;