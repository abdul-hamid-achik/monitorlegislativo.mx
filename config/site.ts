export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "Monitor Legislativo",
  description:
    "Un lugar para observar al congreso y al senado de la republica mexicana",
  mainNav: [
    {
      title: "Inicio",
      href: "/",
    },
    {
      title: "Diputados",
      href: "/diputados",
    },
    {
      title: "Senadores",
      href: "/senadores",
    },

    {
      title: "Acerca de",
      href: "/about",
    },
  ],
  links: {
    twitter: "https://twitter.com/abdulachik",
    github: "https://github.com/abdul-hamid-achik",
  },
}
