export default class ScoreCalculator {
  kcal;
  protein;
  carbohydrates;
  fat;
  saturated_fat;
  sugar;
  fiber;
  salt;
  price;
  iron_mg;
  magnesium_mg;
  zinc_mg;
  calcium_mg;
  potassium_mg;
  selenium_ug;
  iodine_ug;
  copper_mg;
  manganese_mg;
  vitamin_a_ug_rae;
  vitamin_c_mg;
  vitamin_d_ug;
  vitamin_e_mg_alpha_te;
  vitamin_k_ug;
  thiamine_b1_mg;
  riboflavin_b2_mg;
  niacin_b3_mg;
  vitamin_b6_mg;
  folate_ug_dfe;
  vitamin_b12_ug;
  trans_fats_mg;
  mufas_total_mg;
  polyphenols_total_mg;
  choline_mg;
  omega6_total_mg;
  omega3_total_mg;
  histidine_mg;
  isoleucine_mg;
  leucine_mg;
  lysine_mg;
  methionine_mg;
  phenylalanine_mg;
  tyrosine_mg;
  threonine_mg;
  tryptophan_mg;
  valine_mg;
  cysteine_mg;

  constructor(recipe, total_weight) {
    this.name = recipe.title;
    this.kcal = recipe.kcal / (total_weight / 100);
    this.protein = recipe.protein / (total_weight / 100);
    this.carbohydrates = recipe.carbohydrates / (total_weight / 100);
    this.fat = recipe.fat / (total_weight / 100);
    this.saturated_fat = recipe.saturated_fat / (total_weight / 100);
    this.sugar = recipe.sugar / (total_weight / 100);
    this.fiber = recipe.fiber / (total_weight / 100);
    this.salt = recipe.salt / (total_weight / 100);
    this.price = recipe.price / (total_weight / 100);
    this.iron_mg = recipe.iron_mg / (total_weight / 100);
    this.magnesium_mg = recipe.magnesium_mg / (total_weight / 100);
    this.zinc_mg = recipe.zinc_mg / (total_weight / 100);
    this.calcium_mg = recipe.calcium_mg / (total_weight / 100);
    this.potassium_mg = recipe.potassium_mg / (total_weight / 100);
    this.selenium_ug = recipe.selenium_ug / (total_weight / 100);
    this.iodine_ug = recipe.iodine_ug / (total_weight / 100);
    this.copper_mg = recipe.copper_mg / (total_weight / 100);
    this.manganese_mg = recipe.manganese_mg / (total_weight / 100);
    this.vitamin_a_ug_rae = recipe.vitamin_a_ug_rae / (total_weight / 100);
    this.vitamin_c_mg = recipe.vitamin_c_mg / (total_weight / 100);
    this.vitamin_d_ug = recipe.vitamin_d_ug / (total_weight / 100);
    this.vitamin_e_mg_alpha_te =
      recipe.vitamin_e_mg_alpha_te / (total_weight / 100);
    this.vitamin_k_ug = recipe.vitamin_k_ug / (total_weight / 100);
    this.thiamine_b1_mg = recipe.thiamine_b1_mg / (total_weight / 100);
    this.riboflavin_b2_mg = recipe.riboflavin_b2_mg / (total_weight / 100);
    this.niacin_b3_mg = recipe.niacin_b3_mg / (total_weight / 100);
    this.vitamin_b6_mg = recipe.vitamin_b6_mg / (total_weight / 100);
    this.folate_ug_dfe = recipe.folate_ug_dfe / (total_weight / 100);
    this.vitamin_b12_ug = recipe.vitamin_b12_ug / (total_weight / 100);
    this.trans_fats_mg = recipe.trans_fats_mg / (total_weight / 100);
    this.mufas_total_mg = recipe.mufas_total_mg / (total_weight / 100);
    this.choline_mg = recipe.choline_mg / (total_weight / 100);
    this.omega6_total_mg = recipe.omega6_total_mg / (total_weight / 100);
    this.omega3_total_mg = recipe.omega3_total_mg / (total_weight / 100);
    this.processing_level = recipe.processing_level;
    this.polyphenols = recipe.polyphenols / (total_weight / 100);
    this.glucosinolates = recipe.glucosinolates / (total_weight / 100);
    this.carotenoids = recipe.carotenoids / (total_weight / 100);
    this.histidine_mg = recipe.histidine_mg / (total_weight / 100);
    this.isoleucine_mg = recipe.isoleucine_mg / (total_weight / 100);
    this.leucine_mg = recipe.leucine_mg / (total_weight / 100);
    this.lysine_mg = recipe.lysine_mg / (total_weight / 100);
    this.methionine_mg = recipe.methionine_mg / (total_weight / 100);
    this.phenylalanine_mg = recipe.phenylalanine_mg / (total_weight / 100);
    this.threonine_mg = recipe.threonine_mg / (total_weight / 100);
    this.tryptophan_mg = recipe.tryptophan_mg / (total_weight / 100);
    this.valine_mg = recipe.valine_mg / (total_weight / 100);
    this.cysteine_mg = recipe.cysteine_mg / (total_weight / 100);
    this.tyrosine_mg = recipe.tyrosine_mg / (total_weight / 100);
  }

  micronutrient_weights = [
    { name: 'iron_mg', weight: 1.5, rda: 8.0 },
    { name: 'magnesium_mg', weight: 1.2, rda: 400.0 },
    { name: 'zinc_mg', weight: 1.0, rda: 10.0 },
    { name: 'calcium_mg', weight: 1.0, rda: 1000.0 },
    { name: 'potassium_mg', weight: 1.3, rda: 4700.0 },
    { name: 'selenium_ug', weight: 0.5, rda: 55 },
    { name: 'iodine_ug', weight: 0.7, rda: 150 },
    { name: 'copper_mg', weight: 0.3, rda: 0.9 },
    { name: 'manganese_mg', weight: 0.2, rda: 2.3 },
    { name: 'vitamin_a_ug_rae', weight: 0.8, rda: 900 },
    { name: 'vitamin_c_mg', weight: 1.0, rda: 80.0 },
    { name: 'vitamin_d_ug', weight: 1.5, rda: 15 },
    { name: 'vitamin_e_mg_alpha_te', weight: 0.6, rda: 15.0 },
    { name: 'vitamin_k_ug', weight: 0.4, rda: 100 },
    { name: 'thiamine_b1_mg', weight: 0.5, rda: 1.2 },
    { name: 'riboflavin_b2_mg', weight: 0.4, rda: 1.1 },
    { name: 'niacin_b3_mg', weight: 0.5, rda: 15.0 },
    { name: 'vitamin_b6_mg', weight: 0.6, rda: 1.3 },
    { name: 'folate_ug_dfe', weight: 1.2, rda: 400 },
    { name: 'vitamin_b12_ug', weight: 1.4, rda: 2.4 },
  ];

  scale_by_points(value, points) {
    if (value <= points[0][0]) {
      return points[0][1];
    }
    if (value >= points[points.length - 1][0]) {
      return points[points.length - 1][1];
    }
    for (let i = 0; i < points.length - 1; i++) {
      const x1 = points[i][0];
      const y1 = points[i][1];
      const x2 = points[i + 1][0];
      const y2 = points[i + 1][1];
      if (x1 <= value && value <= x2) {
        return y1 + ((value - x1) * (y2 - y1)) / (x2 - x1);
      }
    }
    return 0;
  }

  getMNIDX() {
    let score = 0;
    for (const nutrient of this.micronutrient_weights) {
      const name = nutrient['name'];
      const weight = nutrient['weight'];
      const rda = nutrient['rda'];
      const value = this[name] || 0;
      score += weight * Math.min(2, Math.log(value / rda + 1));
    }
    return this.scale_by_points(score * 10, [
      [0, 0],
      [12, 35],
      [20, 68],
      [40, 100],
      [90, 150],
    ]);
  }
  curve(x) {
    if (x > 1) {
      return 0;
    } else {
      return 0.2 * Math.exp(-5 * x);
    }
  }

  async getSIDX() {
    let processing_level_factor = 1.4;
    if (this.processing_level < 2) {
      processing_level_factor = 0.8;
    }
    const water = Math.max(
      0,
      100 -
        (this.protein +
          this.fat +
          this.carbohydrates +
          this.fiber +
          processing_level_factor)
    );
    const liquid_keywords = [
      'juice',
      'liquid',
      'broth',
      'soda',
      'smoothie',
      'drink',
      'tea',
      'coffee',
      'milk',
      'water',
      'cola',
      'beer',
      'wine',
      'cocktail',
    ];

    const is_liquid_whole_word = (name) => {
      const words = name.toLowerCase().split();
      const words_cleaned = words.map((word) => word.replace(/[^\w\s]/g, ''));
      return liquid_keywords.some((kw) => words_cleaned.includes(kw));
    };

    let waterE = water;
    if (is_liquid_whole_word(this.name)) {
      waterE = water * 0.1;
    } else if (this.processing_level < 2) {
      waterE = water;
    } else if (this.kcal > 10 && water / this.kcal > 5) {
      waterE = water * 0.9;
    } else {
      const sigmoid =
        1 /
        (1 +
          Math.exp(
            -2 *
              (this.carbohydrates -
                this.sugar +
                this.fiber +
                0.2929598406929533 * this.protein -
                1.054166862782954)
          ));
      waterE = water * sigmoid;
    }
    const starch_grams = Math.max(
      0,
      this.carbohydrates - this.sugar - this.fiber
    );
    const giProxy =
      (1.2693123441054426 * this.sugar + starch_grams) / this.carbohydrates;
    let ff = 0;
    if (this.kcal == 0) {
      ff = 0;
    } else {
      ff = Math.min(
        5,
        Math.max(
          0.5,
          41.7 / this.kcal ** 0.7 +
            0.05 * this.protein +
            0.000617 * this.fiber ** 3 -
            0.00000725 * this.fat ** 3 +
            0.617
        )
      );
    }
    const body = {
      ff: ff,
      giProxy: giProxy,
      waterE: waterE,
      kcal: this.kcal,
    };
    const prediction = await predictSatiety(body);

    return this.scale_by_points(prediction, [
      [10, 0],
      [40, 50],
      [50, 72],
      [60, 80],
      [93, 100],
    ]);
  }

  getFiberScore() {
    return this.scale_by_points(this.fiber, [
      [0, 0],
      [3.5, 50],
      [5, 70],
      [8, 90],
      [10, 100],
    ]);
  }

  getSaltScore() {
    return Math.min(
      100,
      this.scale_by_points(this.salt, [
        [0, 100],
        [0.15, 80],
        [0.5, 65],
        [1, 20],
        [2, 0],
        [20, -100],
      ])
    );
  }

  getSugarScore() {
    const points = [
      [0, 100],
      [1, 85],
      [4, 50],
      [6, 30],
      [20, 0],
      [100, -200],
    ];
    const base = this.scale_by_points(this.sugar, points);
    const SCALE = 15.0;
    let decay = 1;
    if (this.sugar >= 0) {
      decay = Math.exp(-this.sugar / SCALE);
    }

    let adjustment = 0.0;
    if (this.processing_level < 2) {
      adjustment = 20 * decay;
    } else {
      adjustment = -25 * (1 - decay);
    }
    return Math.min(100, base + adjustment);
  }

  getFatProfileScore() {
    if (this.fat == 0) {
      return 50;
    }
    const fat_mg = this.fat * 1000;
    const ratio = this.saturated_fat / this.fat;
    const sfat_score = Math.max(
      0,
      Math.min(100, (100 * (0.5 - ratio)) / (0.5 - 0.05))
    );
    const o3_score = this.scale_by_points(this.omega3_total_mg / fat_mg, [
      [0.0, 35],
      [0.01, 50],
      [0.03, 70],
      [0.1, 85],
      [0.25, 100],
    ]);

    const o6_score = this.scale_by_points(this.omega6_total_mg / fat_mg, [
      [0.0, 30],
      [0.1, 70],
      [0.2, 90],
      [0.35, 100],
    ]);

    const mufa_score = this.scale_by_points(this.mufas_total_mg / fat_mg, [
      [0.0, 0],
      [0.1, 30],
      [0.25, 60],
      [0.4, 80],
      [0.65, 100],
    ]);

    const o_ratio_score = this.scale_by_points(
      this.omega3_total_mg / (this.omega6_total_mg + 1e-10),
      [
        [0.005, 10],
        [0.02, 25],
        [0.06, 50],
        [0.1, 70],
        [0.2, 80],
        [0.3, 90],
        [0.4, 100],
      ]
    );
    let total =
      0.35 * sfat_score +
      0.35 * mufa_score +
      0.3 * o3_score +
      0.08 * o6_score +
      0.25 * o_ratio_score;
    if (this.trans_fats_mg > 10) {
      total -= this.scale_by_points(this.trans_fats_mg, [
        [10, 3],
        [200, 10],
        [1000, 30],
        [3000, 50],
      ]);
    }
    const totalScore = this.scale_by_points(total, [
      [35, 0],
      [90, 100],
    ]);
    const weight =
      (1 - Math.exp(-0.2 * this.fat)) / (1 + Math.exp(-this.fat + 3));
    const counterWeight = 1 - weight;
    const compoundScore = counterWeight * 50 + weight * totalScore;
    return Math.max(0, Math.min(100, compoundScore));
  }

  getED() {
    return this.scale_by_points(this.kcal, [
      [0, 100],
      [50, 90],
      [150, 70],
      [200, 50],
      [350, 30],
      [550, 0],
    ]);
  }

  getProtectiveCompoundScore() {
    return (
      (0.5 * this.polyphenols +
        0.3 * this.carotenoids +
        0.2 * this.glucosinolates) *
      15
    );
  }

  getProteinQuantityScore() {
    const ratio_score = this.scale_by_points(
      (this.protein * 4) / (this.kcal + 1e-6),
      [
        [0, 0],
        [0.05, 20],
        [0.2, 60],
        [0.4, 80],
        [0.7, 110],
        [1, 180],
      ]
    );

    const total_score = this.scale_by_points(this.protein, [
      [0, 0],
      [1, 10],
      [6, 50],
      [10, 70],
      [25, 90],
      [100, 200],
    ]);
    return 0.6 * ratio_score + 0.5 * total_score;
  }

  getProteinQualityScore() {
    if (this.protein <= 0) {
      return 0;
    }

    const ref = {
      Histidine: 15,
      Isoleucine: 30,
      Leucine: 59,
      Lysine: 45,
      SAA: 22,
      AAA: 38,
      Threonine: 23,
      Tryptophan: 6,
      Valine: 39,
    };
    const actual = {
      Histidine: this.histidine_mg / this.protein,
      Isoleucine: this.isoleucine_mg / this.protein,
      Leucine: this.leucine_mg / this.protein,
      Lysine: this.lysine_mg / this.protein,
      SAA: (this.methionine_mg + this.cysteine_mg) / this.protein,
      AAA: (this.phenylalanine_mg + this.tyrosine_mg) / this.protein,
      Threonine: this.threonine_mg / this.protein,
      Tryptophan: this.tryptophan_mg / this.protein,
      Valine: this.valine_mg / this.protein,
    };

    const ratios = Object.keys(ref).map((aa) =>
      Math.min(actual[aa] / ref[aa], 1.0)
    );
    const limiting = Math.min(...ratios);
    return Math.round(limiting * 100);
  }

  getProteinScoreOvr() {
    const quality = this.getProteinQualityScore();
    const quantity = this.getProteinQuantityScore();
    const ovr = ((quality * quantity) / 100) * 1.1;
    return ovr;
  }

  getHIDX(
    sidx,
    ed,
    protein,
    fiber,
    sugar,
    fat_profile,
    salt,
    mnidx,
    pl,
    protective_compound_score
  ) {
    const hidx =
      (11 / 50) * (0.7 * sidx + 0.3 * ed) + //proxy for overeating/obesity risk
      (8 / 50) * fiber + //direct positive impact
      (7 / 50) * pl + //processing level, proxy for additives or unwanted processing side effects.
      // https://link.springer.com/article/10.1186/s13643-025-02800-8
      // 10% increase in UPF -> 10% risk of all-cause mortality
      (7 / 50) * fat_profile + //direct impact, mixed based on fatty acid profile
      (7 / 50) * mnidx + //direct positive impact
      (7 / 50) * protein + //direct positive impact
      (7 / 50) * sugar + //direct negative impact
      // https://www.mdpi.com/2072-6643/13/8/2636
      // 1 extra soda -> 10% risk of all-cause mortality
      (7 / 50) * salt + //direct negative impact
      //https://www.nejm.org/doi/full/10.1056/NEJMoa1311889?utm_source=chatgpt.com
      // J-shaped curve, >7g / day -> +25% all-cause mortality
      (5 / 50) * protective_compound_score; //direct positive impact

    const MIN = 30;
    const MAX = 102;
    const scaled = ((hidx - MIN) * 100) / (MAX - MIN);
    return scaled;
  }

  async calculate() {
    const ed = this.getED();
    const sidx = await this.getSIDX();
    const mnidx = this.getMNIDX();
    const fiber_score = this.getFiberScore();
    const protein_score = this.getProteinScoreOvr();
    const salt_score = this.getSaltScore();
    const sugar_score = this.getSugarScore();
    const fat_profile_score = this.getFatProfileScore();
    const protective_score = this.getProtectiveCompoundScore();
    const processing_level_score = 100 - 17 * this.processing_level;
    const hidx = this.getHIDX(
      sidx,
      ed,
      protein_score,
      fiber_score,
      sugar_score,
      fat_profile_score,
      salt_score,
      mnidx,
      processing_level_score,
      protective_score
    );
    return {
      hidx: Math.round(hidx),
      sidx: Math.round(sidx),
      fiber_score: Math.round(fiber_score),
      protein_score: Math.max(0, Math.min(110, Math.round(protein_score))),
      salt_score: Math.max(0, Math.min(100, Math.round(salt_score))),
      sugar_score: Math.max(0, Math.min(100, Math.round(sugar_score))),
      fat_profile_score: Math.round(fat_profile_score),
      mnidx: Math.max(0, Math.min(110, Math.round(mnidx))),
      ed: Math.round(ed),
      processing_level_score: Math.round(processing_level_score),
      protective_score: Math.round(protective_score),
    };
  }
}
