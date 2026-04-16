export const DRAM_DB = {
  ddr5: {
    hynix: {
      "A-die": { scaling: "extreme", density: "16Gb", ranks: ["1R", "2R"], voltage: { daily: 1.4, max: 1.55 }, timings: { minCL: 26, trcdOffset: 6, trpOffset: 6, equalPrimary: false }, secondary: { trfcBase: 480, tfawBase: 20, trefi: { default: 32768, max: 65535 } }, behavior: { sweetspot: [6000, 7200] } },
      "M-die": { scaling: "high", density: "16Gb", ranks: ["1R", "2R"], voltage: { daily: 1.35, max: 1.45 }, timings: { minCL: 30, trcdOffset: 8, trpOffset: 8, equalPrimary: false }, secondary: { trfcBase: 520, tfawBase: 32, trefi: { default: 32768, max: 65535 } }, behavior: { sweetspot: [6000, 6800] } }
    },
    micron: {
      "Rev.A": { scaling: "medium", density: "16Gb", ranks: ["1R", "2R"], voltage: { daily: 1.35, max: 1.45 }, timings: { minCL: 36, trcdOffset: 8, trpOffset: 8, equalPrimary: false }, secondary: { trfcBase: 600, tfawBase: 48, trefi: { default: 32768, max: 65535 } }, behavior: { sweetspot: [5200, 5600] } },
      "Rev.E": { scaling: "low", density: "16Gb", ranks: ["1R", "2R"], voltage: { daily: 1.35, max: 1.5 }, timings: { minCL: 34, trcdOffset: 8, trpOffset: 8, equalPrimary: false }, secondary: { trfcBase: 620, tfawBase: 48, trefi: { default: 32768, max: 65535 } }, behavior: { sweetspot: [5600, 6200] } }
    },
    samsung: {
      "16Gb Rev.A": { scaling: "medium", density: "16Gb", ranks: ["1R", "2R"], voltage: { daily: 1.35, max: 1.45 }, timings: { minCL: 32, trcdOffset: 8, trpOffset: 8, equalPrimary: false }, secondary: { trfcBase: 580, tfawBase: 32, trefi: { default: 32768, max: 65535 } }, behavior: { sweetspot: [5600, 6400] } },
      "16Gb Rev.B": { scaling: "low", density: "16Gb", ranks: ["1R", "2R"], voltage: { daily: 1.3, max: 1.4 }, timings: { minCL: 36, trcdOffset: 10, trpOffset: 10, equalPrimary: false }, secondary: { trfcBase: 620, tfawBase: 32, trefi: { default: 32768, max: 65535 } }, behavior: { sweetspot: [4800, 5600] } }
    }
  },
  ddr4: {
    samsung: {
      "B-die": { scaling: "extreme", density: "8Gb", ranks: ["1R", "2R"], voltage: { daily: 1.45, max: 1.6 }, timings: { minCL: 14, trcdOffset: 0, trpOffset: 0, equalPrimary: true }, secondary: { trfcBase: 280, tfawBase: 16, trefi: { default: 16000, max: 65535 } }, behavior: { sweetspot: [3200, 4000] } }
    },
    hynix: {
      "DJR": { scaling: "high", density: "8Gb", ranks: ["1R", "2R"], voltage: { daily: 1.4, max: 1.55 }, timings: { minCL: 16, trcdOffset: 3, trpOffset: 3, equalPrimary: false }, secondary: { trfcBase: 400, tfawBase: 24, trefi: { default: 16000, max: 65535 } }, behavior: { sweetspot: [3600, 4600] } },
      "CJR": { scaling: "medium", density: "8Gb", ranks: ["1R", "2R"], voltage: { daily: 1.35, max: 1.45 }, timings: { minCL: 16, trcdOffset: 3, trpOffset: 3, equalPrimary: false }, secondary: { trfcBase: 450, tfawBase: 24, trefi: { default: 16000, max: 65535 } }, behavior: { sweetspot: [3200, 3800] } },
      "AFR": { scaling: "low", density: "8Gb", ranks: ["1R", "2R"], voltage: { daily: 1.35, max: 1.45 }, timings: { minCL: 16, trcdOffset: 4, trpOffset: 4, equalPrimary: false }, secondary: { trfcBase: 500, tfawBase: 32, trefi: { default: 16000, max: 65535 } }, behavior: { sweetspot: [2666, 3200] } },
      "MFR": { scaling: "low", density: "8Gb", ranks: ["1R", "2R"], voltage: { daily: 1.35, max: 1.4 }, timings: { minCL: 16, trcdOffset: 4, trpOffset: 4, equalPrimary: false }, secondary: { trfcBase: 550, tfawBase: 32, trefi: { default: 16000, max: 65535 } }, behavior: { sweetspot: [2133, 2933] } }
    },
    micron: {
      "E-die": { scaling: "high", density: "8Gb", ranks: ["1R", "2R"], voltage: { daily: 1.4, max: 1.5 }, timings: { minCL: 16, trcdOffset: 3, trpOffset: 3, equalPrimary: false }, secondary: { trfcBase: 500, tfawBase: 24, trefi: { default: 16000, max: 65535 } }, behavior: { sweetspot: [3200, 4000] } },
      "Rev.B": { scaling: "medium", density: "8Gb", ranks: ["1R", "2R"], voltage: { daily: 1.35, max: 1.45 }, timings: { minCL: 16, trcdOffset: 4, trpOffset: 4, equalPrimary: false }, secondary: { trfcBase: 550, tfawBase: 32, trefi: { default: 16000, max: 65535 } }, behavior: { sweetspot: [3000, 3600] } }
    }
  }
};
