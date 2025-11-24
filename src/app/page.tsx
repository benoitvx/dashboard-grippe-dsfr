import { HeroIncidence } from "@/components/sections/HeroIncidence";
import { CarteRegionale } from "@/components/sections/CarteRegionale";
import { EvolutionComparative } from "@/components/sections/EvolutionComparative";
import { PressionHospitaliere } from "@/components/sections/PressionHospitaliere";
import { VaccinationKPI } from "@/components/sections/VaccinationKPI";
import { EvolutionVaccination } from "@/components/sections/EvolutionVaccination";
import { ActesPharmacie } from "@/components/sections/ActesPharmacie";
import VaccinationMapSection from "@/components/VaccinationMapSection";

export default function Home() {
  return (
    <div className="fr-container fr-py-4w">
      <h1>Tableau de bord Grippe</h1>
      <p className="fr-text--lead">
        Suivez en temps réel l'évolution de l'épidémie de grippe en France : incidence nationale et régionale,
        hospitalisations, couverture vaccinale et lieux de vaccination. Données actualisées quotidiennement
        à partir des sources officielles (Sentiweb, Santé Publique France, IQVIA).
      </p>

      {/* Section 1: Hero incidence nationale */}
      <HeroIncidence />

      {/* Section 2: Carte régionale */}
      <CarteRegionale />

      {/* Section 3: Évolution comparative multi-années */}
      <EvolutionComparative />

      {/* Section 4: Pression hospitalière */}
      <PressionHospitaliere />

      {/* Section 5: Vaccination KPI */}
      <VaccinationKPI />

      {/* Section 6: Évolution vaccination */}
      <EvolutionVaccination />

      {/* Section 7: Actes pharmacie */}
      <ActesPharmacie />

      {/* Section 8: Carte lieux vaccination */}
      <VaccinationMapSection />
    </div>
  );
}
