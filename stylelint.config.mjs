export default {
  extends: ["stylelint-config-standard"],
  rules: {
    "declaration-block-single-line-max-declarations": null,
    // Component ancestors and responsive rules intentionally scope selector ordering.
    "no-descending-specificity": null,
    "import-notation": "string",
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: [
          "theme",
          "source",
          "utility",
          "custom-variant",
          "apply",
        ],
      },
    ],
    "color-function-notation": null,
    "alpha-value-notation": null,
    "selector-class-pattern": null,
    "custom-property-pattern": null,
  },
};
