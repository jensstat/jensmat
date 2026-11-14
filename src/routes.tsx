import type { RouteObject, ShouldRevalidateFunction } from "react-router";
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
// A change in only the ?… part of the address (the search and filters on the
// overview, ?rediger on a recipe) doesn't fetch the recipes again: the page reads
// the ?… part itself. Anything else (like «Prøv igjen», or the editor asking for a
// fresh fetch after «Lagre», both on the same address) does what React Router
// normally does
const notForSearchChanges: ShouldRevalidateFunction = ({
  currentUrl,
  nextUrl,
  defaultShouldRevalidate,
}) =>
  currentUrl.pathname === nextUrl.pathname &&
  currentUrl.search !== nextUrl.search
    ? false
    : defaultShouldRevalidate;

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
            // Filtering and searching (?sok=…) happen on the page: no new fetch
            shouldRevalidate: notForSearchChanges,
          },
          {
            path: "/oppskrifter/:id",
            element: <RecipePage />,
            loader: recipeLoader,
            // Opening and closing «Rediger» (?rediger): no new fetch
            shouldRevalidate: notForSearchChanges,
          },
          // Not in the menu: the admin's login (src/auth/firebase.ts)
          {
            path: "/logg-inn",
            // lazy: the page (and Firebase with it) is its own file, downloaded only
            // when someone goes to /logg-inn. Visitors never download it.
            lazy: async () => {
              const page = await import("./pages/LoginPage");
              return { Component: page.default };
            },
          },
          // The admin's new recipe. lazy, like /logg-inn: the page and its action
          // (and Firebase, through adminFetch) are only downloaded when someone goes here.
          {
            path: "/ny-oppskrift",
            lazy: async () => {
              const [page, save] = await Promise.all([
                import("./pages/NewRecipePage"),
                import("./admin/newRecipeAction"),
              ]);
              return { Component: page.default, action: save.newRecipeAction };
            },
          },
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
