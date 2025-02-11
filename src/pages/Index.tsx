
import { SquaresDemo } from "@/components/ui/squares-demo";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";

const Index = () => {
  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10">
        <SquaresDemo />
      </div>
      <header className="fixed top-0 left-0 right-0 z-50">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold">Fantom Web</div>
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Sobre</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4">
                      <li className="p-2">
                        <NavigationMenuLink asChild>
                          <a href="#" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                            <div className="text-sm font-medium leading-none">História</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Conheça nossa trajetória
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <li className="p-2">
                        <NavigationMenuLink asChild>
                          <a href="#" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                            <div className="text-sm font-medium leading-none">Equipe</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Conheça nosso time
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Serviços</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4">
                      <li className="p-2">
                        <NavigationMenuLink asChild>
                          <a href="#" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                            <div className="text-sm font-medium leading-none">Web Design</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Criação de sites e aplicações web
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <li className="p-2">
                        <NavigationMenuLink asChild>
                          <a href="#" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                            <div className="text-sm font-medium leading-none">Marketing Digital</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Estratégias para crescimento online
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50" href="#">
                    Contato
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </nav>
      </header>
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="inline-flex items-center justify-center px-4 py-1.5 mb-8 text-sm border rounded-full border-white/20 gap-2 bg-white/5 backdrop-blur">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          Fantom Web
        </div>
        <h1 className="text-6xl font-bold mb-6">
          <span className="text-blue-500">Eleve</span> seu negócio<br />
          e escale no <span className="text-blue-500">digital</span>
        </h1>
        <p className="text-lg text-gray-400 mb-12 max-w-2xl">
          Criamos experiências digitais que impulsionam negócios<br />
          por meio de estratégia, design e tecnologia.
        </p>
        <button className="inline-flex items-center px-6 py-3 text-sm font-medium text-white transition-colors bg-blue-600 rounded-full hover:bg-blue-700">
          Fale com a Fantom
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Index;
