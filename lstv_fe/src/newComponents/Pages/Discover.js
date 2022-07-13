import React from "react";
import {
  Switch,
  Route,
  Link,
  useParams,
  useRouteMatch
} from "react-router-dom";

// Since routes are regular React components, they
// may be rendered anywhere in the app, including in
// child elements.
//
// This helps when it's time to code-split your app
// into multiple bundles because code-splitting a
// React Router app is the same as code-splitting
// any other React app.


const routes = [
  {
    path: "/discover/sandwiches",
    name: 'Sandwiches',
    component: Sandwiches
  },
  {
    path: "/discover/videos",
    component: Videos,
    name: 'Videos',
    routes: [
      {
        path: "/discover/videos/bus",
        component: Bus
      },
      {
        path: "/discover/videos/cart",
        component: Cart
      }
    ]
  }
];

export default function Discover() {
  return (
      <div>
        <ul>
          <li>
            <Link to="/discover/videos">Video Link</Link>
          </li>
          <li>
            <Link to="/discover/sandwiches">Sandwich</Link>
          </li>
          {/* {routes.map((route, i) => (
            <li><Link key={i} to={route.path}>{route.name}</Link></li>
          ))} */}
        </ul>

        <Switch>
          {routes.map((route, i) => (
            <RouteWithSubRoutes key={i} {...route} />
          ))}
          {/* <Route path={'/discover/bus/sandwiches'} component={Sandwiches}/>
          <Route path={'/discover/cart'} component={Cart}/> */}
        </Switch>
      </div>
  );
}

// A special wrapper for <Route> that knows how to
// handle "sub"-routes by passing them in a `routes`
// prop to the component it renders.
function RouteWithSubRoutes(route) {
  return (
    <Route
      path={route.path}
      render={props => (
        // pass the sub-routes down to keep nesting
          <route.component {...props} routes={route.routes} />
      )}
    />
  );
}
function Videos( {routes }) {
  let { path, url} = useRouteMatch();

  return (
    <>
      <p>Videos</p>
      <li><Link to={`${url}/bus`}>Bus</Link></li>
      <li><Link to="/discover/videos/cart">Cart</Link></li>

      <Switch>
        {routes.map((route, i) => (
          <RouteWithSubRoutes key={i} {...route} />
        ))}
        {/* 
          //this wont' work with a routing config, we will have to add more selectors THOM
          <Route exact path={path}>
          <h3>Please select a topic.</h3>
        </Route>
        <Route path={`${path}/:topicId`}>
          <Topic />
        </Route> */}
       
      </Switch>
    </>
  )
}

function Sandwiches() {
  return <h2>Sandwiches</h2>;
}
function Bus() {
  return <h3>Bus</h3>;
}

function Cart() {
  return <h3>Cart</h3>;
}
