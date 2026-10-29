import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PrioridadChip from "../../src/components/PrioridadChip";

describe("<PrioridadChip />", () => {
  // Qué se espera ver por cada prioridad válida: el NOMBRE del color escrito, su tooltip y su clase de color.
  // Los valores están escritos a mano a propósito: si alguien cambia config/prioridades.js, este test avisa.
  const prioridadesValidas = [
    { valor: "rojo", etiqueta: "Rojo", detalle: "Atención inmediata" },
    { valor: "amarillo", etiqueta: "Amarillo", detalle: "Prioridad intermedia" },
    { valor: "verde", etiqueta: "Verde", detalle: "Puede esperar" },
  ];

  prioridadesValidas.forEach(({ valor, etiqueta, detalle }) => {
    it(`muestra el chip de la prioridad "${valor}" con su texto, tooltip y clase de color`, () => {
      render(<PrioridadChip prioridad={valor} />);

      // Busca el elemento por el texto que ve el usuario (falla si no está o no coincide exacto)
      const chip = screen.getByText(etiqueta);

      expect(chip.tagName).toBe("SPAN");
      expect(chip).toBeVisible();
      expect(chip).toHaveClass("prioridad-chip", `prioridad-${valor}`);
      expect(chip).toHaveAttribute("title", detalle);
    });
  });

  it("renderiza un único chip por componente", () => {
    // container es el <div> donde RTL dibuja el componente (equivale al data-cy-root de Cypress)
    const { container } = render(<PrioridadChip prioridad="rojo" />);

    expect(container.children).toHaveLength(1);
  });

  // Valores que no son una prioridad conocida: el componente no debe dibujar nada (ni siquiera un span vacío)
  const prioridadesInvalidas = [
    { descripcion: "no se informa (undefined)", valor: undefined },
    { descripcion: "es null", valor: null },
    { descripcion: "es un texto vacío", valor: "" },
    { descripcion: 'no existe en la lista ("naranja")', valor: "naranja" },
  ];

  prioridadesInvalidas.forEach(({ descripcion, valor }) => {
    it(`no renderiza nada si la prioridad ${descripcion}`, () => {
      const { container } = render(<PrioridadChip prioridad={valor} />);

      expect(container.querySelector(".prioridad-chip")).toBeNull();
      expect(container).toBeEmptyDOMElement();
    });
  });
});
