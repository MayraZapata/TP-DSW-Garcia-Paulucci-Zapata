/* global describe, it, beforeEach, cy */
describe("Flujo E2E: Reserva, validación de choque y cancelación de turnos (Paciente)", () => {
  // Generamos una fecha futura única para evitar que la prueba choque con turnos de días anteriores
  const diasAdelante = 10 + Math.floor(Math.random() * 50);
  const fechaFutura = new Date();
  fechaFutura.setDate(fechaFutura.getDate() + diasAdelante);
  const fechaStr = fechaFutura.toISOString().split("T")[0]; // Formato YYYY-MM-DD

  const horaPrimerTurno = "10:00";
  const horaSegundoTurno = "10:30";

  beforeEach(() => {
    // Asegurar resolución de pantalla estándar de escritorio
    cy.viewport(1280, 800);
  });

  it("Debe completar el ciclo de login, reserva, validación de choque, doble reserva, cancelación y logout", () => {
    // -----------------------------------------------------------------
    // 1. Iniciar sesión con un usuario de prueba (Paciente)
    // -----------------------------------------------------------------
    cy.visit("http://localhost:5173/login");

    cy.get('input[placeholder="Usuario"]').type("user1");
    cy.get('input[placeholder="Contraseña"]').type("uno111");
    cy.get('button[type="submit"]').contains("Ingresar").click();

    // Verificamos que redirija al menú principal y salude al paciente
    cy.url().should("include", "/menu");
    cy.contains("Bienvenido Juan Perez").should("be.visible");

    // -----------------------------------------------------------------
    // 2. Seleccionar médico, fecha y reservar primer turno (10:00 hs)
    // -----------------------------------------------------------------
    // Navegar a la pantalla de Solicitar Turnos
    cy.contains(".menu-card", "Solicitar Turnos").click();
    cy.url().should("include", "/turnos");
    cy.contains("h1", "Solicitar Turno Médico").should("be.visible");

    // Seleccionar Especialidad (Infectología, id: 1)
    cy.get("#idEspecialidad").select("1");

    // Esperar a que se habilite el select de médicos y elegir al Dr. Gregory House (matrícula: 1)
    cy.get("#matriculaMedico").should("not.be.disabled").select("1");

    // Ingresar fecha y hora
    cy.get("#fechaAtencion").type(fechaStr);
    cy.get("#horaAtencion").select(horaPrimerTurno);

    // Confirmar la reserva
    cy.get('button[type="submit"]').contains("Confirmar Reserva").click();

    // Validar mensaje de éxito
    cy.get(".mensaje-exito")
      .should("be.visible")
      .and("contain", "¡Turno reservado con éxito!");

    // -----------------------------------------------------------------
    // 3. Validación de choque: Intentar reservar el mismo turno
    // -----------------------------------------------------------------
    // Al tener éxito, el formulario se resetea. Volvemos a ingresar los mismos datos exactos:
    cy.get("#idEspecialidad").select("1");
    cy.get("#matriculaMedico").should("not.be.disabled").select("1");
    cy.get("#fechaAtencion").type(fechaStr);
    cy.get("#horaAtencion").select(horaPrimerTurno);

    cy.get('button[type="submit"]').contains("Confirmar Reserva").click();

    // Validar que el sistema rechace el turno duplicado
    cy.get(".mensaje-error")
      .should("be.visible")
      .and("contain", "El médico ya posee un turno reservado en ese horario");

    // -----------------------------------------------------------------
    // 4. Seleccionar otro horario libre (10:30 hs) y confirmar segundo turno
    // -----------------------------------------------------------------
    // Como la petición falló, los datos del médico y fecha se mantienen en pantalla
    cy.get("#horaAtencion").select(horaSegundoTurno);
    cy.get('button[type="submit"]').contains("Confirmar Reserva").click();

    // Validar éxito de la segunda reserva
    cy.get(".mensaje-exito")
      .should("be.visible")
      .and("contain", "¡Turno reservado con éxito!");

    // -----------------------------------------------------------------
    // 5. Ir a 'Mis Turnos' y verificar que ambos turnos estén listados
    // -----------------------------------------------------------------
    cy.get("button.volver").click({ force: true });
    cy.url().should("include", "/menu");

    cy.contains(".menu-card", "Mis Turnos").click();
    cy.url().should("include", "/turnos-paciente");
    cy.contains("h2", "Mis Turnos Reservados").should("be.visible");

    // Verificar fila del primer turno (10:00)
    cy.get("table tbody tr")
      .filter(`:contains("${fechaStr}")`)
      .filter(`:contains("${horaPrimerTurno}")`)
      .should("have.length.at.least", 1)
      .first()
      .within(() => {
        cy.contains("Dr/a. Gregory House").should("be.visible");
        cy.contains("PENDIENTE").should("be.visible");
      });

    // Verificar fila del segundo turno (10:30)
    cy.get("table tbody tr")
      .filter(`:contains("${fechaStr}")`)
      .filter(`:contains("${horaSegundoTurno}")`)
      .should("have.length.at.least", 1)
      .first()
      .within(() => {
        cy.contains("Dr/a. Gregory House").should("be.visible");
        cy.contains("PENDIENTE").should("be.visible");
      });

    // -----------------------------------------------------------------
    // 6. Cancelar uno de los dos turnos (el de las 10:00 hs)
    // -----------------------------------------------------------------
    // Interceptar y aceptar automáticamente el confirm nativo del navegador
    cy.window().then((win) => {
      cy.stub(win, "confirm").returns(true);
    });

    cy.get("table tbody tr")
      .filter(`:contains("${fechaStr}")`)
      .filter(`:contains("${horaPrimerTurno}")`)
      .first()
      .within(() => {
        cy.contains("button", "Cancelar").click();
      });

    cy.get("table tbody tr")
      .filter(`:contains("${fechaStr}")`)
      .filter(`:contains("${horaPrimerTurno}")`)
      .first()
      .within(() => {
        cy.contains("button", "Cancelar").click();
      });

    // Validar mensaje de cancelación exitosa
    cy.get(".mensaje-exito")
      .should("be.visible")
      .and("contain", "Turno cancelado con éxito");

    // Verificar que el estado del turno de las 10:00 cambió a CANCELADO y ya no muestra botón Cancelar
    cy.get("table tbody tr")
      .filter(`:contains("${fechaStr}")`)
      .filter(`:contains("${horaPrimerTurno}")`)
      .first()
      .within(() => {
        cy.contains("CANCELADO").should("be.visible");
        cy.contains("No disponible").should("be.visible");
      });

    // El turno de las 10:30 hs debe permanecer intacto y PENDIENTE
    cy.get("table tbody tr")
      .filter(`:contains("${fechaStr}")`)
      .filter(`:contains("${horaSegundoTurno}")`)
      .first()
      .within(() => {
        cy.contains("PENDIENTE").should("be.visible");
        cy.contains("button", "Cancelar").should("be.visible");
      });

    // -----------------------------------------------------------------
    // 7. Cerrar sesión
    // -----------------------------------------------------------------
    // Abrir menú de usuario en la barra de navegación
    cy.get('button[aria-label="Menú de usuario"]').click();
    cy.get(".nav-menu").should("be.visible");

    // Click en Cerrar sesión del menú desplegable
    cy.get(".nav-menu button").contains("Cerrar sesión").click();

    // Confirmar en el modal de salida
    cy.get(".modal").should("be.visible");
    cy.get(".modal button.btn-peligro").contains("Cerrar sesión").click();

    // Verificar redirección al Home y que ya no figure la sesión activa
    cy.url().should("include", "/login");
    cy.contains("h1", "Iniciar sesión").should("be.visible");
  });
});