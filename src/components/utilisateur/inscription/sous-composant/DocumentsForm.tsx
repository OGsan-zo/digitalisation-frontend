import React from 'react';
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Liste des documents à valider
const LISTE_DOCUMENTS = [
  { id: "photo", label: "Photo d'identité (x3)" },
  { id: "acte", label: "Extrait d'acte de naissance" },
  { id: "diplome", label: "Copie certifiée du diplôme" },
  { id: "cni", label: "Photocopie de la CNI / Passeport" },
  { id: "medical", label: "Certificat médical d'aptitude" },
];

interface DocumentsFormProps {
  // Un objet où la clé est l'ID du doc et la valeur est un boolean (ex: { photo: true })
  validatedDocs: Record<string, boolean>;
  onToggleDoc: (docId: string) => void;
  onBack: () => void;
  onNext: () => void;
}

const DocumentsForm: React.FC<DocumentsFormProps> = ({ 
  validatedDocs, 
  onToggleDoc, 
  onBack, 
  onNext 
}) => {
  return (
    <div className="space-y-6 mt-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Validation des Documents Physiques
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Cochez les documents qui ont été présentés physiquement et validés.
        </p>

        <div className="space-y-3">
          {LISTE_DOCUMENTS.map((doc) => {
            const isValidated = !!validatedDocs[doc.id];
            
            return (
              <div
                key={doc.id}
                onClick={() => onToggleDoc(doc.id)}
                className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${
                  isValidated 
                    ? "bg-emerald-50 border-emerald-200 shadow-sm" 
                    : "bg-white hover:border-slate-300 border-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Simulation visuelle de Checkbox / Statut */}
                  {isValidated ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-slate-200 bg-slate-50" />
                  )}
                  
                  <span className={`font-medium ${isValidated ? "text-emerald-900" : "text-slate-700"}`}>
                    {doc.label}
                  </span>
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant={isValidated ? "ghost" : "outline"}
                  className={isValidated ? "text-emerald-600 hover:bg-emerald-100" : "text-slate-500"}
                >
                  {isValidated ? "Validé" : "En attente"}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Précédent
        </Button>
        <Button onClick={onNext} className="bg-emerald-600 hover:bg-emerald-700">
          Suivant
        </Button>
      </div>
    </div>
  );
};

export default DocumentsForm;