import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";

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
        <HomePage />
      </main>

      <Footer />
    </div>
  );
}

export default App;
