import { useState } from "react";

const ROLES = [
  {
    id: "paciente",
    label: "Paciente",
    description: "Reservá y gestioná tus turnos médicos",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="10" r="5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M6 27c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "medico",
    label: "Médico",
    description: "Administrá tu agenda y atendé pacientes",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="11" y="3" width="10" height="7" rx="2" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M7 10h18v14a4 4 0 01-4 4H11a4 4 0 01-4-4V10z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
        <path d="M13 18h6M16 15v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function LoginPage({ onGoToRegister }) {
  const [step, setStep] = useState("role"); // "role" | "login"
  const [selectedRole, setSelectedRole] = useState(null);
  const [hoveredRole, setHoveredRole] = useState(null);
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  function handleRoleSelect(roleId) {
    setSelectedRole(roleId);
    setTimeout(() => setStep("login"), 180);
  }

  function handleBack() {
    setStep("role");
    setSelectedRole(null);
    setError("");
    setForm({ email: "", password: "" });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) {
      setError("Completá todos los campos.");
      return;
    }
    setLoading(true);
    // Simulación — reemplazar con fetch real al backend
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    // TODO: redirigir según rol
    alert(`Login como ${selectedRole} con email: ${form.email}`);
  }

  const role = ROLES.find((r) => r.id === selectedRole);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .lp-root {
          min-height: 100vh;
          background: #f5f3ef;
          display: flex;
          font-family: 'DM Sans', sans-serif;
          color: #1a1916;
        }

        /* Panel izquierdo decorativo */
        .lp-side {
          width: 420px;
          flex-shrink: 0;
          background: #1a2e22;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px 44px;
          position: relative;
          overflow: hidden;
        }
        .lp-side::before {
          content: '';
          position: absolute;
          top: -80px; left: -80px;
          width: 340px; height: 340px;
          border-radius: 50%;
          background: rgba(255,255,255,0.04);
        }
        .lp-side::after {
          content: '';
          position: absolute;
          bottom: -60px; right: -60px;
          width: 260px; height: 260px;
          border-radius: 50%;
          background: rgba(255,255,255,0.04);
        }
        .lp-brand {
          position: relative; z-index: 1;
        }
        .lp-brand-cross {
          width: 40px; height: 40px;
          background: #4caf82;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px;
        }
        .lp-brand-cross svg { color: #fff; }
        .lp-brand-name {
          font-family: 'DM Serif Display', serif;
          font-size: 26px;
          color: #fff;
          letter-spacing: -0.5px;
          line-height: 1.1;
        }
        .lp-brand-name em {
          font-style: italic;
          color: #4caf82;
        }
        .lp-tagline {
          font-size: 13px;
          color: rgba(255,255,255,0.45);
          margin-top: 8px;
          letter-spacing: 0.02em;
        }
        .lp-side-quote {
          position: relative; z-index: 1;
        }
        .lp-side-quote p {
          font-family: 'DM Serif Display', serif;
          font-size: 22px;
          color: rgba(255,255,255,0.8);
          line-height: 1.45;
          font-style: italic;
        }
        .lp-side-quote span {
          display: block;
          margin-top: 16px;
          font-size: 12px;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        /* Panel derecho */
        .lp-main {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 32px;
        }
        .lp-card {
          width: 100%;
          max-width: 420px;
        }

        /* Step: selección de rol */
        .lp-step-title {
          font-family: 'DM Serif Display', serif;
          font-size: 32px;
          letter-spacing: -0.8px;
          line-height: 1.1;
          color: #1a1916;
          margin-bottom: 8px;
        }
        .lp-step-sub {
          font-size: 14px;
          color: #7a7870;
          margin-bottom: 36px;
        }

        .lp-roles {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .lp-role-btn {
          background: #fff;
          border: 1.5px solid #e8e5df;
          border-radius: 14px;
          padding: 22px 24px;
          display: flex;
          align-items: center;
          gap: 18px;
          cursor: pointer;
          transition: border-color 0.18s, box-shadow 0.18s, transform 0.14s;
          text-align: left;
          width: 100%;
        }
        .lp-role-btn:hover {
          border-color: #4caf82;
          box-shadow: 0 0 0 3px rgba(76,175,130,0.12);
          transform: translateY(-1px);
        }
        .lp-role-btn.selected {
          border-color: #4caf82;
          background: #f0faf5;
        }
        .lp-role-icon {
          width: 56px; height: 56px;
          border-radius: 12px;
          background: #f0faf5;
          display: flex; align-items: center; justify-content: center;
          color: #2a7a52;
          flex-shrink: 0;
          transition: background 0.18s;
        }
        .lp-role-btn:hover .lp-role-icon,
        .lp-role-btn.selected .lp-role-icon {
          background: #d6f0e4;
        }
        .lp-role-label {
          font-size: 17px;
          font-weight: 500;
          color: #1a1916;
          margin-bottom: 3px;
        }
        .lp-role-desc {
          font-size: 13px;
          color: #9a9890;
        }
        .lp-role-arrow {
          margin-left: auto;
          color: #c8c5be;
          transition: color 0.18s, transform 0.18s;
          flex-shrink: 0;
        }
        .lp-role-btn:hover .lp-role-arrow {
          color: #4caf82;
          transform: translateX(3px);
        }

        /* Step: login form */
        .lp-back {
          display: flex; align-items: center; gap: 6px;
          background: none; border: none;
          font-size: 13px; color: #7a7870;
          cursor: pointer; padding: 0; margin-bottom: 32px;
          transition: color 0.15s;
        }
        .lp-back:hover { color: #1a1916; }

        .lp-role-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: #f0faf5;
          border: 1px solid #c4e8d4;
          border-radius: 999px;
          padding: 6px 14px 6px 10px;
          font-size: 13px;
          color: #2a7a52;
          font-weight: 500;
          margin-bottom: 20px;
        }
        .lp-role-badge svg { color: #2a7a52; }

        .lp-form { display: flex; flex-direction: column; gap: 16px; }

        .lp-field { display: flex; flex-direction: column; gap: 6px; }
        .lp-label {
          font-size: 13px;
          font-weight: 500;
          color: #4a4840;
        }
        .lp-input-wrap { position: relative; }
        .lp-input {
          width: 100%;
          padding: 12px 16px;
          border: 1.5px solid #e8e5df;
          border-radius: 10px;
          font-size: 15px;
          font-family: 'DM Sans', sans-serif;
          color: #1a1916;
          background: #fff;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s;
          appearance: none;
        }
        .lp-input:focus {
          border-color: #4caf82;
          box-shadow: 0 0 0 3px rgba(76,175,130,0.12);
        }
        .lp-input::placeholder { color: #c0bdb6; }
        .lp-input.has-toggle { padding-right: 44px; }

        .lp-pass-toggle {
          position: absolute; right: 12px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: #9a9890; padding: 4px;
          display: flex; align-items: center;
          transition: color 0.15s;
        }
        .lp-pass-toggle:hover { color: #4a4840; }

        .lp-error {
          font-size: 13px;
          color: #c0392b;
          background: #fdf0ee;
          border: 1px solid #f5c6c0;
          border-radius: 8px;
          padding: 10px 14px;
        }

        .lp-submit {
          margin-top: 4px;
          background: #1a2e22;
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 14px;
          font-size: 15px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.18s, transform 0.12s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .lp-submit:hover:not(:disabled) { background: #2a4a34; }
        .lp-submit:active:not(:disabled) { transform: scale(0.98); }
        .lp-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .lp-spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .lp-divider {
          display: flex; align-items: center; gap: 12px;
          margin: 4px 0;
        }
        .lp-divider-line { flex: 1; height: 1px; background: #e8e5df; }
        .lp-divider-text { font-size: 12px; color: #b0ada6; }

        .lp-register {
          text-align: center;
          font-size: 13px;
          color: #7a7870;
        }
        .lp-register a {
          color: #2a7a52;
          font-weight: 500;
          text-decoration: none;
          cursor: pointer;
        }
        .lp-register a:hover { text-decoration: underline; }

        /* Animaciones de transición */
        .lp-fade-in {
          animation: fadeUp 0.28s ease both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Responsive */
        @media (max-width: 720px) {
          .lp-root { flex-direction: column; }
          .lp-side {
            width: 100%; padding: 32px 28px;
            min-height: auto;
          }
          .lp-side-quote { display: none; }
          .lp-main { padding: 36px 24px; }
        }
      `}</style>

      <div className="lp-root">
        {/* Panel izquierdo */}
        <div className="lp-side">
          <div className="lp-brand">
            <div className="lp-brand-cross">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <rect x="9" y="2" width="4" height="18" rx="2" fill="white"/>
                <rect x="2" y="9" width="18" height="4" rx="2" fill="white"/>
              </svg>
            </div>
            <div className="lp-brand-name">Centro<br/><em>Salud</em></div>
            <div className="lp-tagline">Sistema de gestión de turnos</div>
          </div>

          <div className="lp-side-quote">
            <p>"La salud no lo es todo, pero sin ella todo lo demás es nada."</p>
            <span>— Arthur Schopenhauer</span>
          </div>
        </div>

        {/* Panel derecho */}
        <div className="lp-main">
          <div className="lp-card">

            {step === "role" && (
              <div className="lp-fade-in">
                <h1 className="lp-step-title">Bienvenido/a</h1>
                <p className="lp-step-sub">¿Con qué perfil querés ingresar?</p>

                <div className="lp-roles">
                  {ROLES.map((r) => (
                    <button
                      key={r.id}
                      className={`lp-role-btn${selectedRole === r.id ? " selected" : ""}`}
                      onClick={() => handleRoleSelect(r.id)}
                    >
                      <div className="lp-role-icon">{r.icon}</div>
                      <div>
                        <div className="lp-role-label">{r.label}</div>
                        <div className="lp-role-desc">{r.description}</div>
                      </div>
                      <div className="lp-role-arrow">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                          <path d="M7 4l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === "login" && role && (
              <div className="lp-fade-in">
                <button className="lp-back" onClick={handleBack}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Volver
                </button>

                <div className="lp-role-badge">
                  {role.icon}
                  Ingresando como {role.label}
                </div>

                <h1 className="lp-step-title">Iniciá sesión</h1>
                <p className="lp-step-sub" style={{ marginBottom: 28 }}>
                  Ingresá tus credenciales para continuar
                </p>

                <form className="lp-form" onSubmit={handleSubmit}>
                  <div className="lp-field">
                    <label className="lp-label">Correo electrónico</label>
                    <div className="lp-input-wrap">
                      <input
                        className="lp-input"
                        type="email"
                        placeholder="tu@email.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="lp-field">
                    <label className="lp-label">Contraseña</label>
                    <div className="lp-input-wrap">
                      <input
                        className="lp-input has-toggle"
                        type={showPass ? "text" : "password"}
                        placeholder="••••••••"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                      />
                      <button
                        type="button"
                        className="lp-pass-toggle"
                        onClick={() => setShowPass(!showPass)}
                        tabIndex={-1}
                      >
                        {showPass ? (
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M2 9s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.5"/>
                            <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.5"/>
                            <path d="M3 3l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M2 9s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.5"/>
                            <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.5"/>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {error && <div className="lp-error">{error}</div>}

                  <button className="lp-submit" type="submit" disabled={loading}>
                    {loading ? (
                      <><div className="lp-spinner"/> Ingresando...</>
                    ) : (
                      <>Ingresar</>
                    )}
                  </button>

                  <div className="lp-divider">
                    <div className="lp-divider-line"/>
                    <span className="lp-divider-text">¿Sin cuenta?</span>
                    <div className="lp-divider-line"/>
                  </div>

                  <div className="lp-register">
                    <a onClick={onGoToRegister}>
                      Registrarse como {role.label}
                    </a>
                  </div>
                </form>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
