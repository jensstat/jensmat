import type { RouteObject } from "react-router";
import App from "./App";
import { dataCheckLoader, recipeListLoader, recipeLoader } from "./loaders";
import DataCheckPage from "./pages/DataCheckPage";
import HomePage from "./pages/HomePage";
import LoadingPage from "./pages/LoadingPage";
import NotFoundPage from "./pages/NotFoundPage";
import PizzaCalculatorPage from "./pages/PizzaCalculatorPage";
import RecipeListPage from "./pages/RecipeListPage";
import RecipePage from "./pages/RecipePage";
import RouteErrorPage from "./pages/RouteErrorPage";
import LoginPage from "./pages/LoginPage";
// Every address on the site, and what's shown there. Used by main.tsx.
// Written as a list of objects (not <Route> tags) because only this way can a route
// have a loader: what it needs before it's shown (see loaders.ts).
//
// - App is the frame (header, footer), with the pages inside it (<Outlet />).
// - errorElement: shown instead of the page if a loader or the page fails. It's on a
//   route without an address around the pages, so the header and footer stay.
// - HydrateFallback: shown on the very first load, while the first loader waits.
export const routes: RouteObject[] = [
  {
    element: <App />,
    children: [
      {
        errorElement: <RouteErrorPage />,
        HydrateFallback: LoadingPage,
        children: [
          { path: "/", element: <HomePage /> },
          { path: "/pizza", element: <PizzaCalculatorPage /> },
          {
            path: "/oppskrifter",
            element: <RecipeListPage />,
            loader: recipeListLoader,
            // A change in only the ?… part (the search and the filters) doesn't fetch the
            // recipes again: the loader fetches all of them, and the filtering happens on
            // the page. Anything else (like "Prøv igjen", which keeps the same address)
            // does what React Router normally does.
            shouldRevalidate: ({
              currentUrl,
              nextUrl,
              defaultShouldRevalidate,
            }) =>
              currentUrl.pathname === nextUrl.pathname &&
              currentUrl.search !== nextUrl.search
                ? false
                : defaultShouldRevalidate,
          },
          {
            path: "/oppskrifter/:id",
            element: <RecipePage />,
            loader: recipeLoader,
          },
          // Not in the menu: the admin's login (src/auth/firebase.ts)
          { path: "/logg-inn", element: <LoginPage /> },
          // Not in the menu: which recipes are missing what (recipes/completeness.ts).
          // A fixed address wins over :id, so no recipe can be called "datasjekk".
          {
            path: "/oppskrifter/datasjekk",
            element: <DataCheckPage />,
            loader: dataCheckLoader,
          },
          // * = every other address: "Fant ikke siden" instead of an empty page
          { path: "*", element: <NotFoundPage /> },
        ],
      },
    ],
  },
];
