
export default function Maintenance() {
  return (
    <div className="min-h-screen bg-yellow-100 flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="text-7xl mb-4 animate-bounce">🚧</div>

        <h1 className="text-4xl font-extrabold text-yellow-900 mb-2">
          Oops! We’re Still Hammering Things 🔨
        </h1>

        <p className="text-yellow-800 text-lg mb-6">
          This site is currently under construction.
          <br />
          But don’t worry, our engineers (and maybe a squirrel 🐿️ with a wrench) are on it!
        </p>

        <img
          src="https://media.giphy.com/media/26gscSULUCFXW/giphy.gif"
          alt="Funny construction"
          className="rounded-xl shadow-lg mx-auto mb-6"
        />

        <p className="text-sm text-gray-700">
          In the meantime, go grab a ☕ or pet a cat 🐱. We'll be back soon!
        </p>
      </div>
    </div>
  );
}
