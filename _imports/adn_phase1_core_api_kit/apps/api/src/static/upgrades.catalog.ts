export function getUpgradeCatalog() {
  return [
    {
      key: "neural_rigs",
      name: "Neural Rigs",
      basePrice: 100,
      priceMultiplier: 1.18,
      incomePerLevel: 12,
      maxLevel: 100,
    },
    {
      key: "orbital_farms",
      name: "Orbital Farms",
      basePrice: 450,
      priceMultiplier: 1.21,
      incomePerLevel: 55,
      maxLevel: 100,
    },
    {
      key: "validator_mesh",
      name: "Validator Mesh",
      basePrice: 1200,
      priceMultiplier: 1.24,
      incomePerLevel: 160,
      maxLevel: 100,
    },
  ];
}
