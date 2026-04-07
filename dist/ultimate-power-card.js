/**
 * Ultimate Power Card
 * A custom Lovelace card for Home Assistant
 * Displays voltage, power, and current per phase (1 or 3 phase)
 *
 * Version: 1.4.0  –  Power <1kW in W, >=1kW in kW met komma
 */

/* ============================================================
   EDITOR
   ============================================================ */
class UltimatePowerCardEditor extends HTMLElement {
  constructor() {
    super();
    this._config = {};
    this._hass = null;
    this._rendered = false;
    this.attachShadow({ mode: "open" });
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._rendered) {
      this._buildDOM();
    } else {
      this.shadowRoot.querySelectorAll("ha-entity-picker").forEach((p) => (p.hass = hass));
    }
  }

  setConfig(config) {
    this._config = { ...config };
    if (this._rendered) this._updateValues();
  }

  _val(key, fallback) {
    return this._config[key] !== undefined ? this._config[key] : (fallback !== undefined ? fallback : "");
  }

  _buildDOM() {
    if (!this._hass) return;
    const phases = this._val("phases", 3);

    this.shadowRoot.innerHTML = `
      <style>
        :host { display:block; }
        .row { display:flex; flex-direction:column; gap:6px; margin-bottom:16px; }
        label { font-size:13px; font-weight:500; color:var(--primary-text-color); }
        ha-entity-picker { display:block; width:100%; }
        .mode-select {
          display:block; width:100%; padding:10px 12px;
          background: var(--card-background-color, #1c1c1c);
          color: var(--primary-text-color, #fff);
          border:1px solid var(--divider-color, #444);
          border-radius:8px; font-size:14px;
          font-family: var(--primary-font-family, sans-serif);
          cursor:pointer; outline:none;
          -webkit-appearance:none; appearance:none;
        }
        .phase-group {
          padding:12px; margin-bottom:8px;
          border:1px solid var(--divider-color, #333);
          border-radius:10px;
          background: var(--card-background-color, #1c1c1c);
        }
        .phase-group .row { margin-bottom:10px; }
        .phase-group .row:last-child { margin-bottom:0; }
        .phase-label { font-size:13px; font-weight:700; color:var(--primary-text-color); margin-bottom:8px; }
      </style>

      <div class="row">
        <label>Aantal fasen</label>
        <select id="phases" class="mode-select">
          <option value="1">1 fase</option>
          <option value="3">3 fasen</option>
        </select>
      </div>
      <div id="phaseGroups"></div>
    `;

    const phaseSelect = this.shadowRoot.getElementById("phases");
    phaseSelect.value = String(phases);
    phaseSelect.addEventListener("change", () => {
      this._config = { ...this._config, phases: parseInt(phaseSelect.value) };
      this._fireChanged();
      this._renderPhaseGroups();
    });

    this._rendered = true;
    this._renderPhaseGroups();
  }

  _renderPhaseGroups() {
    const container = this.shadowRoot.getElementById("phaseGroups");
    const count = this._val("phases", 3) === 1 ? 1 : 3;
    container.innerHTML = "";

    for (let i = 1; i <= count; i++) {
      const group = document.createElement("div");
      group.className = "phase-group";
      group.innerHTML = `
        <div class="phase-label">Fase ${i}</div>
        <div class="row"><label>Spanning (V)</label><ha-entity-picker id="voltage_l${i}" allow-custom-entity></ha-entity-picker></div>
        <div class="row"><label>Vermogen (W/kW)</label><ha-entity-picker id="power_l${i}" allow-custom-entity></ha-entity-picker></div>
        <div class="row"><label>Stroom (A)</label><ha-entity-picker id="current_l${i}" allow-custom-entity></ha-entity-picker></div>
      `;
      container.appendChild(group);

      ["voltage", "power", "current"].forEach((type) => {
        const key = `${type}_l${i}`;
        const picker = group.querySelector(`#${key}`);
        picker.hass = this._hass;
        picker.value = this._val(key);
        picker.includeDomains = ["sensor"];
        picker.addEventListener("value-changed", (ev) => {
          if (ev.detail.value !== this._val(key)) {
            this._config = { ...this._config, [key]: ev.detail.value };
            this._fireChanged();
          }
        });
      });
    }
  }

  _updateValues() {
    const phaseSelect = this.shadowRoot.getElementById("phases");
    if (phaseSelect) phaseSelect.value = String(this._val("phases", 3));
    this._renderPhaseGroups();
  }

  _fireChanged() {
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    }));
  }
}
customElements.define("ultimate-power-card-editor", UltimatePowerCardEditor);

/* ============================================================
   MAIN CARD
   ============================================================ */
class UltimatePowerCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._hass = null;
  }

  static getConfigElement() {
    return document.createElement("ultimate-power-card-editor");
  }

  static getStubConfig() {
    return {
      phases: 3,
      voltage_l1: "", power_l1: "", current_l1: "",
      voltage_l2: "", power_l2: "", current_l2: "",
      voltage_l3: "", power_l3: "", current_l3: "",
    };
  }

  setConfig(config) {
    this._config = { phases: 3, ...config };
    this._buildStructure();
    if (this._hass) this._update();
  }

  set hass(hass) {
    this._hass = hass;
    this._update();
  }

  getCardSize() {
    return this._config.phases === 1 ? 1 : 2;
  }

  _buildStructure() {
    const count = this._config.phases === 1 ? 1 : 3;

    let rowsHTML = "";
    for (let i = 1; i <= count; i++) {
      const border = i < count ? " rb" : "";
      rowsHTML += `
        <div class="row${border}" id="phase-${i}">
          <span class="pn">Fase ${i}</span>

          <div class="meas">
            <ha-icon icon="mdi:sine-wave" class="vi"></ha-icon>
            <span class="vt" id="volt-${i}">-- V</span>
          </div>

          <div class="meas">
            <ha-icon icon="mdi:flash" class="vi"></ha-icon>
            <span class="vt" id="power-${i}">--</span>
          </div>

          <div class="meas">
            <ha-icon icon="mdi:current-ac" class="vi"></ha-icon>
            <span class="vt" id="amp-${i}">-- A</span>
          </div>
        </div>
      `;
    }

    this.shadowRoot.innerHTML = `
      <div class="fc">
        ${rowsHTML}
      </div>
      ${this._styles()}
    `;
  }

  _styles() {
    return `<style>
      :host { display:block; }

      .fc {
        border-radius: 28px;
        background: none;
        overflow: hidden;
        backdrop-filter: blur(3px) saturate(120%);
        -webkit-backdrop-filter: blur(3px) saturate(120%);
        box-shadow:
          inset 0 1px 2px rgba(255,255,255,.35),
          inset 0 2px 4px rgba(0,0,0,.15),
          0 2px 6px rgba(0,0,0,.45);
        padding: 4px 0;
        font-family: var(--primary-font-family, sans-serif);
      }

      .row {
        display: grid;
        grid-template-columns: 62px 1fr 1fr 1fr;
        align-items: center;
        padding: 14px 20px;
        gap: 0 8px;
      }

      .rb {
        border-bottom: 1px solid rgba(255,255,255,0.08);
      }

      .pn {
        font-size: 14px;
        font-weight: 700;
        color: rgba(255,255,255,0.92);
      }

      .meas {
        display: flex;
        align-items: center;
        gap: 5px;
      }

      .vi {
        --mdc-icon-size: 18px;
        color: rgba(255,255,255,0.38);
        flex-shrink: 0;
      }

      .vt {
        font-size: 14px;
        font-weight: 600;
        color: rgba(255,255,255,0.85);
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
      }
    </style>`;
  }

  _update() {
    if (!this._hass) return;
    const count = this._config.phases === 1 ? 1 : 3;

    for (let i = 1; i <= count; i++) {

      /* Voltage */
      const voltEl = this.shadowRoot.getElementById(`volt-${i}`);
      if (voltEl) {
        const v = this._getVal(`voltage_l${i}`);
        voltEl.textContent = v !== null ? `${Math.round(v)} V` : "-- V";
      }

      /* Power — sensor in kW, <1kW tonen als W, >=1kW als kW met komma */
      const powerEl = this.shadowRoot.getElementById(`power-${i}`);
      if (powerEl) {
        const entityId = this._config[`power_l${i}`];
        const state = this._hass.states[entityId];
        if (state) {
          const w = parseFloat(state.state);
          if (!isNaN(w)) {
            if (Math.abs(w) < 1) {
              // Onder 1 kW → toon in W afgerond
              powerEl.textContent = `${Math.round(w * 1000)} W`;
            } else {
              // 1 kW of meer → toon in kW met komma
              powerEl.textContent = `${w.toFixed(2).replace('.', ',')} kW`;
            }
          } else {
            powerEl.textContent = "--";
          }
        } else {
          powerEl.textContent = "--";
        }
      }

      /* Current */
      const ampEl = this.shadowRoot.getElementById(`amp-${i}`);
      if (ampEl) {
        const a = this._getVal(`current_l${i}`);
        ampEl.textContent = a !== null ? `${a.toFixed(2)} A` : "-- A";
      }
    }
  }

  _getVal(key) {
    const entityId = this._config[key];
    if (!entityId || !this._hass.states[entityId]) return null;
    const v = parseFloat(this._hass.states[entityId].state);
    return isNaN(v) ? null : v;
  }
}

customElements.define("ultimate-power-card", UltimatePowerCard);

/* ============================================================
   REGISTER WITH HA
   ============================================================ */
window.customCards = window.customCards || [];
window.customCards.push({
  type: "ultimate-power-card",
  name: "Ultimate Power Card",
  description: "Een stijlvolle energiekaart die spanning, vermogen en stroom per fase toont (1 of 3 fasen).",
  preview: true,
  documentationURL: "https://github.com/Sven2410/ultimate-power-card",
});

console.info(
  "%c ULTIMATE-POWER-CARD %c v1.4.0 ",
  "color:#fff;background:#FF9800;font-weight:bold;padding:2px 6px;border-radius:4px 0 0 4px;",
  "color:#FF9800;background:#f0f0f0;font-weight:bold;padding:2px 6px;border-radius:0 4px 4px 0;"
);
