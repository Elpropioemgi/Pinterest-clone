"use client";

import { Suspense } from "react";
import SearchComponent from "./SearchComponent";

export default function Page() {
  return (
    <Suspense fallback={<p>Cargando búsqueda...</p>}>
      <SearchComponent />
    </Suspense>
  );
}