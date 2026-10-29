// Agrega matchers como toHaveClass, toHaveAttribute, toBeVisible, toBeEmptyDOMElement
import "@testing-library/jest-dom/vitest";

import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Después de cada test, desmonta lo que se renderizó para que un test no ensucie al siguiente
afterEach(() => {
  cleanup();
});
