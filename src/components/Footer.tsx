// This runs once, when the file is loaded, and not every time the footer is drawn.
// React wants components to give the same result each time they run, so values like
// the current date are kept outside the component.
const year = new Date().getFullYear()

function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      {/* Inside JSX, curly braces {} let you use normal JavaScript values, like year. */}
      <div className="mx-auto max-w-6xl px-4 py-4 text-sm text-gray-500 md:px-8">
        © {year} Min matnettside
      </div>
    </footer>
  )
}

export default Footer
