import type { Metadata } from "next";
import { DsfrHead, DsfrProvider } from "./dsfr";
import { Footer } from "@codegouvfr/react-dsfr/Footer";
import { CustomHeader } from "@/components/CustomHeader";

export const metadata: Metadata = {
  title: "Tableau de bord Grippe",
  description: "Suivi de l'épidémie de grippe en France",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <DsfrHead />
      </head>
      <body>
        <DsfrProvider>
          <CustomHeader />
          {children}
          <Footer
            brandTop={
              <>
                RÉPUBLIQUE
                <br />
                FRANÇAISE
              </>
            }
            homeLinkProps={{
              href: "/",
              title: "Accueil - Tableau de bord Grippe",
            }}
            accessibility="non compliant"
            contentDescription="Tableau de bord de suivi de l'épidémie de grippe en France. Données actualisées quotidiennement à partir des sources officielles : Réseau Sentiweb, Santé Publique France (ODISSE) et IQVIA."
            bottomItems={[
              {
                text: "Plan du site",
                linkProps: {
                  href: "/",
                },
              },
              {
                text: "Accessibilité : non conforme",
                linkProps: {
                  href: "/",
                },
              },
              {
                text: "Mentions légales",
                linkProps: {
                  href: "/",
                },
              },
              {
                text: "Données personnelles",
                linkProps: {
                  href: "/",
                },
              },
            ]}
            operatorLogo={{
              orientation: "horizontal",
              imgUrl: "/dsfr/artwork/logo/logo-rf.svg",
              alt: "République Française",
            }}
            linkList={[
              {
                categoryName: "Sources de données",
                links: [
                  {
                    text: "Réseau Sentiweb",
                    linkProps: {
                      href: "https://www.sentiweb.fr",
                      target: "_blank",
                      rel: "noopener noreferrer",
                    },
                  },
                  {
                    text: "Santé Publique France (ODISSE)",
                    linkProps: {
                      href: "https://odisse.santepubliquefrance.fr",
                      target: "_blank",
                      rel: "noopener noreferrer",
                    },
                  },
                  {
                    text: "IQVIA - data.gouv.fr",
                    linkProps: {
                      href: "https://www.data.gouv.fr/fr/organizations/iqvia-france/",
                      target: "_blank",
                      rel: "noopener noreferrer",
                    },
                  },
                ],
              },
              {
                categoryName: "Liens utiles",
                links: [
                  {
                    text: "vaccination-info-service.fr",
                    linkProps: {
                      href: "https://vaccination-info-service.fr",
                      target: "_blank",
                      rel: "noopener noreferrer",
                    },
                  },
                  {
                    text: "Santé.fr",
                    linkProps: {
                      href: "https://www.sante.fr",
                      target: "_blank",
                      rel: "noopener noreferrer",
                    },
                  },
                  {
                    text: "data.gouv.fr",
                    linkProps: {
                      href: "https://www.data.gouv.fr",
                      target: "_blank",
                      rel: "noopener noreferrer",
                    },
                  },
                ],
              },
            ]}
          />
        </DsfrProvider>
      </body>
    </html>
  );
}
