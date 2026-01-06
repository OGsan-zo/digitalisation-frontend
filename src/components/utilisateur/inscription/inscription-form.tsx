"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Loader2} from "lucide-react"
import DocumentsForm from "./sous-composant/DocumentsForm"
import IdentiteDisplay from "./sous-composant/IdentiteDisplay"
import FormationDisplay from "./sous-composant/FormationDisplay"
import { Formation, Identite, PaiementData } from '@/lib/db'
import PaiementForm from "./sous-composant/PayementForm"
import { useRouter } from "next/navigation"
import { db } from "@/lib/db"

export function InscriptionForm() {
  const [step, setStep] = useState("identite");
  const router = useRouter();
  const login= process.env.NEXT_PUBLIC_LOGIN_URL || '/login';
  const [loadingInscription, setLoadingInscription] = useState(false);
  const [errorInscription, setErrorInscription] = useState("");
  const [successMessageInscription, setSuccessMessageInscription] = useState(""); // État pour le message de succès
  const [loadingEtudiant, setLoadingEtudiant] = useState(false);
  const [validatedDocs, setValidatedDocs] = useState<Record<string, boolean>>({
    photo: false,
    acte: false,
    diplome: false,
    cni: false,
    medical: false,
  });
  const [nomSearch, setNomSearch] = useState("")
  const [prenomSearch, setPrenomSearch] = useState("")

  // États pour les données (initialement null ou vides)
  const [identite, setIdentite] = useState<Identite | null>(null)
  const [formation, setFormation] = useState<Formation | null>(null)
  const [parcoursType, setParcoursType] = useState<string>("");
  // const identites = {
  //   id: 1,
  //   nom: "RAKOTO",
  //   prenom: "Jean Pierre",
  //   dateNaissance: "2003-03-15",
  //   lieuNaissance: "Antsirabe",
  //   sexe: "Masculin",
  //   nationalite: "Malagasy",
  //   telephone: "+261 34 00 000 00",
  //   contact: {
  //     adresse: "123 Rue Analakely, Antananarivo 101",
  //     email: "jean.rakoto@exemple.mg"
  //   }
  // };
  // const formations = {
  //   formation: "Académique",
  //   formationType: "Académique",
  //   niveau: "Licence 1",
  //   mention: "Télécommunications"
  // };
  const [paiementData, setPaiementData] = useState<PaiementData>({
    refAdmin: "",
    dateAdmin: "",
    montantAdmin:"",
    refPedag: "",
    datePedag: "",
    montantPedag:"",
    montantEcolage: "",
    refEcolage: "",
    dateEcolage: "",

  });

  // 2. Fonction de mise à jour partielle
  const updatePaiement = (fields: Partial<PaiementData>) => {
    setPaiementData(prev => ({ ...prev, ...fields }));
  };


  const toggleDoc = (docId: string) => {
    setValidatedDocs((prev) => ({ ...prev, [docId]: !prev[docId] }))
  }
  const resetForm = () => {
    setIdentite(null);
    setFormation(null);
    setPaiementData({
      refAdmin: "",
      dateAdmin: "",
      montantAdmin:"",  
      refPedag: "",
      datePedag: "",
      montantPedag:"",
      montantEcolage: "",
      refEcolage: "",
      dateEcolage: ""
    });
  };
  const rechercheEtudiants = async () => {
        setLoadingEtudiant(true);
        resetForm();
        try {
          const res = await fetch("/api/etudiants/recherche", 
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json", // ⬅️ INDISPENSABLE pour le POST
              },
              body: JSON.stringify({ nom: nomSearch, prenom: prenomSearch })
            }
          );
          if (res.status === 401 || res.status === 403) {
              setLoadingEtudiant(false); 
              
              // Redirection immédiate
              await fetch("/api/auth/logout", { method: "POST" })
              router.push(login);
              return; // ⬅️ Arrêter l'exécution de la fonction ici
          }
          
          if (!res.ok) {
              const errorData = await res.json().catch(() => ({})); // Tente de lire le JSON d'erreur
              // console.log("Erreur lors de la récupération des données :", errorData || res.statusText);
              const msg = errorData.message ||errorData.error|| `Erreur ${res.status} lors de la récupération des données`;
              alert(msg);
              setLoadingEtudiant(false);
              // throw new Error(errorData.message || "Erreur lors de la récupération");
              return;
          }
          
          
          const response = await res.json();
          const data = response.data.data;
          setIdentite(data.identite);
          setFormation(data.formation);
          setParcoursType(data.formation.formationType);
          
        } catch (err: unknown) {
          console.error("erreur de recuperation donne user",err)
          // setError(err.message);
        } finally {
          setLoadingEtudiant(false);
          
        }
      };
  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoadingInscription(true);
      setErrorInscription("");
      setSuccessMessageInscription("");
      const inscriptionData = {
        refAdmin: paiementData.refAdmin,
        dateAdmin: paiementData.dateAdmin,
        montantAdmin:paiementData.montantAdmin,
        refPedag: paiementData.refPedag,
        datePedag: paiementData.datePedag,
        montantPedag:paiementData.montantPedag,
        montantEcolage: paiementData.montantEcolage,
        refEcolage: paiementData.refEcolage,
        dateEcolage: paiementData.dateEcolage,
        idEtudiant: identite?.id,
        typeFormation: parcoursType,
        passant: paiementData.passant

      };
      


      try {
          const res = await fetch("/api/etudiants/inscription", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...paiementData}),
          });

          if (res.status === 401 || res.status === 403) {
              setErrorInscription("Session expirée ou droits insuffisants. Redirection vers la page de connexion...");
              setLoadingInscription(false); 
              await fetch("/api/auth/logout", { method: "POST" })
              // Redirection immédiate
              router.push(login); 
              return; // ⬅️ Arrêter l'exécution de la fonction ici
          }
        
          if (!res.ok) {
              const data = await res.json();
              // console.error(data)
              throw new Error(data.error || "Failed to create event");
          }
          
          const json = await res.json();
          if (json.error || json.status === 'error') { 
              throw new Error(json.error || json.message || "Erreur non spécifiée");
          }


          
          setSuccessMessageInscription("Inscription créé avec succès"); 
          
          setTimeout(() => {
              router.push('/utilisateur/dashboard');
              setLoadingInscription(false);
          }, 500); 

      } catch (err) {
          setErrorInscription(err instanceof Error ? err.message : "An error occurred");
          setLoadingInscription(false);
      }
  };

  return (
    <Card className="max-w-4xl mx-auto p-6">
      <div className="mb-8 p-4 bg-slate-50 border rounded-xl">
        <Label className="text-slate-600 font-bold mb-4 block italic">
          Rechercher un étudiant 
        </Label>
        <div className="grid md:grid-cols-5 gap-3 items-end">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="nom">Nom</Label>
            <Input 
              id="nom" 
              placeholder="Nom de l'étudiant" 
              value={nomSearch} 
              onChange={(e) => setNomSearch(e.target.value)}
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="prenom">Prénom</Label>
            <Input 
              id="prenom" 
              placeholder="Prénom de l'étudiant" 
              value={prenomSearch} 
              onChange={(e) => setPrenomSearch(e.target.value)}
            />
          </div>
          <Button 
            onClick={rechercheEtudiants} 
            disabled={loadingEtudiant}
            className="bg-blue-900 text-amber-400 hover:bg-blue-800 w-full"
          >
            {loadingEtudiant ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
            Rechercher
          </Button>
        </div>
      </div>
      {identite && formation ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={step} onValueChange={setStep}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="identite">1. Identité</TabsTrigger>
              <TabsTrigger value="academique">2. Académique</TabsTrigger>
              <TabsTrigger value="paiement">3. Bordereaux</TabsTrigger>
              <TabsTrigger value="documents">4. Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="identite" className="space-y-6 mt-6">
              <IdentiteDisplay 
                identite={identite} 
                onNext={() => setStep("academique")} 
              />
            </TabsContent>

            <TabsContent value="academique" className="space-y-6 mt-6">
              <FormationDisplay 
                data={formation} 
                onBack={() => setStep("identite")}
                onNext={() => setStep("paiement")}
              />
            </TabsContent>


            <TabsContent value="paiement" className="space-y-6 mt-6">
              <PaiementForm 
                formData={paiementData}
                updateData={updatePaiement}
                parcoursType={parcoursType} // Provient de l'étape précédente
                onBack={() => setStep("academique")}
                onNext={() => setStep("documents")}
              />
            </TabsContent>

            <TabsContent value="documents" className="space-y-6 mt-6">
              <DocumentsForm 
                validatedDocs={validatedDocs}
                onToggleDoc={toggleDoc}
                onBack={() => setStep("paiement")}
                onNext={() => setStep("documents")} // Peut être modifié pour une action finale
              />
            </TabsContent>
          </Tabs>
          <div className="flex gap-4 pt-6">
          <button
            type="submit"
            // Désactiver si loading (fetch en cours) OU si successMessage est actif (délai d'attente)
            disabled={loadingInscription || !!successMessageInscription} 
            className="flex-1 bg-accent text-accent-foreground py-3 rounded-lg transition-colors 
            disabled:bg-gray-400 disabled:text-gray-700 disabled:cursor-not-allowed"
          >
            {/* Texte affiché selon l'état */}
            {loadingInscription ? "Création en cours..." : successMessageInscription ? "Succès ✅" : "Créer l'inscription"}
          </button>
        </div>
        </form>
        
            ) : (
        /* Optionnel : Afficher un message d'attente ou vide */
        <div className="py-20 text-center border-2 border-dashed rounded-xl bg-slate-50/50">
          <p className="text-slate-500">
            Veuillez utiliser la barre de recherche ci-dessus pour charger un dossier étudiant.
          </p>
        </div>
      )}

    </Card>
  )
}
