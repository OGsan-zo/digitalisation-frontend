import { NextRequest } from "next/server";
import { callApiPost } from "@/lib/callApi";
export async function POST(request: NextRequest) {
   const required = ["nom", "prenom"];
     return callApiPost(request, "/etudiants/recherche", required);
}