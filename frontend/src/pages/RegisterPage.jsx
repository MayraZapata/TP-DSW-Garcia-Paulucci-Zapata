import { useState } from "react";

const OBRAS_SOCIALES = [
  "OSDE", "Swiss Medical", "Galeno", "IOMA", "PAMI", "Medicus",
  "Federada Salud", "Sancor Salud", "Luis Pasteur", "Esencial", "Otra",
];

const ESPECIALIDADES = [
  "Clínica Médica", "Pediatría", "Ginecología", "Cardiología",
  "Traumatología", "Dermatología", "Neurología", "Oftalmología",
  "Psiquiatría", "Otra",
];

const ROLES = [
  {
    id: "paciente",
    label: "Paciente",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="6" r="4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        <path d="M3 18c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "medico",
    label: "Médico",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="7" y="2" width="6" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M4 6h12v9a3 3 0 01-3 3H7a3 3 0 01-3-3V6z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
        <path d="M8 12h4M10 10v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
];

function validate(form, role) {
  const errors = {};
  if (!form.nombre.trim()) errors.nombre = "El nombre es obligatorio.";
  if (!form.apellido.trim()) errors.apellido = "El apellido es obligatorio.";
  if (!form.email.trim()) errors.email = "El email es obligatorio.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = "El email no es válido.";
  if (!form.password) errors.password = "La contraseña es obligatoria.";
  else if (form.password.length < 6)
    errors.password = "Mínimo 6 caracteres.";
  if (form.password !== form.confirmPassword)
    errors.confirmPassword = "Las contraseñas no coinciden.";

  if (role === "paciente") {
    if (!form.dni.trim()) errors.dni = "El DNI es obligatorio.";
    else if (!/^\d{7,8}$/.test(form.dni))
      errors.dni = "El DNI debe tener 7 u 8 dígitos numéricos.";
    if (!form.obraSocial) errors.obraSocial = "Seleccioná una obra social.";
    if (!form.nroAfiliado.trim()) errors.nroAfiliado = "El número de afiliado es obligatorio.";
  }

  if (role === "medico") {
    if (!form.matricula.trim()) errors.matricula = "La matrícula es obligatoria.";
    else if (!/^\d{6}$/.test(form.matricula))
      errors.matricula = "La matrícula debe tener exactamente 6 dígitos.";
    if (!form.especialidad) errors.especialidad = "Seleccioná una especialidad.";
  }

  return errors;
}

export default function RegisterPage({ onGoToLogin }) {
  const [role, setRole] = useState("paciente");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    nombre: "", apellido: "", email: "", password: "", confirmPassword: "",
    // paciente
    dni: "", obraSocial: "", nroAfiliado: "",
    // medico
    matricula: "", especialidad: "",
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((err) => ({ ...err, [name]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(form, role);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    // TODO: reemplazar con fetch real al backend POST /api/auth/register
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSuccess(true);
  }

  if (success) {
    return (
      <>
        <style>{baseStyles}</style>
        <div className="rp-root">
          <SidePanel />
          <div className="rp-main">
            <div className="rp-card rp-fade-in" style={{ textAlign: "center" }}>
              <div className="rp-success-icon">
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  <circle cx="18" cy="18" r="17" stroke="#4caf82" strokeWidth="1.8"/>
                  <path d="M11 18l5 5 9-9" stroke="#4caf82" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="rp-title" style={{ marginBottom: 8 }}>¡Registro exitoso!</h2>
              <p style={{ fontSize: 14, color: "#7a7870", marginBottom: 28 }}>
                Tu cuenta fue creada correctamente como <strong>{role}</strong>.
              </p>
              <button className="rp-submit" onClick={onGoToLogin} style={{ maxWidth: 200, margin: "0 auto" }}>
                Iniciar sesión
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{baseStyles}</style>
      <div className="rp-root">
        <SidePanel />
        <div className="rp-main">
          <div className="rp-card rp-fade-in">

            {/* Volver al login */}
            <button className="rp-back" onClick={onGoToLogin}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Ya tengo cuenta
            </button>

            <h1 className="rp-title">Crear cuenta</h1>
            <p className="rp-sub">Completá tus datos para registrarte</p>

            {/* Selector de rol */}
            <div className="rp-role-tabs">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  className={`rp-role-tab${role === r.id ? " active" : ""}`}
                  onClick={() => { setRole(r.id); setErrors({}); }}
                  type="button"
                >
                  {r.icon}
                  {r.label}
                </button>
              ))}
            </div>

            <form className="rp-form" onSubmit={handleSubmit} noValidate>

              {/* Datos comunes */}
              <div className="rp-row">
                <Field label="Nombre" error={errors.nombre}>
                  <input className={`rp-input${errors.nombre ? " rp-input-error" : ""}`}
                    name="nombre" placeholder="Ej: Mayra" value={form.nombre} onChange={handleChange}/>
                </Field>
                <Field label="Apellido" error={errors.apellido}>
                  <input className={`rp-input${errors.apellido ? " rp-input-error" : ""}`}
                    name="apellido" placeholder="Ej: Zapata" value={form.apellido} onChange={handleChange}/>
                </Field>
              </div>

              <Field label="Correo electrónico" error={errors.email}>
                <input className={`rp-input${errors.email ? " rp-input-error" : ""}`}
                  name="email" type="email" placeholder="tu@email.com" value={form.email} onChange={handleChange}/>
              </Field>

              <div className="rp-row">
                <Field label="Contraseña" error={errors.password}>
                  <div className="rp-input-wrap">
                    <input className={`rp-input has-toggle${errors.password ? " rp-input-error" : ""}`}
                      name="password" type={showPass ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres" value={form.password} onChange={handleChange}/>
                    <EyeToggle show={showPass} onClick={() => setShowPass(!showPass)}/>
                  </div>
                </Field>
                <Field label="Confirmar contraseña" error={errors.confirmPassword}>
                  <div className="rp-input-wrap">
                    <input className={`rp-input has-toggle${errors.confirmPassword ? " rp-input-error" : ""}`}
                      name="confirmPassword" type={showConfirm ? "text" : "password"}
                      placeholder="Repetí la contraseña" value={form.confirmPassword} onChange={handleChange}/>
                    <EyeToggle show={showConfirm} onClick={() => setShowConfirm(!showConfirm)}/>
                  </div>
                </Field>
              </div>

              {/* Campos de Paciente */}
              {role === "paciente" && (
                <div className="rp-fade-in">
                  <div className="rp-section-label">Datos del paciente</div>
                  <Field label="DNI" error={errors.dni}>
                    <input className={`rp-input${errors.dni ? " rp-input-error" : ""}`}
                      name="dni" placeholder="Ej: 44123456" maxLength={8}
                      value={form.dni}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setForm((f) => ({ ...f, dni: val }));
                        setErrors((err) => ({ ...err, dni: undefined }));
                      }}/>
                  </Field>
                  <div className="rp-row">
                    <Field label="Obra social" error={errors.obraSocial}>
                      <select className={`rp-input${errors.obraSocial ? " rp-input-error" : ""}`}
                        name="obraSocial" value={form.obraSocial} onChange={handleChange}>
                        <option value="">Seleccioná...</option>
                        {OBRAS_SOCIALES.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </Field>
                    <Field label="Número de afiliado" error={errors.nroAfiliado}>
                      <input className={`rp-input${errors.nroAfiliado ? " rp-input-error" : ""}`}
                        name="nroAfiliado" placeholder="Ej: 123456789"
                        value={form.nroAfiliado} onChange={handleChange}/>
                    </Field>
                  </div>
                </div>
              )}

              {/* Campos de Médico */}
              {role === "medico" && (
                <div className="rp-fade-in">
                  <div className="rp-section-label">Datos del médico</div>
                  <div className="rp-row">
                    <Field label="Matrícula provincial" error={errors.matricula}>
                      <input className={`rp-input${errors.matricula ? " rp-input-error" : ""}`}
                        name="matricula" placeholder="6 dígitos" maxLength={6}
                        value={form.matricula}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          setForm((f) => ({ ...f, matricula: val }));
                          setErrors((err) => ({ ...err, matricula: undefined }));
                        }}/>
                    </Field>
                    <Field label="Especialidad" error={errors.especialidad}>
                      <select className={`rp-input${errors.especialidad ? " rp-input-error" : ""}`}
                        name="especialidad" value={form.especialidad} onChange={handleChange}>
                        <option value="">Seleccioná...</option>
                        {ESPECIALIDADES.map((e) => <option key={e} value={e}>{e}</option>)}
                      </select>
                    </Field>
                  </div>
                </div>
              )}

              <button className="rp-submit" type="submit" disabled={loading}>
                {loading
                  ? <><div className="rp-spinner"/> Registrando...</>
                  : "Crear cuenta"}
              </button>

            </form>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Subcomponentes ── */

function Field({ label, error, children }) {
  return (
    <div className="rp-field">
      <label className="rp-label">{label}</label>
      {children}
      {error && <span className="rp-field-error">{error}</span>}
    </div>
  );
}

function EyeToggle({ show, onClick }) {
  return (
    <button type="button" className="rp-pass-toggle" onClick={onClick} tabIndex={-1}>
      {show ? (
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
  );
}

function SidePanel() {
  return (
    <div className="rp-side">
      <div className="rp-brand">
        <div className="rp-brand-cross">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect x="9" y="2" width="4" height="18" rx="2" fill="white"/>
            <rect x="2" y="9" width="18" height="4" rx="2" fill="white"/>
          </svg>
        </div>
        <div className="rp-brand-name">Centro<br/><em>Salud</em></div>
        <div className="rp-tagline">Sistema de gestión de turnos</div>
      </div>
      <div className="rp-side-quote">
        <p>"Cuidar la salud es un acto de responsabilidad con uno mismo y con los demás."</p>
        <span>— OMS</span>
      </div>
    </div>
  );
}

/* ── Estilos ── */
const baseStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .rp-root {
    min-height: 100vh;
    background: #f5f3ef;
    display: flex;
    font-family: 'DM Sans', sans-serif;
    color: #1a1916;
  }

  .rp-side {
    width: 380px; flex-shrink: 0;
    background: #1a2e22;
    display: flex; flex-direction: column;
    justify-content: space-between;
    padding: 48px 40px;
    position: relative; overflow: hidden;
  }
  .rp-side::before {
    content:''; position:absolute; top:-80px; left:-80px;
    width:300px; height:300px; border-radius:50%;
    background:rgba(255,255,255,0.04);
  }
  .rp-side::after {
    content:''; position:absolute; bottom:-60px; right:-60px;
    width:240px; height:240px; border-radius:50%;
    background:rgba(255,255,255,0.04);
  }
  .rp-brand { position:relative; z-index:1; }
  .rp-brand-cross {
    width:40px; height:40px; background:#4caf82; border-radius:8px;
    display:flex; align-items:center; justify-content:center; margin-bottom:20px;
  }
  .rp-brand-name {
    font-family:'DM Serif Display',serif; font-size:26px;
    color:#fff; letter-spacing:-0.5px; line-height:1.1;
  }
  .rp-brand-name em { font-style:italic; color:#4caf82; }
  .rp-tagline { font-size:13px; color:rgba(255,255,255,0.45); margin-top:8px; }
  .rp-side-quote { position:relative; z-index:1; }
  .rp-side-quote p {
    font-family:'DM Serif Display',serif; font-size:20px;
    color:rgba(255,255,255,0.75); line-height:1.5; font-style:italic;
  }
  .rp-side-quote span {
    display:block; margin-top:14px; font-size:12px;
    color:rgba(255,255,255,0.3); letter-spacing:0.05em; text-transform:uppercase;
  }

  .rp-main {
    flex:1; display:flex; align-items:flex-start;
    justify-content:center; padding: 48px 32px;
    overflow-y: auto;
  }
  .rp-card { width:100%; max-width:520px; padding-bottom: 32px; }

  .rp-back {
    display:flex; align-items:center; gap:6px;
    background:none; border:none; font-size:13px; color:#7a7870;
    cursor:pointer; padding:0; margin-bottom:28px; transition:color 0.15s;
    font-family:'DM Sans',sans-serif;
  }
  .rp-back:hover { color:#1a1916; }

  .rp-title {
    font-family:'DM Serif Display',serif; font-size:30px;
    letter-spacing:-0.6px; line-height:1.1; margin-bottom:6px;
  }
  .rp-sub { font-size:14px; color:#7a7870; margin-bottom:24px; }

  .rp-role-tabs {
    display:flex; gap:8px; margin-bottom:24px;
    background:#ede9e2; border-radius:10px; padding:4px;
  }
  .rp-role-tab {
    flex:1; display:flex; align-items:center; justify-content:center; gap:8px;
    padding:10px; border:none; border-radius:7px;
    font-family:'DM Sans',sans-serif; font-size:14px; font-weight:500;
    color:#7a7870; background:transparent; cursor:pointer;
    transition:all 0.18s;
  }
  .rp-role-tab.active {
    background:#fff; color:#1a2e22;
    box-shadow:0 1px 4px rgba(0,0,0,0.08);
  }
  .rp-role-tab:hover:not(.active) { color:#1a1916; }

  .rp-form { display:flex; flex-direction:column; gap:14px; }

  .rp-section-label {
    font-size:11px; font-weight:500; letter-spacing:0.08em;
    text-transform:uppercase; color:#b0ada6; margin-bottom:2px; margin-top:4px;
  }

  .rp-row { display:flex; gap:12px; }
  .rp-row > * { flex:1; min-width:0; }

  .rp-field { display:flex; flex-direction:column; gap:5px; }
  .rp-label { font-size:13px; font-weight:500; color:#4a4840; }

  .rp-input-wrap { position:relative; }
  .rp-input {
    width:100%; padding:11px 14px;
    border:1.5px solid #e8e5df; border-radius:9px;
    font-size:14px; font-family:'DM Sans',sans-serif;
    color:#1a1916; background:#fff; outline:none;
    transition:border-color 0.18s, box-shadow 0.18s;
    appearance:none;
  }
  .rp-input:focus { border-color:#4caf82; box-shadow:0 0 0 3px rgba(76,175,130,0.12); }
  .rp-input::placeholder { color:#c0bdb6; }
  .rp-input.has-toggle { padding-right:42px; }
  .rp-input.rp-input-error { border-color:#e74c3c; }
  .rp-input.rp-input-error:focus { box-shadow:0 0 0 3px rgba(231,76,60,0.12); }

  .rp-field-error { font-size:12px; color:#e74c3c; }

  .rp-pass-toggle {
    position:absolute; right:11px; top:50%; transform:translateY(-50%);
    background:none; border:none; cursor:pointer; color:#9a9890;
    padding:4px; display:flex; align-items:center; transition:color 0.15s;
  }
  .rp-pass-toggle:hover { color:#4a4840; }

  .rp-submit {
    margin-top:6px; background:#1a2e22; color:#fff; border:none;
    border-radius:10px; padding:13px; font-size:15px;
    font-family:'DM Sans',sans-serif; font-weight:500; cursor:pointer;
    transition:background 0.18s, transform 0.12s;
    display:flex; align-items:center; justify-content:center; gap:8px;
    width:100%;
  }
  .rp-submit:hover:not(:disabled) { background:#2a4a34; }
  .rp-submit:active:not(:disabled) { transform:scale(0.98); }
  .rp-submit:disabled { opacity:0.6; cursor:not-allowed; }

  .rp-spinner {
    width:17px; height:17px;
    border:2px solid rgba(255,255,255,0.3);
    border-top-color:#fff; border-radius:50%;
    animation:rpspin 0.7s linear infinite;
  }
  @keyframes rpspin { to { transform:rotate(360deg); } }

  .rp-success-icon {
    width:72px; height:72px; margin:0 auto 20px;
    background:#f0faf5; border-radius:50%;
    display:flex; align-items:center; justify-content:center;
  }

  .rp-fade-in { animation:rpfadeUp 0.22s ease both; }
  @keyframes rpfadeUp {
    from { opacity:0; transform:translateY(8px); }
    to   { opacity:1; transform:translateY(0); }
  }

  @media (max-width:720px) {
    .rp-root { flex-direction:column; }
    .rp-side { width:100%; padding:28px 24px; min-height:auto; }
    .rp-side-quote { display:none; }
    .rp-main { padding:28px 20px; }
    .rp-row { flex-direction:column; gap:14px; }
  }
`;
