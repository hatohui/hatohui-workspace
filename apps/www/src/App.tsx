import { AccountBar } from '@hatohui/libs';
import { Button } from '@hatohui/ui';
import AmbientBackground from './components/AmbientBackground';
import { useStaggerReveal } from './hooks/useStaggerReveal';
import { APP_LINKS } from './constants/apps';

function App() {
  const revealRef = useStaggerReveal<HTMLDivElement>('[data-reveal]', []);

  return (
    <>
      <AmbientBackground />
      <main
        ref={revealRef}
        className="mx-auto flex max-w-md flex-col gap-8 px-4 py-24"
      >
        <div data-reveal className="flex items-center justify-between">
          <h1 className="font-serif text-3xl text-foreground">Hatohui</h1>
          <AccountBar />
        </div>
        <div className="flex flex-col gap-3">
          {APP_LINKS.map((app) => (
            <Button
              key={app.url}
              data-reveal
              asChild
              variant="outline"
              className="group justify-start border-border/60 bg-card/60 py-6 text-base backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary hover:shadow-lg"
            >
              <a href={app.url}>
                {app.name}
                <span className="ml-auto opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  →
                </span>
              </a>
            </Button>
          ))}
        </div>
      </main>
    </>
  );
}

export default App;
