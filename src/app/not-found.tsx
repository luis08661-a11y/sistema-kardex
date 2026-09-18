import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-4">
      <div className="space-y-4">
        <h1 className="text-9xl font-extrabold text-primary tracking-widest">
          404
        </h1>
        <div className="bg-primary text-primary-foreground text-sm px-2 py-1 rounded rotate-12 inline-block font-semibold">
          Página no encontrada
        </div>
      </div>

      <p className="text-muted-foreground text-lg mt-6 max-w-md">
        Lo sentimos, la página que estás buscando no existe o ha sido movida a otra ubicación.
      </p>

      <div className="mt-8">
        <Link
          href="/"
          className="px-6 py-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors duration-200 inline-block shadow-lg shadow-primary/20"
        >
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}