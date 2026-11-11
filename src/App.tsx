import Header from "./components/Header";
import Footer from "./components/Footer";
import PizzaCalculatorPage from "./pages/PizzaCalculatorPage";
import { Route, Routes } from "react-router";
import HomePage from "./pages/HomePage";
import RecipePage from "./pages/RecipePage";
import RecipeListPage from "./pages/RecipeListPage";
import NotFoundPage from "./pages/NotFoundPage";
import DataCheckPage from "./pages/DataCheckPage";

// App is the top component. It puts the big pieces of the page together.
function App() {
  return (
    // min-h-screen + flex-col: the page is at least as tall as the screen.
    // flex-1 on <main> lets it fill the leftover space, so the footer stays at the bottom.
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      {/* <main> sets no width, so pages can have full-width backgrounds.
          Each page centres its own content with max-w-6xl, like Header and Footer.
          flex flex-col lets a page fill all of <main> by giving its section flex-1. */}
      <main className="flex flex-1 flex-col">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/pizza" element={<PizzaCalculatorPage />} />
          np
          <Route path="/oppskrifter" element={<RecipeListPage />} />
          <Route path="/oppskrifter/:id" element={<RecipePage />} />
          {/* Not in the menu: which recipes are missing what (recipes/completeness.ts).
              A fixed address wins over :id, so no recipe can be called "datasjekk". */}
          <Route path="/oppskrifter/datasjekk" element={<DataCheckPage />} />
          {/* * = every other address: shows "Fant ikke siden" instead of an empty page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
