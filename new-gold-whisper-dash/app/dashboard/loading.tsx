export default function Loading() {
  return (
    <div className="container mx-auto py-6 flex flex-col items-center justify-center min-h-[80vh]">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-r-transparent"></div>
        <p className="text-muted-foreground">Cargando dashboard...</p>
      </div>
    </div>
  );
}