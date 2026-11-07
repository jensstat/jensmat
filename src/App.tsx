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

      {/* max-w-6xl + px-4 md:px-8 is the same as in Header and Footer, so they line up. */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-8">
        <HomePage />
      </main>

      <Footer />
    </div>
  );
}

export default App;
