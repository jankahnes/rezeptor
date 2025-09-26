export function alpha_vitaminA(row, T, M, D) {
  // 1) Fat‐mediated synergy (half‐max at ~3 g fat) :contentReference[oaicite:1]{index=1}
  const K_fat = 3.0;
  const f_fat = row.fat / (row.fat + K_fat);

  //    Fiber antagonism (half‐inhibition at ~10 g fiber)
  const K_fib = 10.0;
  const f_fiber = 1.0 / (1.0 + row.fiber / K_fib);

  // 2) Thermal losses: ~5% loss per intensity level
  const f_T = 1.0 - 0.05 * T;

  // 3) Heat medium factor
  const f_M_map = { None: 0.5, Wet: 0.8, Dry: 0.9, Fat: 1.0, Radiation: 0.9 };
  const f_M = f_M_map[M] || 1.0;

  // 4) Mechanical disruption factor
  const f_D_map = { 0: 0.9, 1: 1.0, 2: 1.1 };
  const f_D = f_D_map[D] || 1.0;

  // Combine
  const P = f_fat * f_fiber * f_T * f_M * f_D;

  // Normalize to average-case (P_avg ≈ 0.29) and cap at 2
  const alpha = Math.min(2.0, P / 0.29);

  return alpha;
}

export function alpha_vitaminB1(row, T, M, D) {
  // 1) Synergy/antagonism factors
  const fiber = row.fiber;
  const S = 1 / (1 + 0.005 * fiber);

  // 2) Thermal intensity
  const f_T = 1 - 0.15 * T;

  // 3) Heat medium
  const fM_map = {
    None: 1.0,
    Wet: 0.9,
    Dry: 0.95,
    Fat: 1.0,
    Radiation: 0.85,
  };
  const f_M = fM_map[M] || 1.0;

  // 4) Mechanical disruption
  const f_D = 1 - 0.02 * D;

  // Combine and clamp between 0 and 2 (but realistically <1.2)
  const alpha = S * f_T * f_M * f_D;
  return Math.min(2.0, Math.max(0.0, alpha));
}

export function alpha_vitaminB2(row, T, M, D) {
  // Thermal factor: linear loss ~10% per intensity level
  const f_T = Math.max(0.0, 1 - 0.1 * T);

  // Medium factor: water leaches most riboflavin
  const f_M_values = {
    None: 1.0,
    Wet: 0.8,
    Dry: 0.9,
    Fat: 0.95,
    Radiation: 0.9,
  };
  const f_M = f_M_values[M] || 1.0;

  // Mechanical factor: increased surface → more loss
  const f_D_values = { 0: 1.0, 1: 0.95, 2: 0.9 };
  const f_D = f_D_values[D] || 1.0;

  return f_T * f_M * f_D;
}

export function alpha_vitaminB3(row, T, M, D) {
  function saturate(x, max_val) {
    return (max_val * x) / (x + 1e-6 + max_val);
  }

  let alpha = 1.0;

  const tryp = row.tryptophan_mg;
  const b3 = row.niacin_b3_mg;
  alpha += 0.3 * saturate(tryp / (b3 + 0.1), 1.0);
  alpha *= 1 - 0.15 * saturate(row.fiber / 10, 1.0);

  // 2. Thermal Intensity
  if (T == 1) {
    alpha += 0.1;
  } else if (T == 2) {
    alpha += 0.2;
  } else if (T == 3) {
    alpha += 0.1;
  }

  // 3. Heat Medium
  if (M == 'Wet') {
    alpha += 0.1;
  } else if (M == 'Dry') {
    alpha -= 0.05;
  } else if (M == 'Fat') {
    alpha -= 0.05;
  } else if (M == 'Radiation') {
    alpha -= 0.1;
  }

  // 4. Mechanical Disruption
  if (D == 1) {
    alpha += 0.05;
  } else if (D == 2) {
    alpha += 0.15;
  }

  // Clamp final alpha to [0, 2]
  return Math.max(0.0, Math.min(2.0, alpha));
}

export function alpha_vitaminB6(row, T, M, D) {
  // 1. Base bioavailability β
  const p = 0.75; // assumed plant‐fraction
  const beta = p * 0.75 + (1 - p) * 1.0; // 75% vs 100% bioavail

  // 2. Synergy/antagonism S
  const Prot = Math.min(row.protein, 20); // g/100g
  const Fib = Math.min(row.fiber, 20); // g/100g
  const S_prot = 1 + 0.005 * Prot; // +0.5% per g protein
  const S_fib = 1 - 0.01 * Fib; // −1% per g fiber
  const S = S_prot * S_fib;

  // 3. Thermal intensity factor f_T
  const f_T = { 0: 1.0, 1: 0.95, 2: 0.85, 3: 0.7 }[T];

  // 4. Heat medium factor f_M
  const f_M = {
    None: 1.0,
    Wet: 0.87,
    Dry: 0.95,
    Fat: 0.9,
    Radiation: 0.75,
  }[M];

  // 5. Mechanical disruption f_D
  const f_D = { 0: 1.0, 1: 0.97, 2: 0.95 }[D];

  // Composite alpha, clamped to [0,2]
  const alpha = beta * S * f_T * f_M * f_D;
  return Math.max(0.0, Math.min(alpha, 2.0));
}

export function alpha_vitaminB9(row, T, M, D) {
  // Thermal intensity factor
  const f_T = { 0: 1.0, 1: 0.9, 2: 0.8, 3: 0.6 }[T];

  // Heat‐medium factor
  const f_M = {
    None: 1.0,
    Wet: 0.7,
    Dry: 0.9,
    Fat: 0.85,
    Radiation: 0.8,
  }[M];

  // Disruption factor
  const f_D = { 0: 1.0, 1: 1.05, 2: 1.1 }[D];

  // Combined alpha
  return f_T * f_M * f_D;
}

export function alpha_vitaminB12(row, T, M, D) {
  // 1. Baseline
  let alpha = 1.0;

  // 2. Thermal retention via exponential decay
  // sourced to: 15% loss at ~100°C (20 min) and 30–40% loss microwaving
  const k = 0.2;
  alpha *= Math.exp(-k * T);

  // 3. Heat medium factors
  const medium_factors = {
    None: 1.0,
    Wet: 0.9,
    Dry: 1.0,
    Fat: 1.0,
    Radiation: 0.95,
  };
  alpha *= medium_factors[M] || 1.0;

  // 4. Mechanical disruption factors
  const disruption_factors = {
    0: 0.9,
    1: 1.0,
    2: 1.1,
  };
  alpha *= disruption_factors[D] || 1.0;

  return Math.max(0.0, Math.min(alpha, 2.0));
}

export function alpha_vitaminC(row, T, M, D) {
  const Fe = row.iron_mg;
  const Cu = row.copper_mg;
  const f_met = Math.exp(-0.02 * Fe - 0.02 * Cu);

  const heat_table = {
    None: [1.0, 1.0, 1.0, 1.0],
    Wet: [1.0, 0.9, 0.7, 0.4],
    Dry: [1.0, 0.95, 0.9, 0.8],
    Fat: [1.0, 0.98, 0.96, 0.9],
    Radiation: [1.0, 0.97, 0.95, 0.93],
  };
  const f_heat = heat_table[M][T] || heat_table[None][T];

  const f_mech = { 0: 1.0, 1: 0.95, 2: 0.9 }[D] || 1.0;

  const alpha = f_met * f_heat * f_mech;
  return Math.max(0, Math.min(alpha, 2));
}

export function alpha_vitaminD(row, T, M, D) {
  // Fat-dependent absorption enhancement (saturating)
  const fat = row.fat;
  const f_fat = 1 + (0.5 * fat) / (fat + 10);

  // Fiber-dependent antagonism
  const fiber = row.fiber;
  const f_fiber = 1 / (1 + fiber / 20);

  // Thermal retention
  const f_T_map = { 0: 1.0, 1: 0.98, 2: 0.7, 3: 0.35 };
  const f_T = f_T_map[T] || 1.0;

  // Heat-medium effect
  const f_M_map = { None: 1.0, Wet: 1.0, Fat: 1.0, Dry: 0.9, Radiation: 0.95 };
  const f_M = f_M_map[M] || 1.0;

  // Mechanical surface-area oxidation
  const f_D = Math.max(0, 1 - 0.02 * D);

  const alpha = f_fat * f_fiber * f_T * f_M * f_D;
  // Clamp to [0,2]
  return Math.min(Math.max(alpha, 0), 2);
}

export function alpha_vitaminE(row, T, M, D) {
  // Base
  let alpha = 1.0;

  // 1. Lipid synergy (saturating Michaelis-Menten)
  const F = row.fat;
  const K_F = 10.0;
  const S = 1 + F / (F + K_F);
  alpha *= S;

  // 2. Fiber antagonism
  const fiber = row.fiber;
  const K_A = 10.0;
  const A = 1 / (1 + fiber / K_A);
  alpha *= A;

  // 3. Thermal intensity
  const H_dict = { 0: 1.0, 1: 0.98, 2: 0.95, 3: 0.9 };
  alpha *= H_dict[T] || 1.0;

  // 4. Heat medium
  const M_dict = { None: 1.0, Wet: 0.98, Dry: 0.95, Fat: 1.0, Radiation: 0.97 };
  alpha *= M_dict[M] || 1.0;

  // 5. Mechanical disruption
  const D_dict = { 0: 1.0, 1: 1.02, 2: 1.05 };
  alpha *= D_dict[D] || 1.0;

  // Cap into [0, 2] just in case of edge cases
  return Math.max(0.0, Math.min(alpha, 2.0));
}

export function alpha_vitaminK(row, T, M, D) {
  // 1. Saturating fat & fiber effects
  const fat = row.fat;
  const fib = row.fiber;
  const fat_sat = fat / (fat + 5.0); // 5 g half‑saturation for fat :contentReference[oaicite:3]{index=3}
  const fib_sat = fib / (fib + 5.0); // 5 g half‑saturation for fiber :contentReference[oaicite:4]{index=4}
  const S = 1 + 0.5 * fat_sat - 0.3 * fib_sat;

  // 2. Thermal effect
  const alpha_T = 1.0 - 0.02 * T; // 2% drop per intensity step

  // 3. Medium effect
  const M_map = {
    None: 1.0,
    Wet: 0.95,
    Dry: 1.0,
    Fat: 1.1,
    Radiation: 1.0,
  };
  const alpha_M = M_map[M] || 1.0;

  // 4. Mechanical effect
  const D_map = { 0: 1.0, 1: 1.02, 2: 1.05 };
  const alpha_D = D_map[D] || 1.0;

  // Combine
  let alpha = S * alpha_T * alpha_M * alpha_D;

  // Constrain to [0, 2]
  if (alpha < 0.0) {
    alpha = 0.0;
  } else if (alpha > 2.0) {
    alpha = 2.0;
  }

  return alpha;
}

export function alpha_iron(row, T, M, D) {
  // 1. Heme vs non‑heme
  const h = row.heme_frac || 0.1;
  const f_h_raw = h * 5 + (1 - h) * 1;
  const f_h = f_h_raw / 1.4; // normalize to avg. 10% heme

  // 2. Vitamin C synergy (MM kinetics)
  const C = row.vitamin_c_mg;
  const a = 1.5;
  const b = 50;
  const f_C = 1 + (a * C) / (C + b);

  // 3. Phytate antagonism via fiber proxy
  const F = row.fiber;
  const P_mg = 50 * F; // approximate mg phytate
  const k = 0.002;
  const f_P = 1 / (1 + k * P_mg);

  // 4. Thermal intensity
  const f_T = 1 + 0.05 * T;

  // 5. Heat medium
  let f_M = 1;
  if (M == 'Wet') {
    f_M += 0.05;
  } else if (M == 'Dry') {
    f_M += 0.02;
  } else if (M == 'Fat') {
    f_M += 0.03;
  } else if (M == 'Radiation') {
    f_M -= 0.05;
  }
  // 6. Mechanical disruption
  const f_D = 1 + 0.05 * D;

  // Total alpha
  const alpha = f_h * f_C * f_P * f_T * f_M * f_D;
  return alpha;
}

export function alpha_magnesium(row, T, M, D) {
  // Mg bioavailability modifier alpha (≈0–2).
  // row: dict with 'Fiber', 'Calcium', 'Vitamin D' (mg/g).
  const fiber = row.fiber;
  const Ca = row.calcium_mg;
  const VD = row.vitamin_d_ug;

  // Fiber as proxy for phytate (max 20% reduction)
  const c_fiber = 0.2;
  const K_fiber = 10.0;
  const f_fiber = 1 - c_fiber * (fiber / (fiber + K_fiber));

  // Calcium antagonism (max 10%)
  const b_Ca = 0.1;
  const K_Ca = 200.0;
  const f_Ca = 1 - b_Ca * (Ca / (Ca + K_Ca));

  // Vitamin D synergy (max +15%)
  const a_VD = 0.15;
  const K_VD = 0.01;
  const f_VD = 1 + a_VD * (VD / (VD + K_VD));

  const alpha_synergy = f_fiber * f_Ca * f_VD;

  // Mechanical disruption
  let alpha_D = 1.0;
  if (D == 2) {
    alpha_D = 1.05;
  } else if (D == 1) {
    alpha_D = 1.02;
  }

  const alpha = alpha_synergy * alpha_D;
  return Math.max(0.0, Math.min(alpha, 2.0));
}

export function alpha_zinc(row, T, M, D) {
  // 1. Synergy/Antagonism: protein
  const k_p = 0.01;
  const prot = row.protein;
  const S_prot = 1 + k_p * prot;

  // 1. Synergy/Antagonism: phytate via fiber
  const k_f = 0.02;
  const fib = row.fiber;
  const S_phyt = 1.0 / (1 + k_f * fib);

  const S = S_prot * S_phyt;

  // 2–3. Thermal & medium: exponential leaching model
  // Minerals are heat-stable but leach; constants from retention studies :contentReference[oaicite:3]{index=3}
  const k_vals = {
    Wet: 0.05,
    Dry: 0.01,
    Fat: 0.02,
    Radiation: 0.03,
    None: 0.0,
  };
  const k = k_vals[M] || 0.0;
  const R = Math.exp(-k * T);

  // 4. Mechanical disruption: increased accessibility
  const k_d = 0.05;
  const D_mech = 1 + k_d * D;

  // Combine and clamp
  const alpha = S * R * D_mech;
  return Math.max(0.0, Math.min(alpha, 2.0));
}

export function alpha_calcium(row, T, M, D) {
  // 1. Synergy/antagonism
  const vitd = row.vitamin_d_ug;
  const prot = row.protein;
  const fib = row.fiber;
  const poly = row.polyphenols;
  let f_syn =
    1.0 +
    0.1 * Math.min(vitd / 15.0, 1.0) + // Vitamin D effect
    0.05 * Math.min(prot / 20.0, 1.0) - // Protein effect
    0.2 * (fib / (fib + 5.0)) - // Fiber (phytate) antagonism
    0.1 * poly; // Polyphenol antagonism
  // avoid extreme multipliers
  f_syn = Math.max(0.5, Math.min(f_syn, 1.5));

  // 3. Heat medium leaching
  const f_M = M == 'Wet' ? 0.95 : 1.0;

  // 4. Mechanical disruption
  const f_D = D == 2 ? 1.05 : 1.0;

  // final alpha, clipped to [0,2]
  const alpha = f_syn * f_M * f_D;
  return Math.max(0.0, Math.min(alpha, 2.0));
}

export function alpha_potassium(row, T, M, D) {
  // Thermal intensity factor
  const fT_map = { 0: 1.0, 1: 0.98, 2: 0.9, 3: 0.8 };
  const f_T = fT_map[T] || 1.0;

  // Heat medium factor
  const fM_map = {
    None: 1.0,
    Wet: 0.85,
    Dry: 1.0,
    Fat: 1.0,
    Radiation: 0.95,
  };
  const f_M = fM_map[M] || 1.0;

  // Mechanical disruption factor
  const fD_map = { 0: 1.0, 1: 0.95, 2: 0.9 };
  const f_D = fD_map[D] || 1.0;

  // Overall modifier
  return f_T * f_M * f_D;
}

export function alpha_selenium(row, T, M, D) {
  // 1) Fiber antagonism (~0.5% loss per g fiber)
  const S = 1 - 0.005 * row.fiber;

  // 2) Thermal stability (only very high dry heat causes slight loss)
  const T_factor = { 0: 1.0, 1: 1.0, 2: 1.0, 3: 0.98 }[T] || 1.0;

  // 3) Leaching by medium
  const M_factor =
    {
      None: 1.0,
      Wet: 0.95,
      Dry: 0.98,
      Fat: 0.98,
      Radiation: 1.0,
    }[M] || 1.0;

  // 4) Mechanical release boost
  const D_factor = { 0: 1.0, 1: 1.0, 2: 1.05 }[D] || 1.0;

  const alpha = Math.max(0.0, S) * T_factor * M_factor * D_factor;

  // ensure within [0,2]
  return Math.min(Math.max(alpha, 0.0), 2.0);
}

export function alpha_iodine(row, T, M, D) {
  // 1. Thermal factor
  const T_eff = { 0: 1.0, 1: 0.95, 2: 0.9, 3: 0.8 }[T] || 1.0;

  // 2. Medium factor
  const M_eff =
    {
      None: 1.0,
      Wet: 0.6,
      Dry: 0.9,
      Fat: 0.9,
      Radiation: 0.73,
    }[M] || 1.0;

  // 3a. Selenium synergy (up to +20% at RDA = 55 μg)
  const Se = row.selenium_ug;
  const f_Se = 1 + 0.2 * Math.min(Se / 55, 1);

  // 3b. Goitrogenic antagonism (glucosinolates inhibiting uptake)
  const G = row.glucosinolates;
  const f_G = 1 / (1 + G / 100);

  const S = f_Se * f_G;

  // 4. Composite alpha, clamped [0,2]
  const alpha = T_eff * M_eff * S;
  return Math.max(0, Math.min(alpha, 2));
}

export function alpha_copper(row, T, M, D) {
  // 1. Protein enhancement (max +20% at high protein; Kp≈10 g)
  const P = row.protein;
  const Kp = 10.0;
  const f_prot = 1 + 0.2 * (P / (P + Kp));

  // 2. Vit C enhancement (max +10% at high Vit C; Kc≈50 mg)
  const C = row.vitamin_c_mg;
  const Kc = 50.0;
  const f_vitC = 1 + 0.1 * (C / (C + Kc));

  // 3. Zn competition (half-max at Zn≈15 mg; competitive inhibition)
  const Z = row.zinc_mg;
  const Kz = 15.0;
  const f_zinc = 1 / (1 + Z / Kz);

  // 4. Fiber binding (max –10% at high fiber; Kf≈5 g)
  const F = row.fiber;
  const Kf = 5.0;
  const f_fib = 1 - 0.1 * (F / (F + Kf));

  // 5. Mechanical disruption (≈+5% per level)
  const f_mech = 1 + 0.05 * D;

  // Combine multiplicatively
  const alpha = f_prot * f_vitC * f_zinc * f_fib * f_mech;

  // Clamp to [0, 2]
  return Math.max(0.0, Math.min(2.0, alpha));
}

export function alpha_manganese(row, T, M, D) {
  // Compute manganese bioavailability modifier alpha for a food (per 100g).
  // row: dict with at least 'Fe' (mg) and 'Fiber' (g)
  // T: thermal intensity (0–3)
  // M: heat medium, one of "None","Wet","Dry","Fat","Radiation"
  // D: mechanical disruption (0–2)
  // 1. Synergy/antagonism: iron competition & phytate proxy (fiber)
  const Fe = row.iron_mg;
  const fiber = row.fiber;
  const S_Fe = 1.0 / (1.0 + 0.05 * Fe);
  const S_fib = Math.exp(-0.02 * fiber);
  const S = S_Fe * S_fib;

  // 2. Thermal retention
  //    T=0→1.0, 1→0.9, 2→0.8, 3→0.7
  const f_T = Math.max(0.0, 1.0 - 0.1 * T);

  // 3. Medium retention
  const medium_factors = {
    None: 1.0,
    Wet: 0.85,
    Dry: 0.95,
    Fat: 0.9,
    Radiation: 0.9,
  };
  const f_M = medium_factors[M] || 1.0;

  // 4. Mechanical disruption
  //    D=0→1.0,1→1.05,2→1.10
  const f_D = 1.0 + 0.05 * D;

  // Final alpha
  const alpha = 1.0 * S * f_T * f_M * f_D;
  return Math.max(0.0, Math.min(alpha, 2.0));
}

export function alpha_omega3(row, T, M, D) {
  // 1. Synergy: fat matrix
  const fat = row.fat;
  const alpha_fat = 1 + 0.2 * (fat / 30 / (1 + Math.abs(fat / 30))); // tanh ≈ x/(1+|x|)
  // 1b. Antioxidant protection
  const vitE = row.vitamin_e_mg_alpha_te;
  const alpha_AO = 1 + 0.1 * (vitE / 20 / (1 + Math.abs(vitE / 20)));
  const alpha_syn = alpha_fat * alpha_AO;

  // 2–3. Thermal/medium lookup
  const tm_table = {
    0: { None: 1.0, Wet: 1.0, Dry: 1.0, Fat: 1.0, Radiation: 1.0 },
    1: { None: 1.0, Wet: 1.0, Dry: 0.98, Fat: 0.95, Radiation: 0.97 },
    2: { None: 1.0, Wet: 1.0, Dry: 0.93, Fat: 0.9, Radiation: 0.94 },
    3: { None: 1.0, Wet: 0.95, Dry: 0.85, Fat: 0.7, Radiation: 0.9 },
  };
  const alpha_TM = tm_table[T][M] || 1.0;

  // 4. Mechanical
  const alpha_D = 1 + 0.05 * D;

  // Combine all factors
  const alpha = alpha_syn * alpha_TM * alpha_D;

  // Bound between 0 and 2
  return Math.max(0, Math.min(alpha, 2.0));
}

export function alpha_omega6(row, T, M, D) {
  // 1) Synergy with total fat (baseline: 10 g → α₁=1)
  const ft = row.fat;
  const alpha1 = (ft / 10) ** 0.5;

  // 2) Thermal retention α₂
  const thermal_map = { 0: 1.0, 1: 0.98, 2: 0.95, 3: 0.9 };
  const alpha2 = thermal_map[T] || 1.0;

  // 3) Medium retention α₃
  const medium_map = {
    None: 1.0,
    Wet: 0.99,
    Dry: 0.95,
    Fat: 0.9,
    Radiation: 0.85,
  };
  const alpha3 = medium_map[M] || 1.0;

  // 4) Mechanical disruption α₄: small boost per level
  const alpha4 = 1 + 0.02 * D;

  // Combine all
  const alpha = alpha1 * alpha2 * alpha3 * alpha4;

  // Clamp to [0, 2]
  return Math.max(0.0, Math.min(alpha, 2.0));
}

export function alpha_MUFA(row, T, M, D) {
  // 1. Fat synergy
  const Fat = row.fat;
  const a = 0.5;
  const K = 10.0;
  const f_fat = 1 + (a * Fat) / (K + Fat);

  // 2. Fiber antagonism
  const Fiber = row.fiber;
  const b = 0.1;
  const f_fiber = 1.0 / (1.0 + b * Fiber);

  // 3. Thermal factor
  const f_T_map = { 0: 1.0, 1: 1.05, 2: 1.02, 3: 0.9 };
  const f_T = f_T_map[T] || 1.0;

  // 4. Heat medium
  const f_M_map = { None: 1.0, Wet: 1.0, Dry: 1.0, Fat: 1.1, Radiation: 0.95 };
  const f_M = f_M_map[M] || 1.0;

  // 5. Mechanical disruption
  const f_D_map = { 0: 1.0, 1: 1.02, 2: 1.05 };
  const f_D = f_D_map[D] || 1.0;

  // Combine and clip
  const alpha = 1.0 * f_fat * f_fiber * f_T * f_M * f_D;
  // ensure between 0 and 2
  return Math.max(0.0, Math.min(2.0, alpha));
}

export function alpha_EAAs_except_Lysine(row, T, M, D) {
  // Estimate bioavailability (absorption) modifier α for all EAAs except Lysine.
  // Includes digestibility, cooking losses, matrix effects.
  // 1. Digestibility baseline by food type
  let digestibility = 1.0;
  if (row.vegan) {
    digestibility = 0.75;
  } else if (row.vegetarian) {
    digestibility = 0.85;
  }
  // 2. Antagonism by phytic acid (proxied by fiber content)
  const fiber = row.fiber;
  const S = 1 - 0.1 * (fiber / 10); // max drop ~10%

  // 3. Thermal retention factor
  const fT_map = { 0: 1.0, 1: 0.98, 2: 0.95, 3: 0.9 };
  const fT = fT_map[T] || 1.0;

  // 4. Heat medium factor
  const fM_map = {
    None: 1.0,
    Wet: 1.02,
    Dry: 0.97,
    Fat: 1.0,
    Radiation: 0.95,
  };
  const fM = fM_map[M] || 1.0;

  // 5. Mechanical disruption factor
  const fD_map = { 0: 1.0, 1: 1.02, 2: 1.05 };
  const fD = fD_map[D] || 1.0;

  // Final α calculation (absorption-based availability)
  const alpha = digestibility * S * fT * fM * fD;
  return Math.max(0.0, Math.min(alpha, 2.0));
}

export function alpha_lysine(row, T, M, D) {
  const F_therm = Math.exp(-0.05 * T);
  const F_med_map = {
    None: 1.0,
    Wet: 1.0,
    Dry: 0.9,
    Fat: 0.85,
    Radiation: 1.0,
  };
  const F_med = F_med_map[M] || 1.0;

  const F_mech = 1 + 0.05 * D;
  const alpha = F_therm * F_med * F_mech;
  return Math.max(0.0, Math.min(alpha, 2.0));
}

export function alpha_choline(row, T, M, D) {
  // 1. Synergy/antagonism: fiber
  const fiber = row.fiber;
  const S = Math.exp(-fiber / 50);

  // 2. Thermal intensity
  const f_T_map = { 0: 1.0, 1: 0.95, 2: 0.9, 3: 0.85 };
  const f_T = f_T_map[T] || 1.0;

  // 3. Heat medium
  const f_M = M == 'Wet' ? 0.9 : M == 'Radiation' ? 0.95 : 1.0;

  // 4. Mechanical disruption
  const f_D_map = { 0: 1.0, 1: 1.05, 2: 1.1 };
  const f_D = f_D_map[D] || 1.0;

  // Combine all
  const alpha = 1 * S * f_T * f_M * f_D;

  // Clamp into [0,2]
  return Math.max(0, Math.min(2, alpha));
}

export function alpha_polyphenols(row, T, M, D) {
  // 1. Synergy terms
  const a1 = 0.5,
    a2 = 0.2; // sugar, fiber coefficients
  const sugar_frac = row.sugar / 100.0;
  const fiber_frac = row.fiber / 100.0;
  const S = a1 * sugar_frac;
  const F = a2 * fiber_frac;

  // 2. Thermal decay
  const k = 0.3;
  const alpha_T = Math.exp(-k * T);

  // 3. Heat medium multiplier
  const M_factors = {
    None: 1.0,
    Wet: 0.95,
    Dry: 0.75,
    Fat: 0.65,
    Radiation: 0.9,
  };
  const alpha_M = M_factors[M] || 1.0;

  // 4. Mechanical disruption
  const D_term = { 0: 0.0, 1: 0.1, 2: 0.2 }[D] || 0.0;

  // Combine all factors
  const alpha = (1 + S + F) * alpha_T * alpha_M * (1 + D_term);

  // Clip to [0.0, 2.0]
  return Math.max(0.0, Math.min(2.0, alpha));
}

export function alpha_glucosinolates(row, T, M, D) {
  // retention lookup for (T,M)
  const f = {
    None: [1.0, 1.0, 1.0, 1.0],
    Wet: [1.0, 0.9, 0.7, 0.5],
    Dry: [1.0, 0.95, 0.7, 0.5],
    Fat: [1.0, 0.95, 0.8, 0.7],
    Radiation: [1.0, 0.9, 0.85, 0.8],
  };
  // mechanical disruption factor
  const mech = { 0: 0.8, 1: 1.0, 2: 1.1 };
  // lookup f(T,M), default to 1 if unknown
  const f_tm = f[M][T];
  // combine
  return f_tm * mech[D] || 1.0;
}

export function alpha_carotenoids(row, T, M, D) {
  // 1. Synergy: fat saturation
  const fat = row.fat;
  const F_half = 5.0;
  const S_fat = 1 + 0.5 * (fat / (fat + F_half));

  // 1. Antagonism: fiber binding
  const fiber = row.fiber;
  const S_fib = 1 / (1 + 0.1 * fiber);

  // Combined synergy factor
  const S = S_fat * S_fib;

  // 2. Thermal intensity factor
  const gT_map = { 0: 1.0, 1: 1.1, 2: 1.2, 3: 0.9 };
  const gT = gT_map[T] || 1.0;

  // 3. Heat medium factor
  const mM_map = {
    None: 1.0,
    Wet: 1.05,
    Dry: 1.0,
    Fat: 1.1,
    Radiation: 1.0,
  };
  const mM = mM_map[M] || 1.0;

  // 4. Mechanical disruption factor
  const dD_map = { 0: 1.0, 1: 1.05, 2: 1.1 };
  const dD = dD_map[D] || 1.0;

  // Total alpha
  const alpha = S * gT * mM * dD;

  // Clamp to [0, 2]
  return Math.max(0.0, Math.min(alpha, 2.0));
}
