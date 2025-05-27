export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-primary mb-4">
          Página no encontrada
        </h1>
        <p className="text-gray-600 mb-6">
          Lo sentimos, la página que estás buscando no existe.
        </p>
        <a
          href="/"
          className="inline-block bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
        >
          Volver al inicio
        </a>
      </div>
    </div>
  );
}
